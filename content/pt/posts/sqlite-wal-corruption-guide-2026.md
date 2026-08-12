---
date: 2026-08-12T18:07:50.000Z
draft: true
title: 'Corrupção WAL do SQLite: Como Detectar, Corrigir e Prevenir [2026]'
description: 'Guia completo sobre corrupção de WAL do SQLite em 2026: detecte-a com PRAGMA integrity_check, recupere bancos de dados corrompidos e previna o bug de redefinição de WAL. Estudo de caso real incluído.'
featured_image: ''
categories:
  - article
tags:
  - sqlite
  - database
  - homelab
  - troubleshooting
  - backups
slug: corrupcao-wal-sqlite-detectar-corrigir-prevenir
translation_source_hash: 28c25860e990a471fcbf8f2a701f8a4cf2eeada7e34114cc56f416ff99e3db5e
---
SQLite está em toda parte: no seu celular, no seu navegador, na maioria dos aplicativos self-hosted, e até mesmo como banco de dados primário de grandes serviços de produção. É "tecnologia chata" no melhor sentido — até deixar de ser. Em agosto de 2026, a Tailscale publicou a história de como uma rara corrida de dados no código de checkpoint do SQLite corrompeu bancos de dados em seu plano de controle por seis meses, em 19 incidentes separados, antes que os desenvolvedores principais do SQLite rastreassem até um bug que estava escondido no código-fonte há pelo menos 16 anos.

Essa história é a desculpa perfeita para aprender o que fazer quando o SQLite reporta corrupção — e, mais importante, como evitá-la em primeiro lugar. Este guia cobre o modo WAL, como a corrupção acontece, como detectá-la, como se recuperar dela e o que mudou no SQLite 3.51.3+ para corrigir o bug de reset do WAL.

## Como funciona o modo WAL do SQLite

