---
date: 2026-10-20T15:01:43-03:00
draft: true
title: What Is microG and How to De-Google Your Android [2026]
description: "Complete guide to microG: the open-source reimplementation of Google Play Services. How to de-Google your Android with LineageOS, F-Droid, UnifiedNlp and Aurora Store, and what breaks."
url: ""
featured_image: null
categories:
  - article
  - tutorial
tags:
  - android
  - privacy
  - microg
  - f-droid
  - degoogle
scheduledAt: 2026-10-22T17:13:35.434Z
---
If you want to run Android without Google on top of it, microG is the piece that makes it realistic. It is a free and open-source reimplementation of the proprietary Google Play Services framework, and it lets apps that depend on Google APIs run on AOSP-based ROMs like LineageOS — without ever installing Google's closed-source code. This guide explains what microG is, what it can and cannot do in 2026, and the step-by-step path to a de-Googled phone that still receives push notifications and uses maps.

## Why you need Google Play Services at all

Modern Android apps do not talk to Google directly — they talk to a local system component called Google Play Services. When an app on a stock phone shows "Sign in with Google", sends a notification, or locates you via "Fused Location Provider", it is calling an API implemented by that proprietary framework. The problem: Play Services is closed source, communicates with Google servers continuously, and is mandatory on any phone sold with Google. Removing it makes many apps crash or refuse to start.

That is the exact problem microG solves. As described in the [official microG documentation](https://microg.org/), it is a free software replacement for Play Services that implements the same APIs so apps keep working on a Google-free system. The main component is **GmsCore**, the library itself.

## What microG provides

The [microG project](https://github.com/microg) aggregates several components:

- **GmsCore** — the core reimplementation of Play Services APIs (account sign-in, push, location).
- **UnifiedNlp** — a pluggable network location provider using open sources (OpenStreetMap, Mozilla) instead of Google's.
- **Aurora Store** — a client for the Google Play catalog that lets you download apps without a Google account.
- **microG Services Framework Proxy (GsfProxy)** — provides the identity that signed-in apps expect.

Installation is normally done through [F-Droid](https://f-droid.org/), the open-source app store, which hosts microG builds alongside any other free software.

## The signature spoofing catch

There is one fundamental constraint you need to understand before starting: apps verify they are talking to *Google's* Play Services by checking its cryptographic signature. For microG to act as a stand-in, Android must allow **signature spoofing** — the system grants an app the ability to fake Google's signature.

This is why microG works best on custom ROMs that enable signature spoofing out of the box, and why it is not a simple "install an APK" affair on a locked stock phone. On a bootloader-unlocked device with an AOSP ROM such as [LineageOS](https://lineageos.org/) or [GrapheneOS](https://grapheneos.org/), the setup is a single F-Droid install.

## Step-by-step: de-Googling a phone in 2026

1. **Unlock the bootloader** and flash an AOSP ROM that supports signature spoofing (LineageOS, GrapheneOS, iodé, /e/OS). This wipes the device — back up first.
2. **Install F-Droid** and add the [microG repository](https://microg.org/) so components stay updated.
3. **Install GmsCore, UnifiedNlp and GsfProxy** from F-Droid.
4. **Enable the location backends** in the microG settings (OpenStreetMap Nominatim and Mozilla location service) if you want offline-ish network location.
5. **Install Aurora Store** if you still need a branded app that is only on Google Play.
6. **Register for push** — microG registers your device against Google's push endpoint using an anonymous account, which is the notable privacy compromise: notifications still hop through Google.

## What still breaks in 2026

Some things resist de-Googling no matter how clean the setup:

- **Banking and sensitive apps** that insist on SafetyNet/Play Integrity (strong device attestation) will refuse to run; microG implements an older compatibility layer and cannot pass the newest hardware-backed checks.
- **Google-system apps** such as Google Maps, the Play Store client itself and Android Auto behave erratically or not at all — the FOSS replacements (Organic Maps, Aurora Store) fill the gap.
- **Some games** that bundle Google's SDK hard and assume the real client will fail to launch.

The recurring pattern worth knowing: the apps that keep you on Google are the ones that demand *proof* you are running Google, not the ones that merely use its APIs.

## Key trade-off: notifications

The biggest practical sacrifice is probably push notifications. If you rely on GCM/FCM push, microG will route them through Google's servers (anonymously). The strictest alternative — running GrapheneOS with zero Google dependencies and no push — means apps fall back to polling or simply do not notify in real time. Decide that trade-off before you start, because it drives every other choice.

## Is de-Googling worth it?

For privacy-focused homelabbers who are already self-hosting their services, microG is the piece that extends the same philosophy to a pocket device. It is not for everyone — if every app on your home screen depends on Google sign-in, expect friction. But if you live in F-Droid and self-hosted tools anyway, microG turns "Android must phone home" into a choice instead of a default.

Also read:

- [How to Block Ads and Trackers in 2026: Firefox, uBlock Origin, and DNS Filtering]({{< relref "posts/how-to-block-ads-trackers-2026-guide/" >}})
- [Self-Hosted Mesh VPN in 2026: WireGuard and Headscale Complete Guide]({{< relref "posts/self-hosted-mesh-vpn-wireguard-headscale-guide-2026/" >}})

---

You can reach out to contact me about this and other topics by filling the form below.
