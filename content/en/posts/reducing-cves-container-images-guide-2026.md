---
date: 2026-08-13T15:07:43-03:00
draft: true
title: "How to Reduce CVEs in Your Docker Images: Container Security Guide [2026]"
description: "Practical guide to reducing CVEs in Docker container images: scanning with Trivy and Grype, distroless and multi-stage builds, safe dependency bumps, backporting, and SBOMs. Includes commands and a CI checklist."
featured_image: ""
categories:
  - article
tags:
  - containers
  - docker
  - security
  - devops
  - homelab
---

It starts innocently enough. You pull a popular image, run `docker scan` or Trivy out of curiosity, and suddenly you are staring at a wall of red: hundreds of vulnerabilities in a container you built yesterday. The common reaction is panic, then dismissal — "it's just a base image, everyone runs this." Both reactions are wrong. Reducing CVEs in container images is not about reaching zero (that's rarely realistic), but about understanding where vulnerabilities come from and shrinking the attack surface systematically.

This guide is the practical playbook I wish I had when I started hardening my own self-hosted stack. It covers scanning, base image strategy, dependency bumps, the hard cases that need backporting, and supply-chain tooling — with real commands you can run today.

## Why container images accumulate CVEs

A container image is not a single artifact; it's a stack of layers, each with its own dependency tree. The default images most people use carry three distinct sources of risk:

1. **The OS layer.** Images like `node:22-slim` are built on Debian — in this case, Debian 12 (bookworm). The distro ships thousands of packages, and a long tail of OS-level vulnerabilities comes with them. Every `apt-get install` in your Dockerfile adds more surface.
2. **Application dependencies.** Your `package.json`, `requirements.txt`, or `go.mod` pulls in libraries that are frequently a major-version jump away from the fixed release. Scanners flag these even when the installed version "works fine."
3. **Build leftovers.** Multi-stage builds done wrong leave compilers, debug symbols, and package managers in the final image — tools that are useless at runtime but extremely useful to an attacker.

A concrete illustration from August 2026: when the team behind [Echo and NanoClaw published their under-the-hood collaboration post](https://www.echo.ai/blog/echo-xnanoclaw-under-the-hood), they showed that scanning NanoClaw's default image (built on `node:22-slim`) with independent scanners — Trivy, Grype, and Wiz — surfaced **1,400 CVEs**. After stripping out the Chromium-related ones that were safe to bump, roughly **600 vulnerabilities still needed real work**. That is not an outlier; it's the normal state of a typical Node image in 2026.

## Step 1: Scan everything, in CI, every build

You cannot fix what you cannot see. The baseline is a vulnerability scanner wired into your build pipeline, not a manual command you run when you remember.

**Trivy** ([trivy.dev](https://trivy.dev/), [GitHub](https://github.com/aquasecurity/trivy)) is the de facto standard — fast, supports OS packages, language-specific dependencies, IaC, and SBOMs, and has a clear severity model:

```bash
# Scan a local image (default: all severities, OS + language deps)
trivy image myapp:latest

# Fail CI on critical/high, ignore known-unfixable for now
trivy image --exit-code 1 --severity CRITICAL,HIGH myapp:latest

# Scan a Dockerfile before you even build
trivy fs --scanners misconfig .
```

**Grype** ([github.com/anchore/grype](https://github.com/anchore/grype)) is the other solid option, especially if you're already in the Anchore/Syft ecosystem. The Echo post is a good reminder to use **more than one scanner**: independent databases catch different things, and cross-checking results is cheap.

**Docker Scout** ([docs.docker.com/scout](https://docs.docker.com/scout/)) is worth knowing if you're already in Docker Hub — it adds policy evaluation and fix recommendations directly in the Docker workflow, and its `docker scout cves` command gives quick triage.

For a homelab, the minimum viable setup is a cron job or a CI step that scans every image you publish and alerts on new criticals. For anything public, `--exit-code 1` on critical/high should be a hard gate. If you self-host your services, remember that scanning also applies to the images you *pull* — check out our guide on [detecting and blocking bot traffic on self-hosted sites]({{< relref "posts/detect-block-bot-traffic-selfhosted-guide-2026/" >}}) for the adjacent problem of who's knocking on your exposed services.

## Step 2: Shrink the base image

The single most effective structural change is switching from fat distro-based images to minimal or distroless ones. Fewer packages in the base means fewer packages to patch.

- **Distroless images** ([github.com/GoogleContainerTools/distroless](https://github.com/GoogleContainerTools/distroless)) contain only your runtime and its direct dependencies — no shell, no package manager, no compilers. They're maintained by Google and available for Node, Python, Java, Go, and more.
- **`scratch`** is the ultimate minimal base for statically compiled binaries (Go and Rust are the classic fits). You control everything, so you know exactly what's inside.
- **Alpine** is a pragmatic middle ground: small, has a package manager for when you need it, but uses musl instead of glibc — test your app before assuming compatibility.

The technique that makes minimal bases possible is the **multi-stage build** ([docs.docker.com/build/building/multi-stage/](https://docs.docker.com/build/building/multi-stage/)): compile and install dependencies in a full builder stage, then copy only the runtime artifacts into a slim final stage:

```dockerfile
# Stage 1: build
FROM node:22-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: runtime — no node_modules dev deps, no build tools
FROM gcr.io/distroless/nodejs22-debian12
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER nonroot
CMD ["dist/server.js"]
```

Notice the `USER nonroot` line — running as root inside a container is one of the most common (and cheapest to fix) security mistakes. Combine minimal base + non-root + read-only rootfs (`--read-only` at runtime) and you've eliminated most of the easy attack paths.

## Step 3: Bump dependencies on a schedule — but know the three tiers

Once scanning is continuous, you'll find that fixes fall into three tiers, exactly as the NanoClaw team described:

**Tier 1 — Safe bumps.** Libraries known for backward compatibility (Chromium is the canonical example) can be upgraded with confidence. Automate these with Renovate or Dependabot and merge them quickly. Most of your CVE count lives here, and most of it is cheap to fix.

**Tier 2 — Major-version jumps.** The scanner says "fixed in v3, you're on v1." Before you undertake a risky upgrade, verify the fix: sometimes the patched commit exists in a much closer version than the scanner's database knows about. The NanoClaw team found the Hono `node-server` fix was available in 1.19.14 even though scanners weren't aware of it yet — and contributed it to the advisory. Always check the upstream repository before assuming you need the big jump.

**Tier 3 — Won't-fix and backports.** Distro maintainers often fix only in new major versions, or mark a CVE as won't-fix for an older release. This is where you either accept the risk (documented and monitored), vendor the package, or **backport** the patch — applying a fix from a newer version onto the version your app requires.

Backporting is genuinely hard. A great example from the Echo post is [CVE-2025-59375 in expat](https://www.echo.ai/blog/echo-xnanoclaw-under-the-hood): a ~250 KiB XML document could cause ~800 MiB of allocation — a 3,300x amplification leading to memory exhaustion. The existing billion-laughs defense measured parsed output bytes, not actual heap usage, so the fix had to introduce real allocation accounting threaded through `expat_malloc`/`expat_free` and change signatures across a dozen internal functions. That's not a one-line cherry-pick; it's a subsystem-level change. If you don't have the capacity to do that, your options are a distro that backports for you (see below) or accepting and tracking the risk.

## Step 4: Choose bases that get patched for you

The reason the NanoClaw image started at 1,400 CVEs is that Debian 12 base images carry a long tail of OS-level vulnerabilities, and standard distro backporting is slow. Alternatives exist:

- **Chainguard Images** ([edu.chainguard.dev](https://edu.chainguard.dev/)) — minimal, distroless-style images with near-zero CVEs by design, rebuilt continuously, with SBOMs included by default. For many runtimes they're a drop-in replacement.
- **Echo OS** (from the same company behind the NanoClaw post) — a distro built from source so every package can be continuously patched; the team claims to have eliminated 1.1M+ CVEs across their packages. It's the heavy-artillery option for organizations that need to get customer-facing scans to zero.

For homelab and small projects, Chainguard (or distroless + your own updates) is usually the right scale. The trade-off is control: minimal images mean you can't `apt-get install` your way out of a missing tool, so your Dockerfile discipline matters more.

## Step 5: SBOMs and supply-chain hygiene

Scanning your image tells you what's inside *now*. An **SBOM** (Software Bill of Materials) tells you what's inside, reproducibly, so you can audit changes and respond to new CVEs by looking up "which of my images ship this package?"

- **Syft** (from the Grype team) generates SBOMs in multiple formats; Trivy can also produce them.
- **`cosign`** ([sigstore.dev](https://www.sigstore.dev/)) signs your images, and **cosign attest** can attach the SBOM as an attestation, so consumers can verify both *who* built the image and *what* is in it.
- **osv-scanner** ([github.com/google/osv-scanner](https://github.com/google/osv-scanner)) uses the OSV database to scan projects and lockfiles, and pairs well with CI.

A pragmatic supply-chain baseline: generate an SBOM on every build, sign releases you publish, and pin base images by digest (`node:22-slim@sha256:...`) so "latest" can't drift under you. Pinning by digest is the single highest-leverage habit for reproducible and auditable images.

## The practical checklist

| Step | Tool / technique | When |
|------|------------------|------|
| Scan images | Trivy or Grype | Every build (CI gate on CRITICAL/HIGH) |
| Cross-check | Second scanner (Grype + Trivy) | Periodic / before release |
| Reduce base | Distroless, scratch, or Alpine | Image redesign |
| Multi-stage build | Docker multi-stage | Every Dockerfile |
| Non-root user | `USER nonroot` + read-only rootfs | Every image |
| Auto-bump deps | Renovate / Dependabot | Continuous |
| Verify fixes | Check upstream repo, not just scanner DB | Tier-2 jumps |
| SBOM | Syft / Trivy sbom + cosign attest | Every release |
| Pin by digest | `image@sha256:...` | Every base image |

## What to watch next

Container security in 2026 is moving toward **policy-as-code for images** (Trivy's misconfiguration scanning, Docker Scout policies) and **attestation-driven supply chains** (Sigstore becoming the default for signed, SBOM-attached images). For self-hosters, the practical frontier is the same as for everyone else: shrink the base, automate the scans, and treat "the image works" and "the image is known-good" as two different things that both need to be true.

If you're still deciding between containers and VMs for your workload, our [Docker Containers vs Virtual Machines comparison guide]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}}) covers the isolation and density trade-offs that interact with security choices. And for the API side of your stack — including inspecting what your AI tools send to LLM providers — see the [LLM API security guide]({{< relref "posts/llm-api-security-inspect-traffic-guide-2026/" >}}).

Also read:

- [Docker Containers vs Virtual Machines: Complete Comparison Guide [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [LLM API Security in 2026: How to Inspect AI Traffic and Protect Your Keys]({{< relref "posts/llm-api-security-inspect-traffic-guide-2026/" >}})
- [How to Detect and Block Bot Traffic on Your Self-Hosted Website [2026]]({{< relref "posts/detect-block-bot-traffic-selfhosted-guide-2026/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
