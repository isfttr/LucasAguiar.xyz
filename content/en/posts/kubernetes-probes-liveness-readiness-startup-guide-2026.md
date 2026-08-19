---
date: 2026-08-19T15:08:12-03:00
draft: true
title: "Kubernetes Health Probes Explained: Liveness, Readiness & Startup [2026]"
description: "Complete guide to Kubernetes health probes: liveness vs readiness vs startup, real YAML examples, common misconfigurations, and how probes prevent restart loops and dropped traffic during rollouts."
featured_image: ""
categories:
  - article
tags:
  - kubernetes
  - devops
  - homelab
  - containers
  - observability
---

Kubernetes health probes — liveness, readiness, and startup — are the mechanism that tells the cluster whether a container is actually healthy, not just running. Get them wrong and you get restart loops that take hours to recover from, traffic dropped during rollouts, or pods that stay "Ready" while serving errors. Get them right and the cluster self-heals without human intervention. This guide explains how each probe type works, how to configure them with real YAML, and the misconfigurations that bite most people.

## Why probes exist: "Running" is not "Ready"

When a container starts, the kubelet marks it Ready almost immediately — even if the application inside is still initializing, connecting to a database, or loading models. The container is running, but it cannot serve traffic yet. Without probes, Kubernetes has no way to know the difference.

This is a classic failure mode in homelabs and small clusters: you restart a pod (or a node drains it), and for the seconds or minutes it takes the app to boot, requests fail even though the pod reports Ready. Probes close that gap by making the kubelet actively check container health.

There are three probe types, each answering a different question:

- **Startup probe** — has the application inside the container finished starting?
- **Readiness probe** — is the application ready to receive traffic?
- **Liveness probe** — does the application need to be restarted?

## The three probe types

### Startup probes

A startup probe protects slow-booting applications from being killed by the liveness probe. If your app takes 60 seconds to initialize, and your liveness probe has `periodSeconds: 10` with `failureThreshold: 3`, the liveness probe will kill the container after 30 seconds — before it ever finishes booting.

The startup probe runs first, and while it is failing, liveness and readiness probes are disabled. Once the startup probe succeeds, the kubelet hands over to the regular probes. A typical configuration for an app that needs ~30 seconds to boot:

```yaml
startupProbe:
  httpGet:
    path: /health/startup
    port: 8080
  periodSeconds: 5
  failureThreshold: 6   # 5s x 6 = 30s budget before the container is killed
```

Use `exec` probes (`exec: { command: ["sh", "-c", "..."] }`) when the app has no HTTP endpoint yet during boot, and `tcpSocket` when it only needs to open a port.

### Readiness probes

A readiness probe decides whether a pod receives traffic through Services and EndpointSlices. When the probe fails, the pod is removed from the Service's endpoints — traffic stops flowing to it — but the container is **not** restarted. This is the correct tool for transient states like "still loading cache" or "database temporarily unreachable".

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  periodSeconds: 10
  failureThreshold: 3
  successThreshold: 1
```

`successThreshold` matters here: for readiness, Kubernetes waits for `successThreshold` consecutive successes before marking the pod Ready again. For liveness it must always be 1.

### Liveness probes

A liveness probe answers "is this process deadlocked or stuck?" When it fails, the kubelet kills the container and restarts it according to the restart policy (with `CrashLoopBackOff` backoff after repeated crashes). It should check something that fails only when the app is truly stuck — a deadlock, an infinite loop, a corrupted internal state.

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  periodSeconds: 10
  failureThreshold: 3
```

The classic mistake is pointing the liveness probe at a dependency (database, cache, external API). If the database blips for 40 seconds, the liveness probe fails, Kubernetes restarts the container, and now you have an app that restarts in a loop — making the outage worse, not better. Dependencies belong in readiness probes, not liveness.

## Probe mechanics: kubelet, thresholds, and backoff

