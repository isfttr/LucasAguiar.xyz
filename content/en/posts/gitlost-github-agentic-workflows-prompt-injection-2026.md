---
date: 2026-07-08T15:11:36-03:00
draft: false
title: "GitLost [2026]: How Prompt Injection in GitHub's AI Agent Leaks Private Repos"
description: "GitLost vulnerability lets attackers silently leak private repos via prompt injection in GitHub Agentic Workflows. Full technical breakdown and what it means for AI security."
featured_image: ""
categories:
  - article
tags:
  - ai
  - security
  - github
  - dev
  - prompt-injection
---

On July 6, 2026, Noma Labs disclosed **GitLost**, a critical prompt injection vulnerability in GitHub's new **Agentic Workflows** feature. The attack allows an unauthenticated attacker to silently exfiltrate data from private repositories — simply by posting a crafted GitHub Issue in a public repository belonging to the same organization.

At 445 points on Hacker News and climbing, this is one of the most significant AI security stories of the month. Here is what happened, how it works, and what it means for anyone running AI agents on their code.

## The GitLost Vulnerability

The root cause is textbook **indirect prompt injection**, a class of attack where an adversary hides malicious instructions inside content the AI agent reads. The agent treats that content as trusted instructions and follows them, even when they conflict with the operator's intent.

Noma Labs discovered a workflow configured to:

- Trigger on `issues.assigned` events
- Read the issue title and body
- Post a comment using the `add-comment` tool
- Run with read access to other repositories (public and private) in the same organization

The attacker needs **no coding skills, no access, and no credentials**. Just open an issue in any public repository belonging to an organization using GitHub Agentic Workflows, embed hidden instructions in the issue body, and wait.

### The Attack Flow

1. The attacker creates a GitHub issue that looks completely innocent — for example, a plausible feature request from a fictional VP Sales.
2. Embedded in the body: instructions telling the agent to read `README.md` from every repository it can access, then post the contents back as a comment.
3. When a GitHub automation assigns the issue, the workflow triggers the agent.
4. The agent fetches the issue body, reads the hidden instructions, and follows them.
5. The agent reads sensitive data from private repositories and posts it to the public issue thread.
6. The attacker collects the leaked data.

Noma Labs confirmed the attack worked against both public and private repositories in the same organization. The proof of concept is publicly available: the [workflow run](https://github.com/sasinomalabs/poc/actions/runs/23909666039) shows the agent reading and leaking `README.md` from private repos.

## Prompt Injection as the New SQL Injection

The security community has been warning about prompt injection in agentic systems for years.  The article from Noma Labs draws the analogy perfectly: prompt injection has become to agentic AI what **SQL injection** was to web applications — a systematic, category-wide vulnerability class that requires systematic defenses. In traditional web security, every input was untrusted until validated. In agentic AI, every piece of content the agent reads must be treated as potentially adversarial.

GitHub's Agentic Workflows are particularly dangerous because:

- **The agent has cross-repository access** — a single workflow can read from public *and* private repos in the organization
- **The agent can post publicly** — exfiltrated data appears as comments on issues anyone can see
- **The trigger surface includes external events** — anyone can create an issue in a public repo

## Sensible recommendations

Noma Labs responsibly disclosed GitLost to GitHub before publication. The vulnerability details are shared with GitHub's knowledge. For teams using (or considering) GitHub Agentic Workflows:

1. **Scope permissions to the minimum** — do not give agents cross-repository read access unless absolutely necessary. An agent that can read every repo is a single prompt injection away from leaking all of them.
2. **Restrict public posting** — agents should not be able to post comments containing data that could include sensitive content.
3. **Sanitize user input** — isolate user-controlled content (issue bodies, comments, PR descriptions) from the agent's instruction context.
4. **Monitor agent behavior** — unexpected comments on issues, especially those containing file contents, should trigger alerts.
5. **Treat agent context as attack surface** — every file, comment, and issue the agent reads is a potential vector. Review your workflows with the assumption that any content could be adversarial.

## Conclusion

GitLost is the canary in the coal mine for agentic AI security. As more platforms ship autonomous agents that read, write, and execute based on natural language instructions, the attack surface expands exponentially. The security model that worked for deterministic CI/CD pipelines — YAML files, explicit permissions, no "interpretation" — does not transfer to agentic workflows.

For now, the best defense is skepticism: every input the agent reads could be an attack, and every tool it can call is a liability. Scope aggressively, monitor relentlessly, and assume your agent will read something it should not. Because eventually, someone will write an issue that exploits exactly that.

Read also:

- [Why I'm Breaking Up With Vibe Coding]({{< relref "posts/vibe-coding-pitfalls/" >}})
- [Claude Sonnet 5: Anthropic's Most Agentic AI Model Arrives at a Reduced Price [2026]]({{< relref "posts/claude-sonnet-5-2026/" >}})
- [Why I'm Breaking Up With Vibe Coding]({{< relref "posts/vibe-coding-pitfalls/" >}})

---

