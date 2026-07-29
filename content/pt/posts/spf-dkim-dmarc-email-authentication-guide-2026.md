---
date: 2026-07-28T18:05:25.000Z
draft: true
title: 'SPF, DKIM e DMARC: Guia Completo de Autenticação de E-mail [2026]'
description: Guia passo a passo para configurar SPF, DKIM e DMARC para o seu domínio em 2026. Inclui exemplos de registros DNS, solução de problemas comuns e compreensão de relatórios DMARC. Com 68% dos domínios ainda sem aplicar DMARC, proteja seu e-mail hoje.
featured_image: ''
categories:
  - article
tags:
  - email
  - security
  - linux
  - homelab
  - devops
slug: spf-dkim-dmarc-guia-autenticacao-email
translation_source_hash: facd8d816b70e64df02cc13a7c851e7fb922cfec518fa8a01c7f79d411f5a263
---
Você acabou de configurar seu próprio servidor de e-mail — ou finalmente decidiu parar de enviar e-mails de `contact@seudominio.com` por meio de um relay SMTP genérico sem qualquer autenticação. De qualquer forma, você tem três registros DNS para configurar antes que seus e-mails parem de cair em pastas de spam ou sejam rejeitados diretamente.

Este guia aborda SPF, DKIM e DMARC, desde a configuração até a verificação. Sem enrolação, apenas o que cada protocolo faz, como configurá-lo e como ler os relatórios.

## As Três Camadas de Autenticação de E-mail

O e-mail foi projetado em uma época em que todos na internet eram confiáveis. Não havia autenticação embutida no SMTP — qualquer um podia enviar e-mails alegando ser outra pessoa. Por isso, hoje precisamos de três padrões separados acoplados por cima.

| Padrão | RFC | Ano | O Que Faz | Fraqueza |
|--------|-----|------|-----------|----------|
| **SPF** | RFC 7208 | 2006 (orig. 2002) | Lista quais IPs estão autorizados a enviar e-mail pelo seu domínio | Falha com e-mail encaminhado; verifica apenas o envelope, não o cabeçalho |
| **DKIM** | RFC 6376 | 2007 (orig. 2004) | Assina criptograficamente os cabeçalhos/corpo do e-mail | Gerenciamento complexo de chaves; não diz aos receptores o que fazer se a assinatura falhar |
| **DMARC** | RFC 7489 | 2012 | Diz aos receptores o que fazer quando SPF ou DKIM falham, e envia relatórios para você | Inútil sem SPF e DKIM funcionando primeiro |

Você precisa de todos os três. SPF sozinho, DKIM sozinho, ou ambos sem DMARC ainda deixam seu domínio desprotegido contra falsificação exata de domínio.

Por quê? O SPF verifica apenas o remetente do envelope (o endereço `MAIL FROM` no handshake SMTP), não o cabeçalho `From:` visível no corpo do e-mail. O DKIM assina o cabeçalho visível, mas não tem uma camada de política — um receptor pode aceitar ou rejeitar uma assinatura com falha com base em sua própria política local, que varia enormemente entre provedores. O DMARC faz a ponte entre eles alinhando os resultados de SPF e DKIM com o domínio `From:` visível e instruindo os receptores sobre uma política unificada.

## Passo 1: SPF — Quem Está Autorizado a Enviar

SPF (Sender Policy Framework) é um registro DNS TXT que declara quais endereços IP ou nomes de host estão autorizados a enviar e-mail em nome do seu domínio.

### A Sintaxe do Registro SPF

Um registro SPF típico se parece com isto:

```
v=spf1 mx include:_spf.google.com ~all
```

Vamos detalhar:

- `v=spf1` — identificador de versão
- `mx` — permite que os servidores MX do domínio enviem e-mail
- `include:_spf.google.com` — delega a autorização ao registro SPF do Google (para usuários do Google Workspace)
- `~all` — falha suave para qualquer outro remetente (marca como suspeito, mas não rejeita)

O último mecanismo é crítico. Você tem três opções:

| Qualificador | Significado | Código DNS |
|--------------|-------------|------------|
| `+all` | Permitir tudo — totalmente aberto | Nunca use isso |
| `-all` | Falha dura — rejeitar remetentes não autorizados | Estrito |
| `~all` | Falha suave — marcar como suspeito | Recomendado para testes |
| `?all` | Neutro — sem política | Inútil na prática |

### Construindo Seu Registro SPF

