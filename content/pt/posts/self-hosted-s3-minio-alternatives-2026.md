---
date: 2026-09-15T18:00:00.000Z
draft: false
title: "MinIO foi arquivado: alternativas S3 auto-hospedadas para seu homelab [2026]"
description: MinIO foi arquivado e não distribui mais imagens Docker gratuitas. Compare as melhores alternativas S3 auto-hospedadas em 2026 - VersityGW, Garage, SeaweedFS, RustFS - com configurações Docker funcionais.
featured_image: ""
categories:
  - article
tags:
  - homelab
  - self-hosted
  - storage
  - docker
  - s3
slug: minio-arquivado-alternativas-s3-auto-hospedadas-homelab
translation_source_hash: 7de229d0d74507f9857fecd035cc4b300c8336cb3d5e1ec1358c6d95f6b2c694
---
O MinIO foi arquivado. O repositório que, durante uma década, foi a resposta padrão para "como faço para obter um endpoint S3 no meu homelab" foi arquivado no GitHub, seu último commit é de abril de 2026, e o projeto parou de distribuir imagens Docker gratuitas no final de 2025. Se você tem `minio/minio` fixado em um arquivo Compose, essa tag fixada ainda funciona — mas você está executando um software que ninguém está corrigindo.

Este guia aborda o que realmente mudou, para o que você deve migrar dependendo do seu caso de uso e configurações funcionais para as quatro alternativas que têm tração real na comunidade em 2026.

## O que realmente aconteceu com o MinIO

A sequência de eventos importa porque explica por que as alternativas são o que são:

1. **Final de 2025:** O MinIO parou de publicar imagens Docker gratuitas para a edição comunitária. A tag `latest` parou de ser atualizada. As tags existentes permaneceram no Docker Hub.
2. **Início de 2026:** O repositório `minio/minio` no GitHub entrou em modo de manutenção — a atividade de commits efetivamente parou.
3. **Abril de 2026:** O repositório foi formalmente arquivado. Somente leitura. Issues fechadas, pull requests rejeitados.
4. **A licença AGPL-3.0 nunca mudou.** Esta é a parte que as pessoas entendem errado. O MinIO não trocou a licença para algo proprietário — apenas parou de manter a edição de código aberto e direcionou a empresa para um produto comercial.

A consequência prática: sua imagem `minio/minio:RELEASE.2025-xx-xx` ainda inicializa e ainda serve a API S3. Mas qualquer CVE publicado depois dessa data fica sem correção, a menos que você migre. Para um homelab que armazena fotos de família ou um ambiente de desenvolvimento, esse é um risco administrável. Para qualquer coisa exposta à internet, não é.

