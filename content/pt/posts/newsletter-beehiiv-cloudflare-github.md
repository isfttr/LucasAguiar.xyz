---
date: 2026-05-03T14:48:11-03:00
draft: false
title: "Guia Completo: Como Integrar o Beehiiv ao Hugo via Cloudflare Workers"
description: "Aprenda a integrar um formulário customizado do Beehiiv em um site Hugo no GitHub Pages, usando Cloudflare Workers e monitoramento via PostHog."
url: ""
featured_image: https://lucasaguiarxyzstorage.blob.core.windows.net/images/thumb-cloudflare-beehiiv.png
categories:
  - article
  - tutorial
tags:
  - beehiiv
  - cloudflare
  - github
  - hugo
  - posthog
---

Até pouco tempo atrás, eu não tinha qualquer pretensão de criar uma newsletter, principalmente pelo trabalho adicional de manutenção. Mas, depois de explorar algumas alternativas, escolhi o **Beehiiv** pela facilidade de uso e excelente escalabilidade. No entanto, o desafio surge quando você já possui uma infraestrutura web pré-existente e deseja fazer uma integração perfeita, sem depender de iframes padronizados.

O Beehiiv é uma plataforma fantástica para gestão de newsletters e também permite criar o seu próprio site através deles. Porém, se você já possui um site estabelecido, precisará fazer modificações nos registros DNS e no código-fonte para implementar essa integração. Dependendo da arquitetura do seu projeto, isso pode se tornar um pouco complexo.

Neste tutorial, vou compartilhar o meu caso de uso técnico, que servirá de guia para configurações avançadas. O meu blog é construído com o gerador de sites estáticos **Hugo**, hospedado no **GitHub Pages**, com gerenciamento de DNS pelo **Cloudflare** e monitoramento de tráfego via **PostHog**. 

Minha decisão arquitetônica foi manter meu domínio e hospedagem no GitHub Pages, mas utilizando o design e o código HTML pré-existente do meu site para o botão de inscrição (Call-to-Action). É exatamente essa customização visual do formulário que exige o uso da API do Beehiiv e do Cloudflare Workers.

## Configurando o Domínio Personalizado no Beehiiv e Cloudflare

Vamos direto à prática, assumindo que você já tem uma conta no Beehiiv, um domínio próprio e seu site hospedado (no meu caso, via GitHub Pages).

Primeiramente, é crucial ter atenção ao gerenciamento de DNS. Ao adicionar seu domínio personalizado para a newsletter, o Beehiiv sugerirá a inclusão de alguns registros no Cloudflare. Contudo, você precisará **alterar especificamente o registro CNAME "www"** para apontar para o seu endereço `username.github.io` e *não* para o Beehiiv. Se essa etapa for ignorada, o acesso ao seu domínio raiz redirecionará os visitantes para a página de inscrição da newsletter, e não para o seu blog.

![Configuração de registros DNS no Cloudflare para domínio personalizado do Beehiiv](https://lucasaguiarxyzstorage.blob.core.windows.net/images/cloudflare-dns-registers.png)

Além disso, você precisará adicionar um subdomínio específico para a newsletter. Para este projeto, criei um CNAME nomeado `newsletter` apontando para `cname.beehiiv.com`.

De volta ao painel do Beehiiv, navegue até **Settings → Publication Details → Custom Domain** e altere o domínio para `newsletter.seudominio.com`. Lembre-se de que a propagação de DNS pode levar alguns minutos ou horas.

**Dica de SSL:** Um problema comum ao aceitar os novos registros no Cloudflare é a revogação temporária do certificado SSL pelo provedor de hospedagem. Se isso ocorrer no GitHub Pages, altere o status do proxy no Cloudflare (a nuvem laranja) para "DNS Only" (somente DNS) até que o GitHub refaça a verificação e emita um novo certificado. Após a validação, você pode reativar o proxy do Cloudflare.

![Painel de domínios no Beehiiv configurando redirecionamentos](https://lucasaguiarxyzstorage.blob.core.windows.net/images/beehiiv-domains.png)

Na tela **Domains → Redirect Web Domains** dentro do Beehiiv, marque a opção "No redirect". Isso garante que a plataforma não interfira no tráfego do seu domínio principal.

## Criando um Formulário HTML Customizado no Hugo

Para não utilizar o *embed code* padrão do Beehiiv e manter a consistência visual do blog, criei um bloco de código HTML personalizado. Abaixo está a estrutura do meu Call-to-Action (CTA), que já inclui internacionalização (textos em português e inglês via Hugo) e o rastreamento de eventos com o PostHog.

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
 if (!res.ok) throw new Error('Erro ' + res.status); 
 return res.json();
})
.then(function() {
 btn.closest('.ed-newsletter').querySelector('.ed-newsletter-success').classList.add('show');
 btn.closest('.ed-form-row').style.display = 'none';
})
.catch(function() {
 btn.disabled = false;
 alert('Erro ao inscrever. Tente novamente.');
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

## Integração de Inscrição com Cloudflare Workers

Como optei por um formulário 100% nativo em vez de um iframe, precisei criar uma ponte de comunicação (Serverless) entre o frontend do meu blog e a API do Beehiiv. Para isso, configurei um Cloudflare Worker. Ele "escuta" o evento de clique no botão "Inscrever-se", coleta o e-mail inserido e o envia via POST para o Beehiiv, registrando o novo assinante.

Abaixo está o código JavaScript do Worker que processa essa requisição e lida com o CORS:

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

   // Só aceita POST
   if (request.method !== 'POST') {
     return new Response(JSON.stringify({ error: 'Method not allowed' }), {
       status: 405,
       headers: {
         'Content-Type': 'application/json',
         'Access-Control-Allow-Origin': '[https://www.seudominio.com](https://www.seudominio.com)',
       },
     });
   }

   // Parse do body com tratamento de erro
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

   // Chamada à API v2 do Beehiiv
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

Pontos importantes de configuração:

Você deve gerar uma chave de API no Beehiiv e adicioná-la no painel do Cloudflare Worker em Settings → Secrets and Variables com o nome BEEHIIV_API_KEY.

Atenção à URL: na API v2 da Beehiiv, o ID da publicação leva o prefixo pub_ (diferente da v1).

No painel do Worker em Settings → Domains & Routes, adicione um subdomínio específico para hospedar sua função (ex: worker.seudominio.com). O Cloudflare gerará os registros DNS automaticamente.

Por fim, você pode validar se o endpoint está ativo e recebendo assinaturas testando com um simples comando cURL no terminal:

```bash
curl -X POST [https://worker.seudominio.com/subscribe](https://worker.seudominio.com/subscribe) \
  -H "Content-Type: application/json" \
  -d '{"email": "seu@email.com.br"}'
```

Espero que este guia tenha esclarecido a arquitetura para criar uma integração robusta e invisível da sua newsletter em um ecossistema com Hugo, GitHub Pages e Cloudflare.

Leia também:

- [Usando a Camada Gratuita do Oracle Cloud]({{< relref "posts/oracle_cloud_vps/" >}})
- [Corrigindo Erros de Login na Interface Web do Proxmox: Guia Passo a Passo]({{< relref "posts/troubleshooting-proxmox-login-interface/" >}})
- [Estrutura de Arquivos de Conteúdo do Hugo]({{< relref "posts/hugo-content-file-structure/" >}})

---

Você pode entrar em contato comigo sobre este e outros tópicos preenchendo o formulário abaixo.