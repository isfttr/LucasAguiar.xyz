---
date: 2026-07-21T18:07:11.000Z
draft: true
title: 'Como Perfilhar Código Python em 2026: Um Guia para o Compilador JIT do Python 3.15 e o Tachyon Profiler'
description: 'Guia completo do novo ecossistema de profiling do Python 3.15: o compilador JIT atualizado com rastreamento de sobrecarga ultrabaixa, o profiler de amostragem estatística Tachyon, migração do cProfile e exemplos práticos de código. [2026]'
featured_image: ''
categories:
  - article
tags:
  - python
  - profiling
  - performance
  - JIT
  - developer-tools
slug: guia-perfilhar-python-jit-tachyon
translation_source_hash: de987b86b1039ae93bb403596854ef4239316c0c69dc13c77a2b4a5852d233de
---
Você tem um script Python que leva cinquenta segundos para executar. Não faz ideia do porquê. Toda ferramenta de profiling que tenta ou o torna extremamente lento ou fornece uma saída confusa. Essa tem sido a realidade do profiling em Python por anos — até o Python 3.15.

O lançamento 3.15 (previsto para outubro de 2026) traz duas mudanças complementares que alteram fundamentalmente como você aborda a performance em Python: um compilador JIT atualizado com um modo de profiling de ultrabaixa sobrecarga e um novo módulo da biblioteca padrão chamado `profiling` — lar do Tachyon, um profiler de amostragem estatística que introduz sobrecarga quase zero.

Este guia aborda ambos os sistemas, quando usar cada um e como migrar das ferramentas legadas.

## O Problema com o Profiling Tradicional em Python

Antes do 3.15, o Python trazia dois profilers de rastreamento: `profile` (Python puro, lento) e `cProfile` (baseado em C, prático). Ambos funcionam instrumentando cada chamada e retorno de função — rastreamento determinístico. Isso introduz sobrecarga mesmo para uso mínimo e, criticamente, pode desabilitar certas otimizações do interpretador introduzidas pela PEP 659 (o "interpretador adaptativo especializador" anterior).

O cProfile também observa apenas a thread principal, tornando-o quase inútil para programas concorrentes modernos que usam threading, asyncio ou a build free-threaded (disponível desde o 3.13).

Várias ferramentas de terceiros preencheram a lacuna: py-spy (amostragem estatística), pyperf (microbenchmarking), scalene (profiling de CPU+memória). Mas a oferta da biblioteca padrão estava presa nos anos 2000.

## Abordagem Dupla de Profiling do Python 3.15

O lançamento 3.15 aborda isso de dois ângulos simultaneamente — um para o próprio pipeline de compilação JIT do interpretador e outro para o desenvolvedor que precisa entender onde seu código gasta tempo.

### 1. O Compilador JIT Atualizado: Rastreamento de Ultrabaixa Sobrecarga

O Python 3.13 introduziu um compilador JIT experimental (copy-and-patch). O 3.15 o atualiza significativamente com um JIT de gravação de rastreamento — o interpretador grava um fluxo de instruções durante a execução real do programa e então compila caminhos quentes.

A inovação principal é o próprio mecanismo de profiling. O desenvolvedor principal do CPython, Ken Jin, documentou a abordagem em detalhes: em vez do design tradicional de dois interpretadores (um para execução, um para profiling) ou um modo de profiling com muitos branches, o CPython 3.15 usa **tabelas de despacho duplas**.

Em tempo de execução, alternar entre modo normal e de profiling é apenas trocar um ponteiro — sem branches, sem duplicação de interpretador:

```c
#define ENTER_TRACING() \
    DISPATCH_TABLE_VAR = TRACING_DISPATCH_TABLE;
#define LEAVE_TRACING() \
    DISPATCH_TABLE_VAR = DISPATCH_TABLE;
```

A tabela de despacho de profiling direciona todos os opcodes para uma única instrução de gravação (fan-in), que faz o trabalho de profiling e então despacha de volta para o interpretador normal para execução (fan-out). O resultado, medido no benchmark de Ken Jin: o interpretador de profiling executa apenas **4,5× mais lento** que o interpretador puro — em comparação com a sobrecarga de meta-rastreamento do PyPy de 900-1000×.

