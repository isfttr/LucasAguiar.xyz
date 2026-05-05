---
date: 2026-05-03T17:48:11.000Z
draft: false
title: 'Complete Guide: How to Integrate Beehiiv to Hugo via Cloudflare Workers'
description: >-
  Learn to integrate a custom Beehiiv form into a Hugo website on GitHub Pages,
  using Cloudflare Workers and monitoring via PostHog.
url: ''
featured_image: >-
  https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-cloudflare-beehiiv.png
categories:
  - article
  - tutorial
tags:
  - beehiiv
  - cloudflare
  - github
  - hugo
  - posthog
translation_source_hash: f8648c93956d456a92fe06c8db80b695e98ad6ecf5a39d8bff7373f08ba417bd
---
Until recently, I had no intention of creating a newsletter, mainly due to the additional maintenance work. But, after exploring some alternatives, I chose **Beehiiv** for its ease of use and excellent scalability. However, the challenge arises when you already have pre-existing web infrastructure and want to achieve seamless integration, without relying on standardized iframes.

Beehiiv is a fantastic platform for newsletter management and also allows you to create your own website through them. However, if you already have an established website, you will need to make modifications to your DNS records and source code to implement this integration. Depending on your project's architecture, this can become a bit complex.

In this tutorial, I will share my technical use case, which will serve as a guide for advanced configurations. My blog is built with the static site generator **Hugo**, hosted on **GitHub Pages**, with DNS management by **Cloudflare** and traffic monitoring via **PostHog**.

My architectural decision was to keep my domain and hosting on GitHub Pages, but utilizing my site's existing design and HTML code for the subscription button (Call-to-Action). It is precisely this visual customization of the form that requires the use of the Beehiiv API and Cloudflare Workers.

## Setting Up Your Custom Domain in Beehiiv and Cloudflare

Let's get straight to practice, assuming you already have a Beehiiv account, your own domain, and your website hosted (in my case, via GitHub Pages).

First, it's crucial to pay attention to DNS management. When adding your custom domain for the newsletter, Beehiiv will suggest including some records in Cloudflare. However, you will need to **specifically change the CNAME "www" record** to point to your `username.github.io` address and *not* to Beehiiv. If this step is ignored, accessing your root domain will redirect visitors to the newsletter subscription page, not your blog.