Um banco de dados SQLite é uma série de páginas de tamanho fixo. Quando você atualiza dados, algumas dessas páginas precisam ser substituídas. No modo padrão de journal de rollback, as novas páginas são gravadas diretamente no arquivo principal do banco de dados. No [modo Write-Ahead Logging (WAL)](https://www.sqlite.org/wal.html), novas páginas são anexadas a um arquivo separado, o arquivo `-wal`, o que torna as gravações mais rápidas e permite que leitores e escritores coexistam.

As páginas acumuladas no arquivo WAL não podem ficar lá para sempre. Em algum momento, elas são copiadas de volta para o arquivo principal do banco de dados — um processo chamado **checkpoint**. Na maioria das implantações, o SQLite executa um checkpoint automático quando o arquivo WAL atinge cerca de 1000 páginas, e você nunca pensa sobre isso. Mas você também pode assumir o controle manual dos checkpoints, que foi o que a Tailscale fez para poder executar backups rápidos e consistentes de seus shards.

## O que era o bug de reset do WAL

Durante um checkpoint, o SQLite copia páginas do arquivo WAL para o banco de dados principal e depois redefine (reseta) o WAL. O bug encontrado em 2026 era uma corrida de dados entre um checkpoint e uma transação de gravação concorrente: se uma gravação ocorre em um momento muito específico durante o checkpoint, a lógica do checkpoint acredita que as páginas foram copiadas quando não foram. Essas páginas nunca são gravadas no arquivo de banco de dados, e os dados são permanentemente perdidos. Outras páginas que referenciam as ausentes — um índice, por exemplo — são gravadas mesmo assim, e o banco de dados se torna corrompido.

Os desenvolvedores do SQLite o nomearam como **WAL-reset bug** e estimaram que ele existia há pelo menos 16 anos. Ele sobreviveu tanto tempo porque é extraordinariamente raro: os mantenedores tiveram que adicionar código que deliberadamente dispara a corrida apenas para reproduzi-lo em testes. A Tailscale o encontrou repetidamente apenas porque executava uma configuração incomum e agressiva — checkpoint manual em todos os shards, várias vezes ao dia.

A correção foi lançada no SQLite 3.52.0 e, após um incidente de falso alarme (um segundo bug envolvendo índices de expressão obsoletos), foi relançada como **SQLite 3.51.3**, que contém apenas a correção do WAL-reset. O SQLite 3.53.0 adicionou posteriormente um recurso automatizado de auto-recuperação de índices que evita o problema do índice de expressão obsoleto. O shim de VFS de depuração que tornou a investigação possível, `tmstmpvfs`, é [código aberto no repositório do SQLite](https://sqlite.org/src/file/ext/misc/tmstmpvfs.c).

## Como detectar corrupção no SQLite

A corrupção geralmente se anuncia com um destes sintomas:

- Erros `SQLITE_CORRUPT` ou a mensagem `database disk image is malformed`
- Consultas que funcionavam ontem retornando lixo ou falhando
- Um aplicativo que trava na inicialização ou perde dados gravados recentemente

A verificação canônica é o comando [PRAGMA integrity_check](https://www.sqlite.org/pragma.html#pragma_integrity_check):

```bash
sqlite3 myapp.db "PRAGMA integrity_check;"
```

Se tudo estiver certo, ele retorna `ok`. Se não, ele lista os objetos danificados. Para uma verificação mais rápida, porém menos completa, use `PRAGMA quick_check`. Se o seu banco de dados é um serviço crítico, faça o que a Tailscale fez: execute `integrity_check` continuamente sobre seus backups, não apenas no arquivo vivo. Isso transforma um evento de corrupção silencioso em um alerta que você pode acionar antes que ele chegue à produção.

## Como recuperar um banco de dados corrompido

Suas opções, em ordem de preferência:

1. **Restaurar a partir do backup.** É para isso que os backups existem. Se o seu último backup íntegro é recente, restaure-o e refaça as alterações feitas desde então.
2. **Use o comando `.recover`.** O SQLite acompanha uma [ferramenta de recuperação](https://www.sqlite.org/recovery.html) que extrai o máximo de dados possível de um arquivo de banco de dados danificado:
   ```bash
   sqlite3 corrupted.db ".recover" | sqlite3 recovered.db
   ```
   Ela funciona escaneando as páginas brutas, então pode resgatar dados mesmo quando a estrutura b-tree está danificada. Espere alguma limpeza manual depois.
3. **Despeje o que puder.** `sqlite3 corrupted.db ".dump"` exporta SQL legível; salve as tabelas que ainda funcionam e reconstrua o resto a partir de logs ou memória.
4. **Replay de transações (avançado).** A Tailscale construiu um pipeline que transmite cada declaração de gravação para um arquivo de log e, em seguida, reproduz esse log contra o último backup íntegro conhecido. Como o SQLite é de escritor único com transações serializáveis, o histórico é linear e determinístico — algo que não funcionaria em um banco de dados multi-escritor como PostgreSQL ou MySQL. Isso é exagero para a maioria das configurações, mas é o padrão a copiar se você usa SQLite como armazenamento de dados de produção.

Qualquer que seja o caminho escolhido, trate o incidente como um sinal: investigue *por que* isso aconteceu antes de voltar à operação normal.

## Como prevenir corrupção

A maior parte da corrupção no SQLite não é causada por uma corrida de 16 anos. Os culpados habituais são queda de energia, discos com defeito, bugs de aplicação ou múltiplos processos gravando no mesmo banco de dados. A lista prática:

- **Atualize o SQLite.** Se você embute seu próprio SQLite (o módulo `sqlite3` do Python, muitos drivers Go, runtimes de linguagem), verifique a versão: `sqlite3 --version` ou `python3 -c "import sqlite3; print(sqlite3.sqlite_version)"`. A correção do WAL-reset chegou na 3.51.3 — qualquer versão mais antiga está exposta a um bug que precisou de um contrato de suporte profissional para ser encontrado. Veja o [changelog do SQLite](https://sqlite.org/changes.html) para as versões exatas.
- **Mantenha o checkpoint padrão.** Deixe o checkpoint automático do SQLite fazer seu trabalho, a menos que você tenha um motivo concreto para assumir o controle manual. O checkpoint manual foi a escolha "não padrão" que colocou a Tailscale no lado errado do bug.
- **Disciplina de escritor único.** O SQLite é projetado para um escritor. Se dois processos gravam no mesmo arquivo, você *vai* ter corrupção eventualmente.
- **Execute verificações de integridade nos backups.** Um backup que ninguém verifica é uma esperança, não um backup.
- **Use um sistema de arquivos saudável.** A corrupção é muitas vezes um sintoma de um disco morrendo. Se um banco de dados continua estragando, verifique os dados SMART e considere substituir o armazenamento.
- **Considere o modo WAL deliberadamente.** O WAL melhora a concorrência e a durabilidade, mas cria os arquivos auxiliares `-wal` e `-shm`. Se sua ferramenta de backup copia apenas o arquivo principal, você está fazendo backup de um snapshot sem as gravações recentes — faça checkpoint antes de copiar, ou use `sqlite3 db "PRAGMA wal_checkpoint(TRUNCATE);"`.

## Por que isso importa para homelabs

Aplicativos self-hosted estão cheios de bancos de dados SQLite — ferramentas de anotações, servidores de mídia, dashboards de monitoramento, até mesmo alguns registries de contêineres. Os modos de falha são os mesmos em todas as escalas, e os procedimentos de recuperação são idênticos. A diferença é que você provavelmente não tem os runbooks da Tailscale, então a prevenção e os backups verificados importam ainda mais.

Se você está escolhendo entre SQLite e um banco de dados cliente-servidor para um novo projeto, nosso guia sobre [Práticas recomendadas de performance do PostgreSQL para homelabs]({{< relref "posts/postgresql-performance-best-practices-homelab-2026/" >}}) cobre a principal alternativa. E se você executa algum serviço self-hosted exposto à internet, nosso guia sobre [como detectar e bloquear tráfego de bots]({{< relref "posts/detect-block-bot-traffic-selfhosted-guide-2026/" >}}) é um bom complemento para uma rotina de stack saudável.

O bug de reset do WAL é um lembrete de que até o software mais testado em batalha tem arestas — e que a diferença entre uma semana ruim e uma saga de seis meses é geralmente monitoramento, backups verificados e um playbook de recuperação.

Leia também:

- [Práticas recomendadas de performance do PostgreSQL para Homelab e Self-Hosted [2026]]({{< relref "posts/postgresql-performance-best-practices-homelab-2026/" >}})
- [Como detectar e bloquear tráfego de bots no seu site self-hosted [2026]]({{< relref "posts/detect-block-bot-traffic-selfhosted-guide-2026/" >}})
- [Práticas recomendadas de performance do PostgreSQL para Homelab e Self-Hosted [2026]]({{< relref "posts/postgresql-performance-best-practices-homelab-2026/" >}})

---

Você pode entrar em contato para falar sobre este e outros assuntos em <contact@lucasaguiar.xyz>
