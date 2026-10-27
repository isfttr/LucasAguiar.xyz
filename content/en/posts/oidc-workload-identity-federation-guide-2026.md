---
date: 2026-10-27T15:01:33-03:00
draft: true
title: "How to Replace CI/CD and Agent Secrets with OIDC Workload Identity Federation [2026]"
description: "Eliminate long-lived CI/CD secrets with OIDC workload identity federation. Step-by-step setup for GitHub Actions, GitLab, AWS, Azure, GCP and AI coding agents."
featured_image: ""
categories:
  - article
tags:
  - oidc
  - security
  - ci-cd
  - devops
  - github-actions
---

Long-lived secrets are the weakest link in modern CI/CD. An API key stored as a repository secret can leak through a third-party action, a log line, or a fork of a public repository — and once it leaks, the blast radius is your entire cloud account. In 2026 every major cloud and CI provider supports a better pattern: **OIDC workload identity federation**, where a pipeline job (or an AI coding agent) authenticates with a short-lived token minted from the identity of the workload itself. No secret to store, rotate, or leak.

This guide walks through how OIDC federation works, how to configure it for GitHub Actions and GitLab against AWS, Azure and GCP, and how the same mechanism now extends to AI coding agents — with the security rules that keep the whole setup safe.

## Why static secrets fail

The traditional approach stores a cloud access key in your CI system's secret store. It works until it doesn't:

- **Leaks are common.** Secrets end up in build logs, artifacts, and dependency caches. Malicious npm and PyPI packages routinely scan for them, so the window between a leak and an attempted takeover is measured in minutes.
- **Forks inherit them.** In GitHub Actions, pull requests from forks can execute workflows with access to secrets unless every job is carefully gated, and the GitHub token itself can be exfiltrated by third-party actions.
- **Rotation is manual.** A leaked key stays valid until someone notices and rotates it — often weeks later. There is no per-job revocation. GitHub's own [security hardening documentation](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect) has recommended OIDC as the default for cloud deployments for years.

If you still need plain secrets for third-party SaaS tools, our guide on [how to set up and use GitHub Secrets with containers]({{< relref "posts/how-to-setup-github-secrets/" >}}) covers that case. But for cloud IAM, federation is strictly better.

## How OIDC federation works, in 90 seconds

The flow is the same whether the workload is a GitHub Actions job or an AI agent (OpenID Connect is the authentication layer built on top of OAuth 2.0 — [how Connect works](https://openid.net/developers/how-connect-works/)):

1. The workload's **identity provider (IdP)** — GitHub Actions, GitLab, or an agent vendor — mints a short-lived JWT and exposes it to the workload, either as an environment variable or through a metadata endpoint.
2. The workload presents that token as a bearer token to the **relying party (RP)** — AWS, Azure, GCP, or an internal platform.
3. The RP fetches the IdP's public keys from its JWKS endpoint, verifies the signature, and checks claims such as `iss`, `aud`, `sub`, and `environment`.
4. If the checks pass, the RP issues its own scoped access (an IAM role session, a cloud token, or a federated identity).

The crucial properties: GitHub's OIDC tokens live for about **5 minutes** (compared with months or years for a static key), and every token carries per-run claims like the repository, branch, and environment — which lets you express access policies as precise conditions instead of "whoever holds this key."

For a production-grade description of exactly this pattern, Formal's engineering post — [Giving Cloud Agents Production Access with OIDC, Not Secrets](https://www.formal.ai/blog/cloud-agents-oidc-infrastructure/) — explains how they drove the number of long-lived secrets in their infrastructure to zero.

## GitHub Actions → AWS: the reference setup

This is the most common pairing, and the same shape applies everywhere else.

**Step 1 — Create the OIDC provider** in IAM, pointing at `token.actions.githubusercontent.com` with audience `sts.amazonaws.com`. The [AWS documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html) has the exact console steps, and [GitHub's AWS-specific guide](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services) mirrors them.

**Step 2 — Create a role whose trust policy only accepts the jobs you control**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:acme/web:environment:prod"
        }
      }
    }
  ]
}
```

The `sub` condition is what makes this secure: only the `main`-branch deploy workflow in `acme/web` that targets the `prod` environment can assume this role. Nothing else — not a fork, not a different repo, not a stray branch.

**Step 3 — Ask for a token in the workflow** and let `configure-aws-credentials` do the rest:

```yaml
permissions:
  id-token: write
  contents: read
steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123456789012:role/gh-oidc-prod
      aws-region: us-east-1
```

That's it. The pipeline now has temporary AWS credentials scoped to the exact IAM role — and nothing sensitive was ever written to the secret store.

## GitLab, Azure and GCP: same pattern

The mechanism is identical, only the configuration surface changes:

| Platform | How the token arrives | Docs |
|---|---|---|
| **GitLab CI** | `id_tokens` block per job, exposed as a file/variable | [GitLab OIDC ID token authentication](https://docs.gitlab.com/ee/ci/secrets/id_token_authentication.html) |
| **Azure** | Workload identity federation on an app registration or managed identity; the IdP URL is `https://token.actions.githubusercontent.com` | [Azure workload identity federation](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation) |
| **GCP** | Workload identity pool + provider; the GitHub token maps to a Google service account | [GCP workload identity federation](https://cloud.google.com/iam/docs/workload-identity-federation) |

GitLab exposes an `id_tokens` block per job with its own `aud` claim, and supports the same claim-based conditions (project, ref, and user) in its authorization rules.

## The same trick for AI coding agents

The most interesting 2026 development: the pattern now applies to *agents*, not just pipelines. Cloud coding agents like Cursor and Devin act as OIDC issuers themselves, which means you can give them auditable, policy-controlled, read-only access to production data through a platform like Formal — instead of pasting an API key or a database password into the agent's environment. Every call is tied to the agent identity plus attestable claims about the human who invoked it, and access can expire automatically.

This layers naturally on top of the two guides we already published: [how to safely run AI coding agents in a sandbox]({{< relref "posts/sandboxing-ai-coding-agents-guide-2026/" >}}) and [how to protect LLM API keys and inspect AI traffic]({{< relref "posts/llm-api-security-inspect-traffic-guide-2026/" >}}). Sandboxing contains the agent; OIDC federation makes sure that when it *does* reach your infrastructure, it arrives with a scoped, short-lived identity instead of a master key.

## Security rules of thumb

- **Pin the `sub` claim.** Prefer exact `repo:owner/name:ref:refs/heads/main` or `environment:prod` conditions. Wildcards like `repo:org/*` recreate the blast radius you're trying to eliminate.
- **Always set and check `aud`.** Audience scoping prevents token replay across different relying parties.
- **Never keep a "break-glass" static key.** A fallback path is a second attack surface; the emergency key is the one that leaks.
- **Watch the audit trail.** Monitor `AssumeRoleWithWebIdentity` events in CloudTrail (or the Azure/GCP equivalents) so you can answer "which job, which repo, which environment" for every access.
- **Treat tokens as bearer tokens.** They are short-lived, but they should still travel over TLS, and the IdP's JWKS should be refreshed on the provider side.

## Conclusion

Eliminating long-lived secrets from CI/CD is no longer aspirational — it is the default secure pattern in 2026, supported natively by GitHub Actions, GitLab, AWS, Azure, and GCP, and increasingly by AI agent platforms. Start with one cloud and one pipeline: create the OIDC provider, lock the trust policy to exact repo and environment claims, and delete the old access key. The same foundation will be waiting when you want to give your agents access too.

Also read:

- [How to Setup and Use GitHub Secrets with Containers and Internet-Facing Applications]({{< relref "posts/how-to-setup-github-secrets/" >}})
- [How to Safely Run AI Coding Agents: A Practical Sandboxing Guide [2026]]({{< relref "posts/sandboxing-ai-coding-agents-guide-2026/" >}})
- [LLM API Security in 2026: How to Inspect AI Traffic and Protect Your Keys]({{< relref "posts/llm-api-security-inspect-traffic-guide-2026/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