1. **Identifique todos os remetentes**: Liste todos os serviços que enviam e-mails usando seu domínio — Google Workspace, Mailchimp, SendGrid, seu próprio servidor de e-mail, a função PHP mail() do seu hospedeiro.

2. **Encontre o include SPF de cada remetente**: A maioria dos serviços de e-mail publica um guia. Comuns:
   - **Google Workspace**: `include:_spf.google.com`
   - **Microsoft 365**: `include:spf.protection.outlook.com`
   - **SendGrid**: `include:sendgrid.net`
   - **Mailchimp**: `include:servers.mcsv.net`
   - **Amazon SES**: `include:amazonses.com`
   - **Zoho**: `include:zoho.com`

3. **Limite os includes**: O limite de consultas DNS é 10 (includes, mx, ptr e mecanismos a contam cada um). Exceda e o SPF retornará **permerror** — o que significa que todo e-mail pode ser rejeitado por receptores estritos.

```bash
# Verifique seu registro SPF atual
dig +short TXT seudominio.com | grep "v=spf1"
```

### Armadilhas Comuns do SPF

- **E-mail encaminhado quebra o SPF**: Quando o Gmail encaminha seu e-mail para o Yahoo, o IP do servidor de encaminhamento provavelmente não está no seu SPF. A mensagem encaminhada falha no SPF. Isso é normal — o DKIM (que sobrevive ao encaminhamento) e o alinhamento DMARC lidam com esse caso.
- **Muitas consultas**: Cada `include:` usa uma consulta DNS. Serviços como Mailchimp adicionam 1 consulta. Se você tiver 10 ou mais includes, seu registro SPF é inválido. Consolide ou use subdomínios.
- **Falta de IPv6**: Se seu servidor de e-mail suporta IPv6, adicione `ip6:2001:db8::/32` ao seu registro. Muitos receptores modernos verificam ambas as pilhas.

## Passo 2: DKIM — Assinaturas Criptográficas

DKIM (DomainKeys Identified Mail) adiciona uma assinatura digital a cada e-mail enviado. O receptor consulta sua chave pública no DNS para verificar se a assinatura não foi adulterada.

### Como o DKIM Funciona

Seu servidor de e-mail ou provedor de e-mail gera um par de chaves. A chave privada fica no servidor de envio; a chave pública é publicada como um registro DNS TXT em um seletor específico.

```
seletor1._domainkey.seudominio.com  TXT  "v=DKIM1; k=rsa; p=MIGfMA0G..."
```

Quando você envia um e-mail, o servidor de envio:
1. Cria um hash do corpo do e-mail e de cabeçalhos específicos
2. Assina esse hash com a chave privada
3. Adiciona o cabeçalho `DKIM-Signature` com o nome do seletor

Quando o receptor recebe o e-mail:
1. Consulta `SELECTOR._domainkey.seudominio.com` para obter a chave pública
2. Verifica a assinatura em relação ao hash

### Configurando DKIM

**Para Google Workspace:**

```bash
# Gere uma chave DKIM no Admin do Google Workspace:
# Apps > Google Workspace > Gmail > Authenticate email
# Selecione seu domínio e gere uma chave de 2048 bits
```

O Google fornece um registro DNS como:
```
google._domainkey.seudominio.com  TXT  "v=DKIM1; k=rsa; p=..."
```

**Para um servidor de e-mail auto-hospedado (Postfix + OpenDKIM):**

```bash
# Instale o OpenDKIM
sudo apt install opendkim opendkim-tools

# Gere o par de chaves
sudo opendkim-genkey -D /etc/dkimkeys/ -d seudominio.com -s mail

# Isso cria:
# /etc/dkimkeys/mail.private  (chave privada, mantenha segura)
# /etc/dkimkeys/mail.txt      (registro DNS a publicar)
```

O arquivo `mail.txt` contém seu registro DNS. Adicione-o ao seu provedor DNS:

```
mail._domainkey.seudominio.com  TXT  "v=DKIM1; k=rsa; p=MIGfMA0G..."
```

**Verifique se o DKIM está funcionando:**

```bash
# Verifique se o registro DNS foi publicado
dig +short TXT mail._domainkey.seudominio.com

# Envie um e-mail de teste e verifique os cabeçalhos
# Procure por "DKIM-Signature: ... d=seudominio.com; s=mail;"
```

### Rotação de Chaves

Rotacionar periodicamente as chaves DKIM é uma boa prática de segurança. A abordagem padrão:

