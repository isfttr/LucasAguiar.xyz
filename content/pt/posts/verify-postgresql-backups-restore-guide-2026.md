---
date: 2026-08-28T18:04:00.000Z
draft: false
title: Como verificar se seus backups do PostgreSQL realmente podem ser restaurados [2026]
description: "Guia passo a passo para testar backups do PostgreSQL: validar arquivos pg_dump, restaurar em bancos de dados temporários, automatizar simulações de restauração com cron e acompanhar RPO/RTO. Inclui pgBackRest e restoredrill."
featured_image: ""
categories:
  - article
tags:
  - postgresql
  - backups
  - homelab
  - self-hosted
  - devops
slug: como-verificar-backups-postgresql-restaurados
translation_source_hash: 686b06ca1bc8dfce488fe4160b3bcc1920206a518a8cd3c6c35e69311589b9d2
---
Um backup que você nunca restaurou é um palpite, não uma garantia. Todo administrador PostgreSQL conhece o ritual: `pg_dump` roda todas as noites, o log diz sucesso, e a primeira restauração de verdade acontece durante uma indisponibilidade — exatamente quando você descobre que o dump está corrompido há três semanas, o arquivamento WAL parou de ser enviado, ou a restauração falha por causa de um tablespace ausente. Este guia mostra como verificar se os backups do PostgreSQL realmente restauram, com comandos concretos para backups lógicos e físicos, e como automatizar a verificação para que ela rode sem você.

## Por que backups falham silenciosamente

A maioria dos pipelines de backup falha de maneiras que terminam com exit 0. Os modos clássicos de falha:

- **Arquivos obsoletos**: o cron de backup morreu silenciosamente há meses, mas o diretório ainda mostra um arquivo antigo, então o monitoramento nunca dispara.
- **Dumps corrompidos**: erros de disco ou gravações interrompidas produzem um `.dump` que parece normal, mas falha no meio da restauração.
- **Segmentos WAL ausentes**: backups físicos com arquivamento contínuo são inúteis se o arquivamento parou de ser enviado ou se um segmento foi perdido.
- **Incompatibilidade de versão**: `pg_restore` para uma versão principal diferente da do dump, ou restaurar um dump mais novo em um servidor mais antigo.
- **Desvio de ambiente**: o caminho de restauração espera tablespaces, usuários ou extensões que não existem mais no destino.

A única maneira de detectar esses problemas é realmente executar uma restauração — em uma agenda, em um ambiente descartável, com verificações que leiam os dados de volta.

## Nível 1: Verificar backups lógicos (pg_dump)

Para backups lógicos feitos com `pg_dump -Fc`, comece com uma validação estrutural barata — ela lê o TOC do arquivo sem restaurar dados:

```bash
pg_restore --list backup.dump > /dev/null && echo "TOC OK"
```

Um TOC que é interpretado não significa que os dados estão intactos. O teste real é uma restauração completa em um banco de dados descartável:

```bash
createdb restore_test
pg_restore -d restore_test --no-owner --no-privileges backup.dump
```

Depois, verifique se os dados realmente voltaram — contagens de linhas e atualidade em algumas tabelas-chave:

```bash
psql -d restore_test -c "SELECT count(*) FROM users;"
psql -d restore_test -c "SELECT max(updated_at) FROM orders;"
```

