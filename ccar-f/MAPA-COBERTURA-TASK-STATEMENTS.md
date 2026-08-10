# Mapa de Cobertura — Task Statements x Banco de Questões

Este arquivo substitui os 5 arquivos soltos em `cursos-gap/` — é mais preciso porque mapeia direto aos 30 Task Statements reais do exam guide, não por curso.

**Como usar:** cada linha é um Task Statement. "Coberto (aprox.)" = já existe questão que toca o tema, mas pode não ser 1:1 exata. "GAP" = nenhuma questão no banco testa isso ainda. Mande este arquivo pro Claude Code e peça pra ele fechar os GAPs primeiro — são os pontos com risco real de erro na prova.

## D1 — Agentic Architecture & Orchestration (27%)

| Task Statement | Status | Questão(ões) existente(s) |
|---|---|---|
| 1.1 — Loop agentic, stop_reason | Coberto | d1-4 |
| 1.2 — Coordenador-subagente hub-and-spoke | GAP | — |
| 1.3 — Task tool, allowedTools, context passing | Coberto | d1-5 |
| 1.4 — Enforcement programático vs. prompt, handoff | Coberto (aprox.) | d1-1 (parcial) |
| 1.5 — Hooks (PostToolUse) | Coberto (aprox.) | d1-2 (parcial, sobre loop, não normalização) |
| 1.6 — Decomposição de tarefas (prompt chaining vs. adaptativa) | GAP | — |
| 1.7 — Sessão: --resume, fork_session | GAP | — |

## D2 — Tool Design & MCP Integration (18%)

| Task Statement | Status | Questão(ões) existente(s) |
|---|---|---|
| 2.1 — Descrição de tool, ambiguidade | Coberto | d2-1 |
| 2.2 — Erro estruturado MCP (isError, categorias) | Coberto | d2-3 |
| 2.3 — Distribuição de tools, tool_choice (any/auto) | Coberto (aprox.) | d2-4 (mais focada em forçado — ver nota) |
| 2.4 — Escopo de servidor MCP (.mcp.json vs pessoal) | Coberto | d2-2 |
| 2.5 — Tools nativas (Read/Write/Edit/Bash/Grep/Glob) | GAP | — |

**Nota:** d2-4 (tool_choice forçado pra ordem de extração) se encaixa mais precisamente no Task Statement 4.3 do que no 2.3 — ao gerar novas questões, cubra 2.3 especificamente sobre "auto" vs "any" e sobre excesso de tools degradando seleção.

## D3 — Claude Code Configuration & Workflows (20%)

| Task Statement | Status | Questão(ões) existente(s) |
|---|---|---|
| 3.1 — Hierarquia CLAUDE.md, @import | Coberto | d3-1, d3-4 |
| 3.2 — Slash commands e skills (context: fork, allowed-tools) | GAP | — |
| 3.3 — Path-specific rules com glob | Coberto | d3-5 |
| 3.4 — Plan mode vs. execução direta | Coberto (aprox.) | d3-3 (parcial, mais focado em CI/CD) |
| 3.5 — Refinamento iterativo (few-shot input/output, TDD) | GAP | — |
| 3.6 — Claude Code em CI/CD (-p, --output-format json) | Coberto (aprox.) | d3-3 |

## D4 — Prompt Engineering & Structured Output (20%)

| Task Statement | Status | Questão(ões) existente(s) |
|---|---|---|
| 4.1 — Critério explícito vs. instrução vaga | GAP | — |
| 4.2 — Few-shot pra consistência | Coberto | d4-2 |
| 4.3 — tool_use + JSON schema, tool_choice forçado | Coberto | d4-1, d2-4 (ver nota acima) |
| 4.4 — Validação, retry, feedback loop | GAP | — |
| 4.5 — Batch API (quando usar) | Coberto | d4-4 |
| 4.6 — Revisão multi-instância/multi-pass | GAP | — |

## D5 — Context Management & Reliability (15%)

| Task Statement | Status | Questão(ões) existente(s) |
|---|---|---|
| 5.1 — Preservar informação em contexto longo | Coberto | d5-1 |
| 5.2 — Escalonamento, confiança auto-reportada não confiável | Coberto | d5-3 |
| 5.3 — Propagação de erro multi-agente | GAP | — |
| 5.4 — Scratchpad, /compact, exploração de código grande | GAP | — |
| 5.5 — Calibração de confiança, amostragem estratificada | GAP | — |
| 5.6 — Proveniência, dados conflitantes entre fontes | Coberto (aprox.) | d1-3 (parcial, mais sobre handoff que proveniência) |

## Resumo — GAPs reais (17 de 30 Task Statements sem cobertura direta)

D1: 1.2, 1.6, 1.7 (3) · D2: 2.5 (1) · D3: 3.2, 3.5 (2) · D4: 4.1, 4.4, 4.6 (3) · D5: 5.3, 5.4, 5.5, 5.6 (4)

## Instrução para o Claude Code

1. Ler `FUNDAMENTOS-CCARF.md` (seção do Task Statement específico) e `ccar-f-guide.pdf`
2. Para cada linha marcada **GAP** acima, gerar 1-2 questões originais (cenário + 4 alternativas + 1 correta + 3 distratores plausíveis) testando especificamente aquele Task Statement
3. Não copiar/parafrasear de perto as 12 questões de exemplo do PDF oficial — usar só como referência de estilo e nível de dificuldade
4. Seguir o shape de objeto já usado em `seed.ts`
5. No campo `reinforce`, citar o número exato do Task Statement (ex. "Task Statement 1.2")
6. Depois de fechar os GAPs, se sobrar tempo, adicionar 1 questão extra em cada linha "Coberto (aprox.)" pra reforçar — não é prioridade