1. Gere um novo par de chaves com um seletor diferente (ex.: `mail2._domainkey.seudominio.com`)
2. Publique ambas as chaves simultaneamente durante o período de transição
3. Faça seu servidor de e-mail assinar com o novo seletor
4. Remova o registro antigo após alguns dias, quando todos os e-mails em trânsito tiverem sido processados

O Google Workspace lida com isso automaticamente com chaves de 2048 bits geradas pelo console de administração.

## Passo 3: DMARC — A Camada de Política

DMARC (Domain-based Message Authentication, Reporting & Conformance) diz aos receptores de e-mail o que fazer quando as verificações de SPF ou DKIM falham. Ele também envia relatórios agregados para que você possa ver quem está enviando e-mail do seu domínio — tanto legítimo quanto fraudulento.

### Alinhamento DMARC

Para que o DMARC passe, pelo menos um entre SPF ou DKIM deve passar E deve estar "alinhado" com o domínio no cabeçalho `From:` visível do e-mail.

**Alinhamento SPF**: O domínio no envelope `MAIL FROM` deve corresponder (ou ser um subdomínio) ao domínio no cabeçalho `From:`.

**Alinhamento DKIM**: O domínio na tag `d=` da assinatura DKIM deve corresponder (ou ser um subdomínio) ao domínio no cabeçalho `From:`.

### Níveis de Política DMARC

```
_dmarc.seudominio.com  TXT  "v=DMARC1; p=none; rua=mailto:dmarc@seudominio.com; ruf=mailto:dmarc@seudominio.com; pct=100"
```

| Tag | Propósito | Exemplo |
|-----|-----------|---------|
| `v=DMARC1` | Versão | Obrigatório |
| `p=` | Política: `none`, `quarantine` ou `reject` | `p=none` durante testes |
| `rua=` | URI de relatório agregado (relatórios XML) | `rua=mailto:dmarc@seudominio.com` |
| `ruf=` | URI de relatório forense (falhas individuais) | `ruf=mailto:forensic@seudominio.com` |
| `pct=` | Percentual de e-mails para aplicar a política | `pct=5` durante implantação gradual |
| `sp=` | Política de subdomínio (opcional) | `sp=reject` para subdomínios estritos |
| `adkim=` | Modo de alinhamento DKIM: `r` (relaxado) ou `s` (estrito) | `adkim=s` |
| `aspf=` | Modo de alinhamento SPF: `r` (relaxado) ou `s` (estrito) | `aspf=r` |

### Estratégia de Implantação DMARC (Rollout Seguro)

A abordagem recomendada é a escalada gradual:

**Fase 1 — Monitorar (2-4 semanas):**
```
v=DMARC1; p=none; rua=mailto:dmarc@seudominio.com
```
Nenhum e-mail é rejeitado. Você coleta dados sobre quem está enviando e-mail do seu domínio.

**Fase 2 — Quarentena (2-4 semanas):**
```
v=DMARC1; p=quarantine; rua=mailto:dmarc@seudominio.com; pct=25
```
Comece com 25% dos e-mails com falha indo para spam. Aumente gradualmente o `pct=` conforme você confirma que serviços legítimos passam.

**Fase 3 — Rejeitar (permanente):**
```
v=DMARC1; p=reject; rua=mailto:dmarc@seudominio.com; ruf=mailto:dmarc+forensic@seudominio.com
```
Rejeite todos os e-mails não autenticados. Esta é a única política que impede completamente a falsificação de domínio.

### Entendendo os Relatórios DMARC

Os relatórios agregados vêm como arquivos XML, geralmente diários ou semanais dos principais receptores (Google, Yahoo, Microsoft, Apple). Cada relatório contém:

- **IP de origem**: De onde o e-mail se originou
- **Resultado SPF**: pass/fail/none
- **Resultado DKIM**: pass/fail/none
- **Disposição**: none/quarantine/reject
- **Volume**: quantas mensagens corresponderam a este balde

Trecho de XML de exemplo:
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

