---
date: 2026-07-28T15:05:25-03:00
draft: true
title: "SPF, DKIM, and DMARC: Complete Email Authentication Guide [2026]"
description: "Step-by-step guide to configuring SPF, DKIM, and DMARC for your domain in 2026. Includes DNS record examples, troubleshooting common failures, and understanding DMARC reports. With 68% of domains still not enforcing DMARC, secure your email today."
featured_image: ""
categories:
  - article
tags:
  - email
  - security
  - linux
  - homelab
  - devops
---

You just finished setting up your own mail server — or you finally decided to stop sending emails from `contact@yourdomain.com` through a generic SMTP relay without any authentication. Either way, you have three DNS records to configure before your emails stop landing in spam folders or getting rejected outright.

This guide walks through SPF, DKIM, and DMARC from configuration to verification. No fluff, just what each protocol does, how to set it up, and how to read the reports.

## The Three Layers of Email Authentication

Email was designed in an era when everyone on the internet was trustworthy. There was no authentication baked into SMTP — anyone could send emails claiming to be from anyone else. That's why we now need three separate standards bolted on top.

| Standard | RFC | Year | What It Does | Weakness |
|----------|-----|------|-------------|----------|
| **SPF** | RFC 7208 | 2006 (orig. 2002) | Lists which IPs are allowed to send mail for your domain | Fails with forwarded email; only checks envelope, not header |
| **DKIM** | RFC 6376 | 2007 (orig. 2004) | Cryptographically signs the email headers/body | Complex key management; doesn't tell receivers what to do if the signature fails |
| **DMARC** | RFC 7489 | 2012 | Tells receivers what to do when SPF or DKIM fail, and sends you reports | Pointless without SPF and DKIM working first |

You need all three. SPF alone, DKIM alone, or both without DMARC still leaves your domain unprotected against exact-domain spoofing.

Why? SPF only checks the envelope sender (the `MAIL FROM` address in the SMTP handshake), not the visible `From:` header in the email body. DKIM signs the visible header but has no policy layer — a receiver might accept or reject a failing signature based on their own local policy, which varies wildly between providers. DMARC bridges them by aligning SPF and DKIM results with the visible `From:` domain and instructing receivers on a unified policy.

## Step 1: SPF — Who Is Allowed to Send

SPF (Sender Policy Framework) is a DNS TXT record that declares which IP addresses or hostnames are authorized to send email on behalf of your domain.

### The SPF Record Syntax

A typical SPF record looks like this:

```
v=spf1 mx include:_spf.google.com ~all
```

Let's break that down:

