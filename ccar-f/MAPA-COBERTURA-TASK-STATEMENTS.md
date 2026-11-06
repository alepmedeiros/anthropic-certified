# Mapa de Cobertura — Task Statements x Banco de Questões

Tabela viva de progresso para a meta de `ADDENDUM-ESCALA-BANCO.md`: 6-8 questões por Task Statement (30 no total) = 180-240 questões. Atualizada a cada lote processado.

**Como usar:** "Citadas" = questões com `reinforce` citando explicitamente aquele Task Statement (contagem confiável, via `grep`). "Legado" = as 13 questões originais da primeira migração (antes de citar Task Statement no `reinforce`), mapeadas aqui por inferência de conteúdo — ajuda a não subestimar cobertura real, mas não é tão precisa quanto as citadas.

## Status geral

- **Total no banco:** 70 questões (13 legado + 57 citadas explicitamente)
- **Lotes processados:** 1 (D1 — Task Statements 1.1, 1.6, 1.7)
- **Task Statements na meta (6-8 citadas):** 3 de 30

## D1 — Agentic Architecture & Orchestration (27%) — maior peso, prioridade 1

| Task Statement | Citadas | Legado (inferido) | Status |
|---|---|---|---|
| 1.1 — Loop agentic, stop_reason | 8 (d1-4, d1-15..d1-21) | d1-2 (parcial) | ✅ na meta |
| 1.2 — Coordenador-subagente hub-and-spoke | 2 (d1-6, d1-7) | d1-1 (parcial) | 🔲 falta ~4-6 |
| 1.3 — Task tool, allowedTools, context passing | 2 (d1-5, d1-8) | d1-3 (parcial) | 🔲 falta ~4-6 |
| 1.4 — Enforcement programático vs. prompt, handoff | 2 (d1-9, d1-10) | — | 🔲 falta ~4-6 |
| 1.5 — Hooks (PostToolUse) | 2 (d1-11, d1-12) | — | 🔲 falta ~4-6 |
| 1.6 — Decomposição de tarefas (chaining vs. adaptativa) | 8 (d1-13, d1-22..d1-28) | — | ✅ na meta |
| 1.7 — Sessão: --resume, fork_session | 7 (d1-14, d1-29..d1-34) | — | ✅ na meta |

## D2 — Tool Design & MCP Integration (18%)

| Task Statement | Citadas | Status |
|---|---|---|
| 2.1 — Descrição de tool, ambiguidade | 1 (d2-5) + d2-1 legado | 🔲 falta ~5 |
| 2.2 — Erro estruturado MCP | 1 (d2-3) | 🔲 falta ~5 |
| 2.3 — Distribuição de tools, tool_choice | 1 (d2-6) | 🔲 falta ~5 |
| 2.4 — Escopo de servidor MCP | 2 (d2-4→ver nota, d2-7, d2-8) + d2-2 legado | 🔲 falta ~4 |
| 2.5 — Tools nativas (Read/Write/Edit/Bash/Grep/Glob) | 1 (d2-9) | 🔲 falta ~5 |

## D3 — Claude Code Configuration & Workflows (20%)

| Task Statement | Citadas | Status |
|---|---|---|
| 3.1 — Hierarquia CLAUDE.md, @import | 1 (d3-4) + d3-1 legado | 🔲 falta ~5 |
| 3.2 — Slash commands e skills | 2 (d3-6, d3-7) | 🔲 falta ~4-6 |
| 3.3 — Path-specific rules com glob | 1 (d3-5) | 🔲 falta ~5 |
| 3.4 — Plan mode vs. execução direta | 1 (d3-8) + d3-3 legado (parcial) | 🔲 falta ~5 |
| 3.5 — Refinamento iterativo | 1 (d3-9) | 🔲 falta ~5 |
| 3.6 — Claude Code em CI/CD | 1 (d3-10) + d3-3 legado (parcial) | 🔲 falta ~5 |

## D4 — Prompt Engineering & Structured Output (20%)

| Task Statement | Citadas | Status |
|---|---|---|
| 4.1 — Critério explícito vs. instrução vaga | 1 (d4-5) | 🔲 falta ~5 |
| 4.2 — Few-shot pra consistência | 0 citadas + d4-2 legado | 🔲 falta ~6 |
| 4.3 — tool_use + JSON schema, tool_choice forçado | 3 (d4-1, d4-6, d4-7) | 🔲 falta ~3-5 |
| 4.4 — Validação, retry, feedback loop | 1 (d4-8) | 🔲 falta ~5 |
| 4.5 — Batch API | 2 (d4-4, d4-9) | 🔲 falta ~4-6 |
| 4.6 — Revisão multi-instância/multi-pass | 1 (d4-10) | 🔲 falta ~5 |

## D5 — Context Management & Reliability (15%)

| Task Statement | Citadas | Status |
|---|---|---|
| 5.1 — Preservar informação em contexto longo | 0 citadas + d5-1, d5-2 legado | 🔲 falta ~5 |
| 5.2 — Escalonamento, confiança auto-reportada | 1 (d5-3) | 🔲 falta ~5 |
| 5.3 — Propagação de erro multi-agente | 1 (d5-4) | 🔲 falta ~5 |
| 5.4 — Scratchpad, /compact, exploração de código grande | 1 (d5-5) | 🔲 falta ~5 |
| 5.5 — Calibração de confiança, amostragem estratificada | 1 (d5-6) | 🔲 falta ~5 |
| 5.6 — Proveniência, dados conflitantes entre fontes | 1 (d5-7) + d1-3 legado (parcial, cross-domain) | 🔲 falta ~5 |

## Próximo lote sugerido

Seguindo a ordem de prioridade do addendum (domínio por peso, começando pelo mais raso dentro de D1): **D1 — Task Statements 1.2, 1.3, 1.4, 1.5** (todos com só 2 questões citadas cada, +legado parcial). Um lote de ~18-20 questões (5 por TS) fecharia D1 inteiro na meta de 6-8.
