---
date: 2026-08-20T18:06:00.000Z
draft: true
title: 'Como Proteger contra Pacotes Maliciosos: Segurança da Cadeia de Suprimentos para npm, PyPI e Cargo [2026]'
description: 'Guia completo para se defender contra pacotes maliciosos em npm, PyPI e crates.io: typosquatting, comprometimento de contas, payloads em tempo de build, ferramentas de auditoria e higiene de lockfile. Inclui o incidente arrayref de agosto de 2026.'
featured_image: ''
categories:
  - article
tags:
  - supply-chain
  - security
  - npm
  - python
  - rust
  - devops
slug: proteger-pacotes-maliciosos-seguranca-cadeia-suprimentos
translation_source_hash: 15fc5c37b589275814c3930fdca50014c1478272b9ce669ea23a2c270280b95d
---
Em 20 de agosto de 2026, uma versão comprometida do crate popular `arrayref` apareceu no crates.io. A versão 0.3.10 adicionou uma dependência de um crate com nome typosquat chamado `proc-macro1`, cujo script de build baixa e executa um binário remoto toda vez que um projeto compila. Nenhuma revisão de código do seu próprio código-fonte teria detectado: o payload era executado em tempo de build, antes mesmo de qualquer teste rodar.

Isso não é um problema do Rust nem do crates.io. Os mesmos padrões de ataque — typosquatting, comprometimento de contas e payloads em tempo de build — atingem o npm e o PyPI todos os meses. Este guia explica como esses ataques funcionam e o que você pode fazer de fato para proteger seus projetos, com ferramentas concretas para os três maiores ecossistemas.

## Anatomia do incidente do arrayref (agosto de 2026)