- `v=spf1` — version identifier
- `mx` — allow the domain's MX servers to send mail
- `include:_spf.google.com` — delegate authorization to Google's SPF record (for Google Workspace users)
- `~all` — soft-fail for any other sender (mark it as suspicious but don't reject)

The last mechanism is critical. You have three options:

| Qualifier | Meaning | DNS Code |
|-----------|---------|----------|
| `+all` | Allow all — wide open | Never use this |
| `-all` | Hard fail — reject unauthorized senders | Strict |
| `~all` | Soft fail — mark as suspicious | Recommended for testing |
| `?all` | Neutral — no policy | Useless in practice |

### Building Your SPF Record

1. **Identify all senders**: List every service that sends emails using your domain — Google Workspace, Mailchimp, SendGrid, your own mail server, your web host's PHP mail() function.

2. **Find each sender's SPF include**: Most email services publish a guide. Common ones:
   - **Google Workspace**: `include:_spf.google.com`
   - **Microsoft 365**: `include:spf.protection.outlook.com`
   - **SendGrid**: `include:sendgrid.net`
   - **Mailchimp**: `include:servers.mcsv.net`
   - **Amazon SES**: `include:amazonses.com`
   - **Zoho**: `include:zoho.com`

3. **Limit includes**: The DNS lookup limit is 10 (includes, mx, ptr, and a mechanisms each count). Exceed it and SPF returns **permerror** — which means all mail could be rejected by strict receivers.

```bash
# Check your current SPF record
dig +short TXT yourdomain.com | grep "v=spf1"
```

### Common SPF Pitfalls

- **Forwarded email breaks SPF**: When Gmail forwards your email to Yahoo, the forwarding server's IP likely isn't in your SPF. The forwarded message fails SPF. This is normal — DKIM (which survives forwarding) and DMARC alignment handle this case.
- **Too many lookups**: Each `include:` uses a DNS lookup. Services like Mailchimp add 1 lookup. If you have 10+ includes, your SPF record is invalid. Consolidate or use subdomains.
- **Missing IPv6**: If your mail server supports IPv6, add `ip6:2001:db8::/32` to your record. Many modern receivers check both stacks.

## Step 2: DKIM — Cryptographic Signatures

DKIM (DomainKeys Identified Mail) adds a digital signature to each outgoing email. The receiver looks up your public key in your DNS to verify the signature hasn't been tampered with.

### How DKIM Works

Your mail server or email provider generates a key pair. The private key stays on the sending server; the public key is published as a DNS TXT record at a specific selector.

```
selector1._domainkey.yourdomain.com  TXT  "v=DKIM1; k=rsa; p=MIGfMA0G..."
```

When you send an email, the sending server:
1. Creates a hash of the email body and specific headers
2. Signs that hash with the private key
3. Adds the `DKIM-Signature` header with the selector name

When the receiver gets the email:
1. Looks up `SELECTOR._domainkey.yourdomain.com` to get the public key
2. Verifies the signature against the hash

### Setting Up DKIM

**For Google Workspace:**

```bash
# Generate a DKIM key in Google Workspace Admin:
# Apps > Google Workspace > Gmail > Authenticate email
# Select your domain and generate a 2048-bit key
```

Google provides a DNS record like:
```
google._domainkey.yourdomain.com  TXT  "v=DKIM1; k=rsa; p=..."
```

**For a self-hosted mail server (Postfix + OpenDKIM):**

```bash
# Install OpenDKIM
sudo apt install opendkim opendkim-tools

# Generate key pair
sudo opendkim-genkey -D /etc/dkimkeys/ -d yourdomain.com -s mail

# This creates:
# /etc/dkimkeys/mail.private  (private key, keep secure)
# /etc/dkimkeys/mail.txt      (DNS record to publish)
```

The `mail.txt` file contains your DNS record. Add it to your DNS provider:

```
mail._domainkey.yourdomain.com  TXT  "v=DKIM1; k=rsa; p=MIGfMA0G..."
```

**Verify DKIM is working:**

```bash
# Check the DNS record is published
dig +short TXT mail._domainkey.yourdomain.com

# Send a test email and check headers
# Look for "DKIM-Signature: ... d=yourdomain.com; s=mail;"
```

### Key Rotation

Rotating DKIM keys periodically is a security best practice. The standard approach:

1. Generate a new key pair with a different selector (e.g., `mail2._domainkey.yourdomain.com`)
2. Publish both keys simultaneously during the transition period
3. Switch your mail server to sign with the new selector
4. Remove the old record after a few days when all in-transit emails have been processed

Google Workspace handles this automatically with 2048-bit keys generated through the admin console.

## Step 3: DMARC — The Policy Layer

DMARC (Domain-based Message Authentication, Reporting & Conformance) tells email receivers what to do when SPF or DKIM checks fail. It also sends you aggregate reports so you can see who's sending email from your domain — both legitimate and fraudulent.

### DMARC Alignment

For DMARC to pass, at least one of SPF or DKIM must pass AND it must be "aligned" with the domain in the email's visible `From:` header.

**SPF alignment**: The domain in the `MAIL FROM` envelope must match (or be a subdomain of) the domain in the `From:` header.

**DKIM alignment**: The domain in the `d=` tag of the DKIM signature must match (or be a subdomain of) the domain in the `From:` header.

### DMARC Policy Levels

```
_dmarc.yourdomain.com  TXT  "v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com; ruf=mailto:dmarc@yourdomain.com; pct=100"
```

| Tag | Purpose | Example |
|-----|---------|---------|
| `v=DMARC1` | Version | Required |
| `p=` | Policy: `none`, `quarantine`, or `reject` | `p=none` during testing |
| `rua=` | Aggregate report URI (XML reports) | `rua=mailto:dmarc@yourdomain.com` |
| `ruf=` | Forensic report URI (individual failures) | `ruf=mailto:forensic@yourdomain.com` |
| `pct=` | Percentage of mail to apply policy to | `pct=5` during gradual rollout |
| `sp=` | Subdomain policy (optional) | `sp=reject` for strict subdomains |
| `adkim=` | DKIM alignment mode: `r` (relaxed) or `s` (strict) | `adkim=s` |
| `aspf=` | SPF alignment mode: `r` (relaxed) or `s` (strict) | `aspf=r` |

### DMARC Deployment Strategy (Safe Rollout)

The recommended approach is gradual escalation:

**Phase 1 — Monitor (2-4 weeks):**
```
v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```
No emails are rejected. You collect data on who is sending email from your domain.

**Phase 2 — Quarantine (2-4 weeks):**
```
v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com; pct=25
```
Start with 25% of failing emails sent to spam. Gradually increase `pct=` as you confirm legitimate services pass.

**Phase 3 — Reject (permanent):**
```
v=DMARC1; p=reject; rua=mailto:dmarc@yourdomain.com; ruf=mailto:dmarc+forensic@yourdomain.com
```
Hard-reject all unauthenticated email. This is the only policy that fully prevents domain spoofing.

### Understanding DMARC Reports

Aggregate reports come as XML files, usually daily or weekly from major receivers (Google, Yahoo, Microsoft, Apple). Each report contains:

- **Source IP**: Where the email originated
- **SPF result**: pass/fail/none
- **DKIM result**: pass/fail/none
- **Disposition**: none/quarantine/reject
- **Volume**: how many messages matched this bucket

Sample XML snippet:
```xml
<record>
  <row>
    <source_ip>203.0.113.5</source_ip>
    <count>47</count>
    <policy_evaluated>
      <disposition>none</disposition>
      <dkim>pass</dkim>
      <spf>pass</spf>
    </policy_evaluated>
  </row>
</record>
```

Tools to parse DMARC reports:
- **[dmarc.org](https://dmarc.org)** — specification and resources
- **Postmark DMARC tool** (free) — parses and visualizes reports
- **Dmarcian** — free tier for small domains
- **Python script** — `pydmarc` or custom XML parser

### What the Data Shows (2026)

As of mid-2026, according to CipherCue's analysis of DMARC enforcement across company domains:

- **68.4% of domains still don't enforce DMARC** (p=none or no record)
- Of those that do enforce, ~20% use quarantine and ~11.6% use reject
- Microsoft 365 and Google Workspace domains have the highest enforcement rates
- DMARC RUA fragmentation is a growing problem — many receivers fail to send reports at all, creating visibility gaps

Source: [CipherCue — DMARC Enforcement Gap Analysis (2026)](https://ciphercue.com/blog/dmarc-enforcement-gap-rua-fragmentation-2026)

## Testing Your Configuration

Before going live, test every layer:

**1. SPF check:**
```bash
dig +short TXT yourdomain.com | grep "v=spf1"
# Verify the record parses correctly
```

**2. DKIM check:**
```bash
dig +short TXT mail._domainkey.yourdomain.com
# Should return "v=DKIM1; k=rsa; p=..."
```

**3. DMARC check:**
```bash
dig +short TXT _dmarc.yourdomain.com
```

**4. Send test emails to:**
- `mail-tester.com` — gives a score out of 10 with specific issues
- Google Postmaster Tools — monitors deliverability at Gmail
- Microsoft SNDS — monitors deliverability at Outlook/Hotmail

**5. Check your headers:**
After sending a test email, look for these headers in the raw source:
```
Authentication-Results: spf=pass smtp.mailfrom=yourdomain.com;
  dkim=pass header.d=yourdomain.com;
  dmarc=pass header.from=yourdomain.com
```

## Common Problems and Solutions

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| SPF permerror | More than 10 DNS lookups in SPF record | Consolidate includes or use subdomains |
| DKIM signature fails intermittently | Mail server signing with wrong selector | Check the `s=` tag in DKIM-Signature header |
| DMARC failing but SPF + DKIM pass individually | Alignment mismatch — the envelope/`d=` domain doesn't match the `From:` domain | Use the same domain everywhere, or set `adkim=r` and `aspf=r` |
| Third-party service emails failing DMARC | Service sends from a subdomain different from your visible `From:` domain | Set up separate subdomain with its own SPF/DKIM/DMARC for that service |
| DMARC reports not arriving | Receiver doesn't support RUA, or RUA email fails DMARC check (chicken-and-egg) | Set up a separate mailbox, or use a DMARC analysis service that provides a receiving address |

## BIMI: The Bonus Layer

Once DMARC is at `p=reject`, you can add **BIMI** (Brand Indicators for Message Identification). BIMI lets you display your brand logo next to emails in supporting mail clients (Gmail, Apple Mail, Yahoo). You need:

1. DMARC at `p=quarantine` or `p=reject` (strictest is better)
2. A BIMI DNS record pointing to your SVG logo
3. A Verified Mark Certificate (VMC) for the lock-checkmark

BIMI adoption is still growing in 2026, but it's a nice finishing touch for domains that already pass all three authentication layers.

## Also Read

- [How to Set Up GitHub Secrets]({{< relref "posts/how-to-setup-github-secrets/" >}}) — managing API keys and tokens securely
- [Containers vs VMs: Complete Guide]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}}) — understanding the infrastructure layer behind self-hosted services

Read also:

- [How to Setup and Use GitHub Secrets with Containers and Internet-Facing Applications]({{< relref "posts/how-to-setup-github-secrets/" >}})
- [Docker Containers vs Virtual Machines: Complete Comparison Guide [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [How to Setup and Use GitHub Secrets with Containers and Internet-Facing Applications]({{< relref "posts/how-to-setup-github-secrets/" >}})

---

You can reach out to discuss this and other topics at <contact@lucasaguiar.xyz>