Uma restauração pode terminar com exit 0 e ainda assim estar mentindo. Um incidente documentado por trás do projeto [restoredrill](https://github.com/ahmadpiran/restoredrill): um processo de restauração encerrou limpo enquanto o banco de dados por trás dele estava silenciosamente corrompido. É por isso que verificações no caminho de leitura importam, não apenas códigos de saída.

## Nível 2: Verificar backups físicos (pg_basebackup e WAL)

Backups físicos capturam o cluster inteiro, que é o que você precisa para recuperação point-in-time. Para verificar um, restaure o backup base em um diretório de dados temporário e deixe o PostgreSQL reproduzir o WAL:

```bash
tar xzf /backups/base_$(date +%F).tar.gz -C /tmp/pgtest
# if you archived WAL, put the needed segments where recovery expects them
pg_ctl -D /tmp/pgtest -o "-p 5433" start
```

Em seguida, verifique se a recuperação atingiu o ponto esperado:

```bash
psql -p 5433 -c "SELECT pg_is_in_recovery();"  # must return false after recovery completes
psql -p 5433 -c "SELECT now() - pg_last_xact_replay_timestamp();"  # small = WAL is fresh
```

Se você usa `pg_basebackup` com um replication slot, verifique se o slot não está travado e se o arquivamento WAL está realmente produzindo arquivos (`pg_wal` e tamanhos do destino de arquivamento crescendo). A documentação oficial sobre [arquivamento contínuo](https://www.postgresql.org/docs/current/continuous-archiving.html) cobre os requisitos.

## Nível 3: Ferramentas dedicadas — pgBackRest e Barman

Se você usa [pgBackRest](https://pgbackrest.org/), a verificação é nativa: `pgbackrest info` mostra o conjunto de backups, e você pode restaurar para um caminho alternativo sem tocar na produção:

```bash
pgbackrest --stanza=main --type=full --target=/tmp/pgtest restore
pgbackrest --stanza=main check   # validates configuration, repo, and archive connectivity
```

Execute `pgbackrest check` em uma agenda — ela verifica se o arquivamento funciona de ponta a ponta, que é o modo de falha que as pessoas descobrem por último.

## Automatize o exercício: um teste de restauração semanal

A verificação manual acontece uma vez e depois para. A solução é um cron job que restaura em um banco de dados de staging, executa asserções e alerta em caso de falha. Exemplo mínimo:

```bash
#!/bin/bash
set -euo pipefail
STAGING=restore_drill
dropdb --if-exists $STAGING
createdb $STAGING
pg_restore -d $STAGING --no-owner --no-privileges /backups/latest.dump
psql -d $STAGING -tAc "SELECT count(*) FROM users" | grep -qE '^[1-9]' || exit 1
psql -d $STAGING -c "SELECT max(updated_at) FROM orders" | grep -q 2026 || exit 1
echo "RESTORE DRILL PASSED at $(date -Is)" >> /var/log/restore-drill.log
```

A entrada no cron o executa semanalmente; um exercício com falha deve alertar você como qualquer outra indisponibilidade. Acompanhe dois números no log: **RPO** (quão recente é o backup) e **RTO** (quanto tempo a restauração levou). Se a sua restauração leva seis horas e o seu SLA diz quatro, o exercício está fazendo o trabalho dele ao provar isso.

## Ferramentas em 2026

O projeto Show HN [restoredrill](https://github.com/ahmadpiran/restoredrill) (30 pontos no Hacker News em agosto de 2026) é uma verificação nativa para CI: ele busca o backup mais recente, restaura-o em um contêiner Postgres descartável, executa suas asserções SQL e escreve um relatório JSON com timestamp — o formato de evidência que auditores pedem em SOC 2, ISO 27001 ou AWS Foundational Technical Review. Para um dashboard que gerencia vários motores de banco de dados, o [Databasus](https://github.com/databasus/databasus) inclui verificação de restauração com interface web, e o [BackupDrill](https://backupdrill.com) cobre o Supabase especificamente.

Para configurações de homelab, combine isso com um servidor de backup adequado: veja nosso guia sobre [instalação e configuração do Proxmox Backup Server]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}}) para a camada de infraestrutura.

## Lista de verificação

- [ ] `pg_restore --list` passa em cada dump lógico
- [ ] Restauração completa em um banco de dados descartável é executada pelo menos semanalmente
- [ ] Asserções de contagem de linhas e atualidade leem os dados de volta, não apenas códigos de saída
- [ ] `pgbackrest check` (ou `barman check`) é executado em uma agenda
- [ ] Um exercício de restauração restaura o ponto WAL mais recente, não um arquivo obsoleto
- [ ] RTO medido e comparado com sua meta
- [ ] Exercícios com falha alertam você — falhas silenciosas são o risco real

Uma restauração que você testou ontem é um backup. Uma restauração que você testou no ano passado é uma esperança. Automatize o exercício, registre a evidência e torne a falha barulhenta.

Leia também:

- [Proxmox Backup Server: instalação via community-scripts e configuração de backups [2026]]({{< relref "posts/proxmox-backup-server-community-scripts-2026/" >}})
- [Melhores Práticas de Desempenho do PostgreSQL para Homelab e Auto-hospedado [2026]]({{< relref "posts/postgresql-performance-best-practices-homelab-2026/" >}})
- [Corrupção do WAL do SQLite: Como Detectar, Corrigir e Prevenir em seu Homelab [2026]]({{< relref "posts/sqlite-wal-corruption-guide-2026/" >}})

---

Você pode entrar em contato para falar sobre este e outros assuntos em <contact@lucasaguiar.xyz>