Existe um fork da comunidade, [pgsty/minio](https://github.com/pgsty/minio), que promete uma distribuição mantida e com correções de CVE. Vale a pena conhecê-lo, mas é um esforço de um único mantenedor que herda uma base de código muito grande — trate-o como uma solução temporária, não como um destino.

## O que você realmente precisa de um endpoint S3

Antes de escolher um substituto, seja honesto sobre qual destes você precisa:

| Requisito | Se você precisa disso | Se você não precisa disso |
|---|---|---|
| Compatibilidade com a API S3 | Qualquer uma das opções abaixo | `sftp` ou NFS |
| Durabilidade de dados / replicação | Garage, SeaweedFS, Ceph | VersityGW, S3Proxy |
| Pegada mínima (um contêiner, um binário) | VersityGW, S3Proxy | Garage, SeaweedFS |
| Montar os mesmos dados via POSIX | VersityGW | a maioria dos outros |
| Funciona com um único disco | todas elas | — |
| Longa trajetória | SeaweedFS (2012), S3Proxy (2014) | RustFS (2024) |

A maioria dos homelabs precisa de algo muito mais simples do que imagina. Se seu requisito é "minha ferramenta de backup fala S3 e quero que ela grave em uma pasta no meu NAS", você não precisa de um armazenamento de objetos distribuído com uma API de layout de cluster.

## Opção 1: VersityGW — A que as pessoas realmente recomendam

Se você leu a thread do Hacker News que seguiu a [comparação de alternativas ao MinIO feita por Robin Moffatt](https://rmoff.net/2026/01/14/alternatives-to-minio-for-single-node-local-s3/)um nome continua aparecendo espontaneamente: [VersityGW](https://github.com/versity/versitygw).

O padrão vindo de profissionais é consistente. "Mudei para o Versity para o homelab, tem sido simples e estável como uma rocha. Aponte para um diretório por bucket e pronto." Outro: "Meu objetivo era substituir o MinIO, que eu conseguia executar e configurar com um único comando Docker. O VersityGW funciona igualmente bem para isso."

Ele é Apache-2.0, escrito em Go, ativamente desenvolvido (commits nas últimas 24 horas, até o momento desta escrita) e — crucialmente — é um **gateway**, não um mecanismo de armazenamento. Ele traduz a API S3 para um sistema de arquivos POSIX que você já tem. Isso significa que um bucket é apenas um diretório: você pode usar `ls` nele, fazer `rsync` nele, ou ler os mesmos arquivos via NFS sem passar pelo S3.

Configuração mínima no Docker:

```yaml
services:
  versitygw:
    image: versity/versitygw:latest
    ports:
      - "7070:7070"
    environment:
      ROOT_ACCESS_KEY: "your-access-key"
      ROOT_SECRET_KEY: "your-secret-key"
    volumes:
      - /mnt/pool/s3data:/data
      - /mnt/pool/versions:/versions
    command: >
      --port :7070
      --iam-dir /data/.iam
      posix --versioning-dir /versions /data
```

Depois, aponte qualquer cliente S3 para `http://your-host:7070` com endereçamento no estilo de caminho. Ele também inclui uma WebGUI opcional e suporta hospedagem de sites estáticos a partir de buckets, o que é um truque interessante se você quiser servir assets sem executar o nginx.

**Contrapartida:** O VersityGW não oferece replicação nem codificação por apagamento. Sua durabilidade é o que o sistema de arquivos subjacente oferecer. Isso é adequado em um homelab de nó único com ZFS ou Btrfs, e não é adequado se você dependia do modo distribuído do MinIO.

## Opção 2: Garage — A opção distribuída

[Garage](https://garagehq.deuxfleurs.fr/) é um armazenamento de objetos compatível com S3 projetado para pequenos clusters auto-hospedados e geograficamente distribuídos. Ele é AGPL-3.0, apoiado por financiamentos da NGI/NLnet, e é a opção que realmente faz a parte distribuída de forma adequada.

A reclamação histórica sobre o Garage era o atrito na configuração — ele exigia uma etapa de layout, um formato de chave separado (prefixo `GK` mais hexadecimal) e um arquivo TOML. Isso mudou na **v2.3.0**, que adicionou um modo de nó único usando variáveis de ambiente:

```yaml
services:
  garage:
    image: dxflrs/garage:v2.3.0
    ports:
      - "3900:3900"
      - "3902:3902"
      - "3903:3903"
    environment:
      GARAGE_DEFAULT_ACCESS_KEY: "GK$(openssl rand -hex 16)"
      GARAGE_DEFAULT_SECRET_KEY: "$(openssl rand -hex 32)"
      GARAGE_DEFAULT_BUCKET: "default-bucket"
    volumes:
      - ./garage.toml:/etc/garage.toml
      - ./meta:/var/lib/garage/meta
      - ./data:/var/lib/garage/data
```

Com um `garage.toml` mínimo apontando `metadata_dir` e `data_dir` para esses volumes, além de um `rpc_secret` gerado por `openssl rand -hex 32`. O [quick-start](https://garagehq.deuxfleurs.fr/documentation/quick-start/) documenta o arquivo completo.

**Escolha o Garage se** você planeja adicionar um segundo nó depois e quer crescer para um cluster de verdade. **Deixe de lado se** você quer um contêiner único que funcione de imediato — a abstração é mais pesada do que um homelab precisa, e a superfície de compatibilidade com a AWS é deliberadamente mais estreita que a do MinIO.

## Opção 3: SeaweedFS — O veterano

[SeaweedFS](https://github.com/seaweedfs/seaweedfs) existe desde 2012 e suporta S3 desde 2018. Apache-2.0, mais de 34 mil estrelas, um mantenedor principal (Chris Lu) além de uma oferta empresarial comercial. Ele lida com o caso de "bilhões de arquivos pequenos" melhor do que qualquer outra coisa nesta lista, o que é uma diferença real se sua carga de trabalho for de milhões de objetos minúsculos em vez de alguns grandes.

Notas operacionais de quem já o executou: o gerenciamento de usuários pela API de administração teve pontos problemáticos (o endpoint de exclusão de usuário foi relatado como não confiável), e regras de expiração de ciclo de vida exigem configuração em vez da API S3. Os autores responderam removendo a exigência de um arquivo extra de configuração de autenticação pouco depois da comparação de janeiro de 2026, o que simplifica a inicialização em nó único.

**Escolha o SeaweedFS se** você precisa de escala no número de objetos, ou quer um projeto com uma década de histórico em produção. **Deixe de lado se** você quer a menor superfície possível.

## Opção 4: RustFS — Rápido, novo, leia com cuidado

[RustFS](https://github.com/rustfs/rustfs) apareceu em 2024 e cresceu rápido — 32 mil estrelas, Apache-2.0, e benchmarks alegando cerca de 2,3x o MinIO em payloads de 4KB. Ele tem uma GUI integrada e ferramentas de migração para coexistir com MinIO ou Ceph.

A avaliação honesta da comunidade é mista e vale a pena citar diretamente. Um comentarista: "Usamos RustFS em um sistema de produção sem problemas. Fizemos a migração após as mudanças de licença do MinIO." Outro, de alguém que tentou versões anteriores: "Encontrei bug após bug após bug no RustFS. A versão atual parece funcionar bem por enquanto, mas com certeza é um 'projeto novo'. Os mantenedores reagem muito rápido a qualquer bug que eu enviei."

Também houve uma vulnerabilidade de segurança relatada no projeto durante seu período alfa, e ele ainda era rotulado como alfa no início de 2026.

**Escolha o RustFS se** você quer desempenho e está disposto a acompanhar os lançamentos de perto. **Deixe de lado se** você quer configurá-lo uma vez e esquecê-lo por três anos.

## A opção de duas horas: `rclone serve s3`

Se você já tem o `rclone` instalado — e, se faz backups, provavelmente tem — talvez não precise de nenhuma das opções acima para desenvolvimento local:

```bash
rclone serve s3 --auth-proxy /path/to/config --addr :8080 /mnt/storage
```

Isso expõe um diretório local pela API S3. Não é um armazenamento de objetos de produção e não fará replicação, mas para "preciso de um endpoint S3 para que minha suíte de testes pare de acessar o bucket real", é praticamente o mais simples possível. A documentação está em [rclone.org/commands/rclone_serve_s3](https://rclone.org/commands/rclone_serve_s3/).

Há também o [S3Proxy](https://github.com/gaul/s3proxy) (Apache-2.0, de 2014), que faz praticamente a mesma coisa em Java. Uma ressalva: uma de suas dependências, o jclouds, foi aposentada para o Apache Attic em 2025.

## Migrando sem reenviar tudo

A boa notícia é que S3 é S3. A migração é uma operação de cópia, e o `rclone` é a ferramenta:

```bash
# Copy from old MinIO to new endpoint, server-side where possible
rclone copy minio:my-bucket newgw:my-bucket \
  --s3-provider Other \
  --s3-endpoint http://localhost:7070 \
  --transfers 8 --checkers 16 --progress
```

Configure ambos os remotes em `~/.config/rclone/rclone.conf` com `provider = Other` (ou `Minio`) e valores explícitos de `endpoint`. Depois verifique antes de desativar o contêiner antigo — uma contagem de objetos e uma comparação de checksum, não apenas uma listagem de diretório:

```bash
rclone check minio:my-bucket newgw:my-bucket --size-only
```

Se seus buckets contêm dumps de banco de dados ou backups, este é exatamente o momento de confirmar que as cópias realmente restauram, o que é uma disciplina separada que vale a pena ler em nosso guia sobre [como verificar se seus backups do PostgreSQL realmente restauram]({{< relref "posts/verify-postgresql-backups-restore-guide-2026/" >}}).

E se você está movendo cargas de trabalho de analytics para armazenamento de objetos — o padrão que tornou o MinIO onipresente em primeiro lugar — o DuckDB pode consultar arquivos Parquet diretamente de qualquer um desses endpoints. Nosso [guia do DuckDB para analytics auto-hospedado]({{< relref "posts/duckdb-self-hosted-analytics-guide-2026/" >}}) explica a configuração do segredo `httpfs`; apenas a URL do endpoint muda quando você troca o backend.

## Qual deles você deve escolher

Para um homelab de nó único que armazena backups, mídia ou arquivos que outros serviços leem via S3:

- **VersityGW** — mais simples, mais recomendado, transparente para POSIX. Comece por aqui.
- **SeaweedFS** — se você tem um número enorme de objetos pequenos ou quer 14 anos de histórico.
- **Garage** — se você quer crescer para um cluster e gosta do modelo de governança do projeto.
- **RustFS** — se você quer acompanhar um projeto em rápida evolução e consegue monitorar os lançamentos.
- **Fique na sua imagem fixada do MinIO** — se os dados não são críticos, nunca são expostos à internet e você aceita que é um software congelado.

A única coisa que não vale a pena é iniciar uma nova implantação no MinIO em 2026. As imagens continuarão inicializando por anos, mas você estará refazendo essa decisão mais tarde sob circunstâncias piores do que as de hoje.

Uma observação de organização: se você está trocando o contêiner pela primeira vez, este é um bom momento para verificar se você deveria executá-lo em um contêiner, afinal, em vez de uma VM dedicada. Os trade-offs são abordados em nossa [comparação entre contêineres e máquinas virtuais]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}}).

Leia também:

- [Como verificar se seus backups do PostgreSQL realmente restauram [2026]]({{< relref "posts/verify-postgresql-backups-restore-guide-2026/" >}})
- [DuckDB para analytics auto-hospedado: consulte CSV, Parquet e JSON em segundos [2026]]({{< relref "posts/duckdb-self-hosted-analytics-guide-2026/" >}})
- [Contêineres Docker vs máquinas virtuais: guia completo de comparação [2026]]({{< relref "posts/containers-vs-vms-complete-guide-2026/" >}})

---

Pode entrar em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