Probes are executed by the **kubelet**, the agent running on every node. Each probe fires every `periodSeconds` (default 10s), and fails after `failureThreshold` (default 3) consecutive failures. Status codes 200–399 count as success for `httpGet` probes; everything else is a failure. A `tcpSocket` probe succeeds if the connection opens; an `exec` probe succeeds on exit code 0.

The `initialDelaySeconds` field (how long to wait after the container starts before probing) still exists, but for slow apps the startup probe is the modern, more reliable replacement — it gives a dynamic window instead of a guess.

When a liveness probe fails repeatedly, Kubernetes enters `CrashLoopBackOff`: the restart delay starts at 10 seconds and doubles with each crash up to a maximum of 5 minutes. A pod stuck in this state shows `CrashLoopBackOff` in `kubectl get pods`, and debugging it is a well-known homelab rite of passage — check `kubectl logs` and `kubectl describe pod` first.

## Common misconfigurations (and how to avoid them)

The ngrok engineering team published a deep dive on probes in August 2026 that walks through these failure modes with an interactive simulated cluster — worth reading if you want to see the restart-loop problem play out in real time.

1. **Liveness probe that checks dependencies.** Database slow → container restarted → all replicas restart → outage. Keep liveness checks cheap and local to the process.
2. **Missing readiness probe during rollouts.** During a rolling update, old pods are terminated as new ones come up. Without readiness probes, the new pods accept traffic before they can serve it, and you drop requests on every deploy.
3. **Liveness `failureThreshold` too tight for slow startups.** Fixed with a startup probe, not by loosening the liveness probe.
4. **Unbounded checks.** A `/healthz` endpoint that does a full database query on every probe (default: every 10 seconds, per pod) can hammer your database at scale. Keep probe endpoints cheap.
5. **Same endpoint for everything.** A single `/healthz` that returns 200 regardless of state tells the cluster nothing. Different endpoints (or different logic) for startup, readiness, and liveness give Kubernetes the information it actually needs.

## Probes in homelab Kubernetes (k3s, k0s, MicroK8s)

Lightweight distributions like k3s, k0s, and MicroK8s implement the same probe semantics as full Kubernetes — the kubelet behavior is identical. The practical difference in a homelab is scale and resources: every probe is an extra HTTP request per pod every few seconds, trivial at homelab scale, but it still pays to keep probe endpoints cheap, especially on Raspberry Pi-class nodes.

If you run Kubernetes alongside other [containers and virtual machines on the same host]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}}), remember that a node that runs out of memory (OOM) kills pods regardless of probes — probes can't fix resource limits. And if you self-host LLM inference on an old server, [the same hardware constraints]({{< relref "posts/run-llms-old-server-homelab-guide-2026/" >}}) apply to probe design: slow model loading is exactly what startup probes are for.

## Best practices checklist

- Always define a **readiness probe** for anything behind a Service or Ingress — otherwise rollouts drop traffic.
- Use a **startup probe** for any app that takes more than ~10 seconds to boot; don't loosen the liveness probe to compensate.
- Keep **liveness probes** local to the process, cheap, and fast. Never point them at external dependencies.
- Prefer `httpGet` with a dedicated health endpoint over `tcpSocket` — a port being open doesn't mean the app is healthy.
- Set `periodSeconds` consciously: 10s is the default for good reason; 1s is almost never justified.
- Verify with `kubectl describe pod` and `kubectl get events` — probe failures show up there immediately.

Also read:

- [Docker Containers vs Virtual Machines: Complete Comparison Guide [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [PostgreSQL Performance Best Practices for Homelab and Self-Hosted [2026]]({{< relref "posts/postgresql-performance-best-practices-homelab-2026/" >}})
- [How to Run LLMs on Old Server Hardware: A Practical Homelab Guide [2026]]({{< relref "posts/run-llms-old-server-homelab-guide-2026/" >}})

---

You can reach out to talk about this and other topics at <contact@lucasaguiar.xyz>
