---
date: 2026-08-20T15:06:00-03:00
draft: true
title: "How to Protect Against Malicious Packages: npm, PyPI, and Cargo Supply Chain Security [2026]"
description: "Complete guide to defending against malicious packages in npm, PyPI and crates.io: typosquatting, account takeover, build-time payloads, audit tools and lockfile hygiene. Includes the August 2026 arrayref incident."
featured_image: ""
categories:
  - article
tags:
  - supply-chain
  - security
  - npm
  - python
  - rust
  - devops
---

On August 20, 2026, a compromised release of the popular Rust crate `arrayref` appeared on crates.io. Version 0.3.10 added a dependency on a typosquatted crate called `proc-macro1`, whose build script downloads and runs a remote binary every time a project compiles. No code review of your own source would have caught it: the payload executed at build time, before a single test ran.

This is not a Rust problem or a crates.io problem. The same attack patterns — typosquatting, account takeover, and build-time payloads — hit npm and PyPI every month. This guide explains how these attacks work and what you can actually do to protect your projects, with concrete tooling for the three biggest ecosystems.

## Anatomy of the arrayref incident (August 2026)

The [SafeDep report on the arrayref incident](https://safedep.io/arrayref-proc-macro1-rust-build-time-malware/) is worth reading in full, but the mechanics are a masterclass in supply chain abuse:

- The legitimate `arrayref` maintainer account (`droundy`) was compromised. Malicious versions were pushed for `arrayref` 0.3.10, `internment` 0.8.7 and `append-only-vec` 0.1.9.
- `arrayref` 0.3.10 added a single line to `Cargo.toml`: a dependency on `proc-macro1`, a typosquat of the real `proc-macro2` crate that macro authors actually depend on. The fake crate even forged `authors = ["David Tolnay"]` to impersonate the well-known `dtolnay` account.
- The payload lived in `proc-macro1`'s `build.rs`. It reassembled a base64-obfuscated URL, fetched an architecture-specific binary over TLS (accepting any certificate), and ran it detached from the build — dropping `/tmp/rust-setup` on Unix and a hidden PowerShell/VBScript pair under `%TEMP%` on Windows.
- The attacker **yanked** the older `arrayref` releases 0.3.5–0.3.9. Cargo then printed "consider updating to a version that is not yanked", nudging developers toward the only non-yanked release: the malicious 0.3.10.
- `arrayref` is a transitive dependency of `tiny-skia`, `sctk-adwaita` and `winit`, which puts it under most GUI work built on `egui`, `eframe` and `iced`. The crate has roughly 245 million all-time downloads.

The crates.io team removed the malicious versions and the [RustSec advisory database](https://github.com/rustsec/advisory-db) published advisory #3161. But the damage window is the point: from publication to removal, every clean build of affected projects silently executed the payload.

## The attack vectors you need to know

**Typosquatting.** Attackers publish packages with names one character away from popular ones (`proc-macro1` vs `proc-macro2`, `requests` vs `requets`). The name is the bait; the payload is often a build/install script.

**Account takeover.** Credential stuffing, leaked tokens, or weak 2FA let attackers publish malicious versions under a trusted name. This is how `arrayref` was hit. PyPI has documented [account takeover campaigns](https://blog.pypi.org/) targeting maintainers.

**Dependency confusion.** An attacker uploads a package with the same name as an internal, private package to the public registry. Build systems misconfigured to prefer the public registry resolve to the attacker's version instead of yours. [Russ Cox's classic writeup](https://research.swtch.com/deps) explains the full taxonomy of these attacks.

**Build-time and install-time payloads.** The code that runs during `npm install`, `pip install` or `cargo build` is arbitrary code execution, full stop. Legitimate packages use hooks for compilation; malicious ones use them for downloads. The [XZ Utils backdoor](https://en.wikipedia.org/wiki/XZ_Utils_backdoor) showed the same principle at the distro level.

**Protestware and sabotage.** Maintainers can flip a package to destructive behavior at any time (the `colors`/`faker` incident being the canonical case). Good behavior today is no guarantee for tomorrow.

## Defense in depth: what actually works

No single tool stops all of this. The practical baseline is lockfiles + audits + registry hygiene + verified publishers.

### 1. Commit and respect your lockfiles

Lockfiles pin the exact resolved versions of every transitive dependency. If you don't commit them, every install can silently drift to a new — possibly malicious — release.

- **npm/pnpm/yarn:** commit `package-lock.json` / `pnpm-lock.yaml` / `yarn.lock`. Use `npm ci` in CI instead of `npm install` (it installs strictly from the lockfile).
- **Python:** commit `requirements.txt` with pinned hashes or a `poetry.lock` / `uv.lock`. pip's `--require-hashes` mode refuses to install any package whose hash isn't declared.
- **Cargo:** `Cargo.lock` is committed by default for binaries. Don't exclude it. Note that lockfiles alone did **not** stop the arrayref attack — the malicious release was the only non-yanked version, so lockfile resolution picked it up anyway. Lockfiles reduce drift; they don't remove trust in the registry.

### 2. Run audit tooling on every build

| Ecosystem | Tool | What it checks |
|---|---|---|
| npm | [`npm audit`](https://docs.npmjs.com/cli/v10/commands/npm-audit) | Known vulnerabilities in the dependency tree against the npm advisory database |
| Python | [`pip-audit`](https://pypi.org/project/pip-audit/) | Vulnerabilities in installed or declared packages against OSV/PyPI advisories |
| Python (Poetry) | [`poetry audit`](https://python-poetry.org/docs/cli/#audit) | Same class of checks, integrated with Poetry |
| Rust | [`cargo audit`](https://github.com/RustSec/rustsec) | Vulnerabilities from the [RustSec advisory database](https://github.com/rustsec/advisory-db) — this is what flagged the arrayref incident |
| All | [OSV-Scanner](https://github.com/google/osv-scanner) | Scans lockfiles across ecosystems against [osv.dev](https://osv.dev/), the aggregated open-source vulnerability database |

Wire these into CI as blocking gates, not informational reports. A failing audit should fail the build.

### 3. Enable registry security features

- **PyPI:** require **Trusted Publishers** for publishing (short-lived tokens instead of long-lived API keys) and enforce **2FA** for all maintainer accounts. PyPI has been pushing mandatory 2FA for critical projects precisely because account takeover is the dominant attack.
- **npm:** use **provenance** (`npm publish --provenance`) so published packages carry signed attestations linking them to the source repo and CI run. Dependabot alerts on GitHub will surface known-vulnerable dependencies automatically — [set them up](https://docs.github.com/en/code-security/dependabot/dependabot-alerts/about-dependabot-alerts) for every repository.
- **crates.io:** verify the publisher of any new dependency. In the arrayref case, a one-minute check of `proc-macro1`'s author field and repository link (both forged) was the tell.

### 4. Vet new dependencies before adding them

- **Check the publisher:** account age, other packages published, whether the repository actually exists and matches the stated owner.
- **Check download counts and first-release date.** A "popular-looking" package published last week with 10M downloads is a red flag, not a green one.
- **Prefer well-known, actively maintained packages.** Every dependency is a permanent trust commitment.
- **Minimize dependencies.** Each transitive dependency is another account that can be compromised, another build script that can run on your machine.

### 5. Harden your CI/CD

CI runners have network access and often hold secrets — a poisoned dependency in CI is a credential theft opportunity. Use ephemeral runners, least-privilege tokens, and scan your GitHub Actions workflows with tools like [zizmor](https://github.com/woodruffw/zizmor), which detects vulnerable action patterns. GitHub's [supply chain security documentation](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-supply-chain-security) is a good map of the built-in features (Dependabot, secret scanning, SBOMs, attestations).

### 6. What to do if you're affected

If an incident touches your dependency tree:

1. **Identify exposure:** check your lockfile for the affected version range; search for the known indicators of compromise (in the arrayref case: network connections to `23.254.165.112`, files `/tmp/rust-setup` or `%TEMP%\rust-setup.ps1`).
2. **Isolate:** assume anything the compromised build touched is compromised — that includes build caches, CI artifacts and local environments.
3. **Rotate credentials** that existed on the affected machines/CI runners.
4. **Update to a clean version** and pin it. Audit your lockfile after the fix and re-run the full pipeline.

## The honest bottom line

The arrayref incident shows that even a well-known crate with hundreds of millions of downloads can ship malware through a compromised maintainer account. The defenses that matter are the boring ones: committed lockfiles, blocking audit gates in CI, 2FA and trusted publishers on registry accounts, and a habit of checking who actually published the packages you depend on. Supply chain security is not a tool you install once — it's a review step you repeat on every dependency you add, forever.

Read also:

- [How to Reduce CVEs in Your Docker Images: Container Security Guide [2026]]({{< relref "posts/reducing-cves-container-images-guide-2026/" >}})
- [How to Setup and Use GitHub Secrets with Containers and Internet-Facing Applications]({{< relref "posts/how-to-setup-github-secrets/" >}})
- [GitLost [2026]: How Prompt Injection in GitHub's AI Agent Leaks Private Repos]({{< relref "posts/gitlost-github-agentic-workflows-prompt-injection-2026/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