![Configuração de registros DNS no Cloudflare para domínio personalizado do Beehiiv](https://lucasaguiarxyzstorage.blob.core.windows.net/images/cloudflare-dns-registers.png)

Additionally, you will need to add a specific subdomain for the newsletter. For this project, I created a CNAME named `newsletter` pointing to `cname.beehiiv.com`.

Back in the Beehiiv dashboard, navigate to **Settings → Publication Details → Custom Domain** and change the domain to `newsletter.yourdomain.com`. Remember that DNS propagation can take a few minutes or hours.

**SSL Tip:** A common issue when accepting new records in Cloudflare is the temporary revocation of the SSL certificate by the hosting provider. If this happens on GitHub Pages, change the proxy status in Cloudflare (the orange cloud) to "DNS Only" until GitHub re-verifies and issues a new certificate. After validation, you can reactivate the Cloudflare proxy.

![Painel de domínios no Beehiiv configurando redirecionamentos](https://lucasaguiarxyzstorage.blob.core.windows.net/images/beehiiv-domains.png)

On the **Domains → Redirect Web Domains** screen within Beehiiv, check the "No redirect" option. This ensures that the platform does not interfere with your main domain's traffic.

## Creating a Custom HTML Form in Hugo

To avoid using Beehiiv's standard *embed code* and maintain the blog's visual consistency, I created a custom HTML code block. Below is the structure of my Call-to-Action (CTA), which already includes internationalization (texts in Portuguese and English via Hugo) and event tracking with PostHog.

```html
{}
<section class="ed-newsletter reveal" id="newsletter-band" aria-labelledby="newsletter-heading">
   <div class="container">
       <div class="ed-newsletter-inner">
           <div>
               <div class="ed-hero-eyebrow" style="margin-bottom:16px">
                   {{ if eq .Site.Language.Lang "pt" }}Newsletter de Propriedade Intelectual · Grátis{{ else
                   }}Intellectual Property Newsletter · Free{{ end }}
               </div>
               <h2 id="newsletter-heading">
                   {{ if eq .Site.Language.Lang "pt" }}
                   Consultoria em PI para Startups e Deeptechs <em style="color:var(--accent);font-style:italic">+ uma
                       análise de viabilidade grátis</em> do seu projeto.
                   {{ else }}
                   IP Consulting for Startups & Deeptechs <em style="color:var(--accent);font-style:italic">+ a free
                       feasibility analysis</em> of your project.
                   {{ end }}
               </h2>
               <p>
                   {{ if eq .Site.Language.Lang "pt" }}
                   Inscreva-se e responda ao e-mail de boas-vindas. Receba uma análise estratégica sobre
                   <strong>patentes, marcas e software</strong> para sua startup. Foco em inovações de
                   <strong>biotecnologia, healthtech e agrotech</strong>, com a expertise de um consultor em
                   Propriedade Intelectual (UnB e Min. da Saúde).
                   {{ else }}
                   Subscribe and reply to the welcome email. Get a strategic analysis on <strong>patents, trademarks,
                       and software</strong> for your startup. Tailored for <strong>biotech, healthtech, and
                       agrotech</strong> innovations by an experienced IP consultant (UnB and Brazil's Ministry of
                   Health).
                   {{ end }}
               </p>
           </div>
           <div>
               <div class="ed-form-row">
                   <input type="email" id="home-newsletter-email" name="email"
                       aria-label="{{ if eq .Site.Language.Lang " pt" }}Digite seu e-mail para se inscrever{{ else
                       }}Enter your email to subscribe{{ end }}" placeholder="{{ if eq .Site.Language.Lang " pt"
                       }}seu@email.com{{ else }}your@email.com{{ end }}" required>
                   <button type="button" onclick="
 var email = document.getElementById('home-newsletter-email').value;
 if (!email || !email.includes('@')) return;

 var btn = this;
 btn.disabled = true;

 // PostHog tracking 
 if (typeof posthog !== 'undefined') posthog.capture('cta_clicked', {
   cta_name: 'newsletter_subscribe',
   location: 'home_newsletter',
   email: email
 });

 fetch('[https://worker.seudominio.com/subscribe](https://worker.seudominio.com/subscribe)', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ email: email })
})
.then(function(res) {
 if (!res.ok) throw new Error('Error ' + res.status); 
 return res.json();
})
.then(function() {
 btn.closest('.ed-newsletter').querySelector('.ed-newsletter-success').classList.add('show');
 btn.closest('.ed-form-row').style.display = 'none';
})
.catch(function() {
 btn.disabled = false;
 alert('Error subscribing. Please try again.');
});
">
                       {{ i18n "subscribe" }} →
                   </button>
               </div>
               <div class="ed-newsletter-success" role="status" aria-live="polite">
                   {{ if eq .Site.Language.Lang "pt" }}✓ INSCRITO · verifique sua caixa de entrada{{ else }}✓
                   SUBSCRIBED · check your inbox{{ end }}
               </div>
               <div class="ed-newsletter-deliverables">
                   <span class="ed-newsletter-deliv">{{ if eq .Site.Language.Lang "pt" }}Análise de PI grátis na
                       resposta{{ else }}Free IP read on reply{{ end }}</span>
                   <span class="ed-newsletter-deliv">{{ if eq .Site.Language.Lang "pt" }}Mensal · sem spam{{ else
                       }}Monthly · no spam{{ end }}</span>
                   <span class="ed-newsletter-deliv">{{ if eq .Site.Language.Lang "pt" }}1 clique para sair{{ else
                       }}1-click unsubscribe{{ end }}</span>
               </div>
           </div>
       </div>
   </div>
</section>
````

## Subscription Integration with Cloudflare Workers

Since I opted for a 100% native form instead of an iframe, I needed to create a communication bridge (Serverless) between my blog's frontend and the Beehiiv API. To do this, I configured a Cloudflare Worker. It "listens" for the click event on the "Subscribe" button, collects the entered email, and sends it via POST to Beehiiv, registering the new subscriber.

Below is the Worker's JavaScript code that processes this request and handles CORS:

```js
export default {
 async fetch(request, env) {

   // CORS preflight
   if (request.method === 'OPTIONS') {
     return new Response(null, {
       headers: {
         'Access-Control-Allow-Origin': '[https://www.seudominio.com](https://www.seudominio.com)',
         'Access-Control-Allow-Methods': 'POST',
         'Access-Control-Allow-Headers': 'Content-Type',
       },
     });
   }

   // Only accepts POST
   if (request.method !== 'POST') {
     return new Response(JSON.stringify({ error: 'Method not allowed' }), {
       status: 405,
       headers: {
         'Content-Type': 'application/json',
         'Access-Control-Allow-Origin': '[https://www.seudominio.com](https://www.seudominio.com)',
       },
     });
   }

   // Parse body with error handling
   let email;
   try {
     const body = await request.json();
     email = body.email;
   } catch (e) {
     return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
       status: 400,
       headers: {
         'Content-Type': 'application/json',
         'Access-Control-Allow-Origin': '[https://www.seudominio.com](https://www.seudominio.com)',
       },
     });
   }

   if (!email) {
     return new Response(JSON.stringify({ error: 'Email is required' }), {
       status: 400,
       headers: {
         'Content-Type': 'application/json',
         'Access-Control-Allow-Origin': '[https://www.seudominio.com](https://www.seudominio.com)',
       },
     });
   }

   // Call to Beehiiv API v2
   const res = await fetch(
     '[https://api.beehiiv.com/v2/publications/pub_numero_api-beehiiv/subscriptions](https://api.beehiiv.com/v2/publications/pub_numero_api-beehiiv/subscriptions)',
     {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${env.BEEHIIV_API_KEY}`,
       },
       body: JSON.stringify({ email, reactivate_existing: true }),
     }
   );

   const data = await res.json();

   return new Response(JSON.stringify(data), {
     status: res.ok ? 200 : res.status,
     headers: {
       'Content-Type': 'application/json',
       'Access-Control-Allow-Origin': '[https://www.seudominio.com](https://www.seudominio.com)',
     },
   });
 },
};
```

Important configuration points:

You must generate an API key in Beehiiv and add it to the Cloudflare Worker panel under Settings → Secrets and Variables with the name BEEHIIV_API_KEY.

Attention to the URL: in Beehiiv's v2 API, the publication ID uses the prefix pub_ (different from v1).

In the Worker panel under Settings → Domains & Routes, add a specific subdomain to host your function (e.g., worker.yourdomain.com). Cloudflare will automatically generate the DNS records.

Finally, you can validate if the endpoint is active and receiving subscriptions by testing with a simple cURL command in the terminal:

```bash
curl -X POST [https://worker.seudominio.com/subscribe](https://worker.seudominio.com/subscribe) \
  -H "Content-Type: application/json" \
  -d '{"email": "seu@email.com.br"}'
```

I hope this guide has clarified the architecture for creating a robust and invisible integration of your newsletter within an ecosystem using Hugo, GitHub Pages, and Cloudflare.

Read also:

- [Using Oracle Cloud Free tier]({{< relref "posts/oracle_cloud_vps/" >}})
- [Fix Proxmox Web Interface Login Errors; a Step-by-Step Guide]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}})
- [Hugo Content File Structure]({{< relref "posts/hugo-content-file-structure/" >}})

---

You can contact me about this and other topics by filling out the form below.