Ferramentas para analisar relatórios DMARC:
- **[dmarc.org](https://dmarc.org)** — especificação e recursos
- **Ferramenta DMARC do Postmark** (gratuita) — analisa e visualiza relatórios
- **Dmarcian** — nível gratuito para domínios pequenos
- **Script Python** — `pydmarc` ou analisador XML personalizado

### O Que os Dados Mostram (2026)

Em meados de 2026, de acordo com a análise da CipherCue sobre a aplicação de DMARC em domínios de empresas:

- **68,4% dos domínios ainda não aplicam DMARC** (p=none ou nenhum registro)
- Daqueles que aplicam, ~20% usam quarentena e ~11,6% usam rejeição
- Domínios do Microsoft 365 e Google Workspace têm as maiores taxas de aplicação
- A fragmentação de RUA DMARC é um problema crescente — muitos receptores não enviam relatórios, criando lacunas de visibilidade

Fonte: [CipherCue — Análise de Lacunas na Aplicação de DMARC (2026)](https://ciphercue.com/blog/dmarc-enforcement-gap-rua-fragmentation-2026)

## Testando Sua Configuração

Antes de colocar em produção, teste cada camada:

**1. Verificação SPF:**
```bash
dig +short TXT seudominio.com | grep "v=spf1"
# Verifique se o registro é interpretado corretamente
```

**2. Verificação DKIM:**
```bash
dig +short TXT mail._domainkey.seudominio.com
# Deve retornar "v=DKIM1; k=rsa; p=..."
```

**3. Verificação DMARC:**
```bash
dig +short TXT _dmarc.seudominio.com
```

**4. Envie e-mails de teste para:**
- `mail-tester.com` — dá uma pontuação de 0 a 10 com problemas específicos
- Google Postmaster Tools — monitora a entregabilidade no Gmail
- Microsoft SNDS — monitora a entregabilidade no Outlook/Hotmail

**5. Verifique seus cabeçalhos:**
Após enviar um e-mail de teste, procure por estes cabeçalhos no código-fonte bruto:
```
Authentication-Results: spf=pass smtp.mailfrom=seudominio.com;
  dkim=pass header.d=seudominio.com;
  dmarc=pass header.from=seudominio.com
```

## Problemas Comuns e Soluções

| Problema | Causa Provável | Correção |
|----------|----------------|----------|
| SPF permerror | Mais de 10 consultas DNS no registro SPF | Consolide includes ou use subdomínios |
| Assinatura DKIM falha intermitentemente | Servidor de e-mail assinando com o seletor errado | Verifique a tag `s=` no cabeçalho DKIM-Signature |
| DMARC falhando, mas SPF + DKIM passam individualmente | Incompatibilidade de alinhamento — o domínio do envelope/`d=` não corresponde ao domínio `From:` | Use o mesmo domínio em todos os lugares, ou defina `adkim=r` e `aspf=r` |
| E-mails de serviços terceiros falhando no DMARC | Serviço envia de um subdomínio diferente do domínio `From:` visível | Configure um subdomínio separado com seu próprio SPF/DKIM/DMARC para aquele serviço |
| Relatórios DMARC não chegam | O receptor não suporta RUA, ou o e-mail RUA falha na verificação DMARC (problema do ovo e da galinha) | Configure uma caixa de correio separada, ou use um serviço de análise DMARC que forneça um endereço de recebimento |

## BIMI: A Camada Extra

Assim que o DMARC estiver em `p=reject`, você pode adicionar o **BIMI** (Brand Indicators for Message Identification). O BIMI permite exibir seu logotipo ao lado de e-mails em clientes de e-mail compatíveis (Gmail, Apple Mail, Yahoo). Você precisa de:

1. DMARC em `p=quarantine` ou `p=reject` (o mais estrito é melhor)
2. Um registro DNS BIMI apontando para seu logotipo SVG
3. Um Verified Mark Certificate (VMC) para o cadeado de verificação

A adoção do BIMI ainda está crescendo em 2026, mas é umtoque final agradável para domínios que já passam por todas as três camadas de autenticação.

## Leia Também

- [Como Configurar GitHub Secrets]({{< relref "posts/how-to-setup-github-secrets/" >}}) — gerenciando chaves de API e tokens com segurança
- [Contêineres vs VMs: Guia Completo]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}}) — entendendo a camada de infraestrutura por trás de serviços auto-hospedados

Leia também:

- [Como Configurar e Usar GitHub Secrets com Contêineres e Aplicações Voltadas para a Internet]({{< relref "posts/how-to-setup-github-secrets/" >}})
- [Contêineres Docker vs Máquinas Virtuais: Guia Completo de Comparação [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})
- [Como Configurar e Usar GitHub Secrets com Contêineres e Aplicações Voltadas para a Internet]({{< relref "posts/how-to-setup-github-secrets/" >}})

---

Você pode entrar em contato para discutir este e outros tópicos em <contact@lucasaguiar.xyz>