Isso importa mesmo se você nunca chamar um profiler explicitamente: permite que o JIT identifique e compile caminhos de código quentes sem a sobrecarga que anularia o propósito.

### 2. O Módulo `profiling` e o Tachyon (PEP 799)

A PEP 799, de autoria de Pablo Galindo Salgado e László Kiss Kollár, reorganiza as ferramentas de profiling do Python sob um único namespace coerente:

| Módulo | O que faz | Status |
|--------|-----------|--------|
| `profiling.tracing` | Rastreamento determinístico de chamadas de função (realocado do `cProfile`) | Novo no 3.15 |
| `profiling.sampling` | Profiler de amostragem estatística — **Tachyon** | Novo no 3.15 |
| `cProfile` | Profiler de rastreamento antigo | Apelido, obsoleto |
| `profile` | Profiler de rastreamento em Python puro | Obsoleto, removido no 3.17 |

**Tachyon** é o recurso principal. Ele usa amostragem estatística para inferir características de performance gravando periodicamente a pilha de chamadas do programa. Isso significa:

- Sobrecarga de tempo de execução quase zero (fração de um por cento vs. 2-10× para rastreamento)
- Funciona com múltiplas threads, funções assíncronas e builds free-threaded
- Pode anexar a processos já em execução
- Funciona com otimizações do interpretador ativadas (profilers de rastreamento desabilitam algumas delas)

## Guia Prático: Profile Seu Código Python no 3.15

### Início Rápido: Amostragem com Tachyon

```python
import profiling.sampling
import time

profiler = profiling.sampling.Profiler()
profiler.start()

# Seu código aqui
def slow_function():
    total = 0
    for i in range(10_000_000):
        total += i ** 2
    return total

result = slow_function()
time.sleep(1)

profiler.stop()
profiler.print_stats()
```

A saída mostra quais funções consumiram mais tempo de CPU, amostradas em intervalos de milissegundos. Nenhuma instrumentação de chamada de função é necessária.

### Comparando Rastreamento vs. Amostragem

```python
# Abordagem antiga: rastreamento com cProfile
import cProfile
cProfile.run('slow_function()', sort='cumtime')

# Nova abordagem: profiling.tracing (equivalente semântico)
import profiling.tracing
profiling.tracing.run('slow_function()', sort='cumtime')

# Nova abordagem: amostragem com Tachyon (recomendado para a maioria dos casos)
import profiling.sampling
prof = profiling.sampling.Profiler()
prof.start()
slow_function()
prof.stop()
prof.print_stats()
```

Use `profiling.tracing` quando precisar de contagens exatas de chamadas — você precisa saber que uma função foi chamada exatamente 14.327 vezes. Use `profiling.sampling` quando precisar entender onde o tempo está sendo gasto com distorção mínima.

### Anexando a um Processo em Execução

O Tachyon pode anexar a um processo Python já em execução — inestimável para depurar problemas de produção:

```bash
# Inicie seu script normalmente
python my_script.py

# Em outro terminal, anexe:
python -m profiling.sampling --attach $(pgrep -f my_script.py) --duration 30
```

Isso funciona porque a amostragem estatística não modifica o bytecode ou a execução do processo alvo — ela apenas lê a pilha de chamadas em intervalos.

### Profiling de Código Asyncio e Multithread

```python
import asyncio
import profiling.sampling

async def main():
    prof = profiling.sampling.Profiler()
    prof.start()
    
    async def worker(n):
        await asyncio.sleep(0.1)
        return sum(i ** n for i in range(10_000))
    
    tasks = [worker(i) for i in range(1, 5)]
    results = await asyncio.gather(*tasks)
    
    prof.stop()
    prof.print_stats()

asyncio.run(main())
```

O Tachyon atribui corretamente as amostras à thread ou tarefa assíncrona correta — algo que o cProfile não consegue fazer.