O [relatório da SafeDep sobre o incidente do arrayref](https://safedep.io/arrayref-proc-macro1-rust-build-time-malware/) vale a pena ser lido por completo, mas a mecânica é uma aula magistral de abuso da cadeia de suprimentos:

- A conta legítima de mantenedor do `arrayref` (`droundy`) foi comprometida. Versões maliciosas foram publicadas para `arrayref` 0.3.10, `internment` 0.8.7 e `append-only-vec` 0.1.9.
- `arrayref` 0.3.10 adicionou uma única linha ao `Cargo.toml`: uma dependência de `proc-macro1`, um typosquat do crate real `proc-macro2`, do qual autores de macros realmente dependem. O crate falso ainda forjou `authors = ["David Tolnay"]` para se passar pela conhecida conta `dtolnay`.
- O payload estava no `build.rs` do `proc-macro1`. Ele remontava uma URL ofuscada em base64, buscava um binário específico da arquitetura via TLS (aceitando qualquer certificado) e o executava de forma separada do build — gravando `/tmp/rust-setup` no Unix e um par oculto de PowerShell/VBScript em `%TEMP%` no Windows.
- O atacante **marcou como yanked** (retirou) as versões anteriores do `arrayref` 0.3.5–0.3.9. O Cargo então exibiu "considere atualizar para uma versão que não esteja yanked", empurrando os desenvolvedores para a única versão não yanked: a maliciosa 0.3.10.
- `arrayref` é uma dependência transitiva de `tiny-skia`, `sctk-adwaita` e `winit`, o que a coloca sob a maior parte do trabalho de GUI construído sobre `egui`, `eframe` e `iced`. O crate tem aproximadamente 245 milhões de downloads acumulados.

A equipe do crates.io removeu as versões maliciosas e o [banco de dados de advisories do RustSec](https://github.com/rustsec/advisory-db) publicou o advisory #3161. Mas a janela de dano é o ponto-chave: da publicação à remoção, todo build limpo de projetos afetados executou o payload silenciosamente.

## Os vetores de ataque que você precisa conhecer

**Typosquatting.** Atacantes publicam pacotes com nomes a um caractere de distância dos populares (`proc-macro1` vs `proc-macro2`, `requests` vs `requets`). O nome é a isca; o payload geralmente é um script de build/instalação.

**Comprometimento de contas.** Credential stuffing, tokens vazados ou 2FA fraco permitem que atacantes publiquem versões maliciosas sob um nome confiável. Foi assim que `arrayref` foi atingido. O PyPI tem [campanhas de comprometimento de contas](https://blog.pypi.org/) documentadas direcionadas a mantenedores.

**Confusão de dependências.** Um atacante envia um pacote com o mesmo nome de um pacote interno e privado para o registro público. Sistemas de build configurados incorretamente para preferir o registro público resolvem para a versão do atacante em vez da sua. [O artigo clássico de Russ Cox](https://research.swtch.com/deps) explica a taxonomia completa desses ataques.

**Payloads em tempo de build e de instalação.** O código executado durante `npm install`, `pip install` ou `cargo build` é execução arbitrária de código, ponto final. Pacotes legítimos usam hooks para compilação; os maliciosos os usam para downloads. O [backdoor do XZ Utils](https://en.wikipedia.org/wiki/XZ_Utils_backdoor) mostrou o mesmo princípio no nível de distro.

**Protestware e sabotagem.** Mantenedores podem transformar um pacote em comportamento destrutivo a qualquer momento (o incidente `colors`/`faker` é o caso canônico). O bom comportamento de hoje não é garantia para o amanhã.

## Defesa em profundidade: o que realmente funciona

Nenhuma ferramenta isolada impede tudo isso. A base prática é: lockfiles + auditorias + higiene de registros + publicadores verificados.

### 1. Faça commit e respeite seus lockfiles

Lockfiles fixam as versões exatas resolvidas de cada dependência transitiva. Se você não os versionar, cada instalação pode silenciosamente migrar para uma versão nova — possivelmente maliciosa.

- **npm/pnpm/yarn:** faça commit do `package-lock.json` / `pnpm-lock.yaml` / `yarn.lock`. Use `npm ci` no CI em vez de `npm install` (ele instala estritamente a partir do lockfile).
- **Python:** faça commit do `requirements.txt` com hashes fixados ou de um `poetry.lock` / `uv.lock`. O modo `--require-hashes` do pip se recusa a instalar qualquer pacote cujo hash não esteja declarado.
- **Cargo:** o `Cargo.lock` é versionado por padrão para binários. Não o exclua. Observe que os lockfiles sozinhos **não** impediram o ataque do arrayref — a versão maliciosa era a única não yanked, então a resolução do lockfile a escolheu mesmo assim. Lockfiles reduzem a deriva; eles não removem a confiança no registro.

### 2. Execute ferramentas de auditoria em cada build

| Ecossistema | Ferramenta | O que verifica |
|---|---|---|
| npm | [`npm audit`](https://docs.npmjs.com/cli/v10/commands/npm-audit) | Vulnerabilidades conhecidas na árvore de dependências contra o banco de dados de advisories do npm |
| Python | [`pip-audit`](https://pypi.org/project/pip-audit/) | Vulnerabilidades em pacotes instalados ou declarados contra advisories do OSV/PyPI |
| Python (Poetry) | [`poetry audit`](https://python-poetry.org/docs/cli/#audit) | Mesma classe de verificações, integrada ao Poetry |
| Rust | [`cargo audit`](https://github.com/RustSec/rustsec) | Vulnerabilidades do [banco de dados de advisories do RustSec](https://github.com/rustsec/advisory-db) — foi isso que sinalizou o incidente do arrayref |
| Todos | [OSV-Scanner](https://github.com/google/osv-scanner) | Examina lockfiles de vários ecossistemas contra o [osv.dev](https://osv.dev/), o banco de dados agregado de vulnerabilidades de código aberto |

Conecte essas ferramentas ao CI como portões de bloqueio, não como relatórios informativos. Uma auditoria com falha deve fazer o build falhar.

### 3. Ative os recursos de segurança dos registros

- **PyPI:** exija **Trusted Publishers** para publicar (tokens de curta duração em vez de chaves de API de longa duração) e imponha **2FA** para todas as contas de mantenedores. O PyPI vem promovendo 2FA obrigatória para projetos críticos justamente porque o comprometimento de contas é o ataque dominante.
- **npm:** use **provenance** (`npm publish --provenance`) para que os pacotes publicados carreguem atestações assinadas que os vinculam ao repositório de origem e à execução do CI. Os alertas do Dependabot no GitHub expõem automaticamente dependências com vulnerabilidades conhecidas — [configure-os](https://docs.github.com/en/code-security/dependabot/dependabot-alerts/about-dependabot-alerts) para todos os repositórios.
- **crates.io:** verifique o publicador de qualquer dependência nova. No caso do arrayref, uma verificação de um minuto no campo de autor e no link do repositório do `proc-macro1` (ambos forjados) foi a pista.

### 4. Avalie novas dependências antes de adicioná-las

- **Verifique o publicador:** idade da conta, outros pacotes publicados, se o repositório realmente existe e corresponde ao proprietário declarado.
- **Verifique contagens de download e data da primeira versão.** Um pacote de "aparência popular" publicado na semana passada com 10 milhões de downloads é uma bandeira vermelha, não uma verde.
- **Prefira pacotes conhecidos e mantidos ativamente.** Cada dependência é um compromisso permanente de confiança.
- **Minimize as dependências.** Cada dependência transitiva é mais uma conta que pode ser comprometida, mais um script de build que pode ser executado na sua máquina.

### 5. Reforce seu CI/CD

Os runners de CI têm acesso à rede e frequentemente guardam segredos — uma dependência envenenada no CI é uma oportunidade de roubo de credenciais. Use runners efêmeros, tokens com privilégio mínimo e examine seus workflows do GitHub Actions com ferramentas como [zizmor](https://github.com/woodruffw/zizmor), que detecta padrões vulneráveis de actions. A [documentação de segurança da cadeia de suprimentos do GitHub](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-supply-chain-security) é um bom mapa dos recursos integrados (Dependabot, verificação de segredos, SBOMs, atestações).

### 6. O que fazer se você for afetado

Se um incidente afetar sua árvore de dependências:

1. **Identifique a exposição:** verifique seu lockfile para a faixa de versão afetada; procure os indicadores conhecidos de comprometimento (no caso do arrayref: conexões de rede para `23.254.165.112`, arquivos `/tmp/rust-setup` ou `%TEMP%\rust-setup.ps1`).
2. **Isole:** presuma que tudo o que o build comprometido tocou está comprometido — isso inclui caches de build, artefatos de CI e ambientes locais.
3. **Gire as credenciais** que existiam nas máquinas/runners de CI afetados.
4. **Atualize para uma versão limpa** e fixe-a. Audite seu lockfile após a correção e execute novamente todo o pipeline.

## A conclusão honesta

O incidente do arrayref mostra que até mesmo um crate conhecido com centenas de milhões de downloads pode distribuir malware por meio de uma conta de mantenedor comprometida. As defesas que importam são as maçantes: lockfiles versionados, portões de auditoria bloqueantes no CI, 2FA e publicadores confiáveis nas contas dos registros, e o hábito de verificar quem realmente publicou os pacotes dos quais você depende. A segurança da cadeia de suprimentos não é uma ferramenta que você instala uma vez — é uma etapa de revisão que você repete em cada dependência que adiciona, para sempre.

Leia também:

- [Como Reduzir CVEs nas Suas Imagens Docker: Guia de Segurança de Containers [2026]]({{< relref "posts/reducing-cves-container-images-guide-2026/" >}})
- [Como Configurar e Usar Segredos do GitHub com Containers e Aplicações Expostas à Internet]({{< relref "posts/how-to-setup-github-secrets/" >}})
- [GitLost [2026]: Como a Injeção de Prompt no Agente de IA do GitHub Vaza Repositórios Privados]({{< relref "posts/gitlost-github-agentic-workflows-prompt-injection-2026/" >}})

---

Você pode entrar em contato para conversar sobre este e outros assuntos em <contact@lucasaguiar.xyz>