## Guia de Migração: Saindo do cProfile

Se você tem código de profiling existente usando `cProfile`, a migração é direta:

```python
# Antes (Python ≤3.14)
import cProfile
p = cProfile.Profile()
p.enable()
run_code()
p.disable()
p.print_stats(sort='time')

# Depois (Python 3.15+)
import profiling.tracing
p = profiling.tracing.Profile()
p.enable()
run_code()
p.disable()
p.print_stats(sort='time')
```

Para a maioria dos usuários, trocar de `cProfile` para `profiling.sampling` é a atualização mais impactante — mas a API é diferente porque a metodologia (amostragem vs. rastreamento) é fundamentalmente diferente.

## O que o JIT Significa para Performance

O JIT atualizado com gravação de rastreamento significa que **loops quentes e funções chamadas com frequência são compilados para código de máquina nativo em tempo de execução**. O modo de profiling de ultrabaixa sobrecarga torna viável fazer profiling de mais caminhos de código do que antes, levando a melhores decisões de otimização do JIT.

Na prática, benchmarks no pyperformance mostram ganhos modestos, mas consistentes — tipicamente 5-15% em código vinculado a CPU, com ganhos maiores em padrões específicos (loops apertados, operações numéricas). A verdadeira vitória é a infraestrutura de profiling: o JIT agora pode rastrear e compilar padrões de código que antes eram caros demais para serem perfilados.

## Quando Usar Cada Ferramenta

| Cenário | Ferramenta | Porquê |
|---------|------------|--------|
| Encontrar funções lentas no seu código | `profiling.sampling` (Tachyon) | Sobrecarga quase zero, funciona com otimizações |
| Depurar um problema de produção | `profiling.sampling --attach` | Nenhuma alteração no código necessária |
| Contar chamadas de função exatas | `profiling.tracing` | Única opção para contagens de chamadas |
| Microbenchmark de um caminho quente | `timeit` + aquecimento do JIT | Evitar completamente a sobrecarga de profiling |
| Entender o comportamento do JIT | `PYTHON_JIT_RESUME_INITIAL_VALUE=1` | Controlar quando o rastreamento JIT dispara |

## O que Foi Obsoleto

- **Módulo `profile`** — profiler de rastreamento em Python puro. Obsoleto no 3.15, avisos de remoção no 3.16, removido no 3.17. Substitua por `profiling.sampling` para a maioria dos casos de uso, ou `profiling.tracing` se precisar de contagens exatas de chamadas.
- **`cProfile`** — permanece como um apelido para `profiling.tracing` para compatibilidade reversa, mas código novo deve importar de `profiling.tracing`.

## Resumo

As melhorias de profiling do Python 3.15 representam a atualização mais significativa nas ferramentas de performance da biblioteca padrão desde que `cProfile` foi adicionado no Python 2.5 (2006). A combinação de um JIT de gravação de rastreamento com um modo de profiling de baixa sobrecarga, mais o novo módulo `profiling` e o amostrador estatístico Tachyon, significa que desenvolvedores Python finalmente têm ferramentas de profiling modernas e de primeira classe integradas à linguagem.

Se você está mantendo código Python em 2026, a mudança mais impactante que pode fazer este ano é trocar de `cProfile` para `profiling.sampling` no seu trabalho diário de performance. A diferença de sobrecarga — 4,5× vs. 900× em casos extremos — é a diferença entre profiling como tarefa e profiling como reflexo.

Leia também:

- [Módulos Python: Um Guia para Iniciantes para Organizar Seu Código]({{< relref "posts/python-modules-guide/" >}})
- [Desempenho e Melhores Práticas do SQLite: Um Guia Prático para Desenvolvedores e Usuários de Homelab [2026]]({{< relref "posts/sqlite-performance-best-practices-guide-2026/" >}})
- [Duas Semanas com GitButler: Simplificando Meu Fluxo de Trabalho Git]({{< relref "posts/one-week-review-gitbutler/" >}})

---

Entre em contato para falar sobre este e outros assuntos no email <contact@lucasaguiar.xyz>
