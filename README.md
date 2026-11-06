# anthropic-certified

Repositório de estudo para certificações Claude / Anthropic. Cada certificação tem sua própria pasta com material de estudo e, quando aplicável, uma aplicação de simulado própria.

## Certificações

| Certificação | Status | Pasta |
|---|---|---|
| **CCAR-F** — Claude Certified Architect, Foundations | Em estudo — banco de questões completo (50/50, com suporte a multi-resposta) | [`ccar-f/`](ccar-f/) |

---

## CCAR-F — Claude Certified Architect, Foundations

Certificação que valida a capacidade de tomar decisões informadas sobre tradeoffs ao implementar soluções reais com Claude — cobre Claude Code, Claude Agent SDK, Claude API e Model Context Protocol (MCP).

### Detalhes da prova

| | |
|---|---|
| Código | CCAR-F |
| Itens | 60 questões (multiple-choice **e** multiple-response — cada item informa quantas respostas selecionar) |
| Tempo | 120 minutos |
| Estrutura | 4 dos 6 cenários oficiais, sorteados |
| Corte de aprovação | 720 de 1.000 (escala 100–1.000) |
| Validade | 12 meses |

### Domínios (peso na prova)

| Domínio | Peso | Questões no simulado |
|---|---|---|
| D1 — Agentic Architecture & Orchestration | 27% | 14 |
| D2 — Tool Design & MCP Integration | 18% | 9 |
| D3 — Claude Code Configuration & Workflows | 20% | 10 |
| D4 — Prompt Engineering & Structured Output | 20% | 10 |
| D5 — Context Management & Reliability | 15% | 7 |
| **Total** | **100%** | **50** |

### Material de estudo (`ccar-f/`)

- [`ccar-f-guide.pdf`](ccar-f/ccar-f-guide.pdf) — exam guide oficial (fonte de verdade; sempre prevalece sobre os resumos abaixo)
- [`FUNDAMENTOS-CCARF.md`](ccar-f/FUNDAMENTOS-CCARF.md) — base de conhecimento cobrindo os 30 Task Statements, os 6 cenários oficiais, o que não cai na prova, e os exercícios práticos do guia
- [`MAPA-COBERTURA-TASK-STATEMENTS.md`](ccar-f/MAPA-COBERTURA-TASK-STATEMENTS.md) — mapeamento de cada Task Statement para as questões do banco que o testam
- [`ADDENDUM-MULTI-RESPOSTA.md`](ccar-f/ADDENDUM-MULTI-RESPOSTA.md) — nota sobre o formato multiple-response da prova real e a migração correspondente no simulado
- [`checklist-ccarf.jsx`](ccar-f/checklist-ccarf.jsx) — checklist de estudo por período/domínio (protótipo original, ainda não integrado à aplicação)

### Aplicação de simulado (`ccar-f/ccarf-simulado/`)

App full-stack (React + Express/SQLite) para praticar por domínio ou fazer o simulado completo com pontuação ponderada. O front-end nunca recebe o gabarito antes da correção — toda validação acontece no servidor. Detalhes de arquitetura, segurança e como rodar localmente: [`ccar-f/ccarf-simulado/README.md`](ccar-f/ccarf-simulado/README.md).

```bash
# backend
cd ccar-f/ccarf-simulado/backend
npm install && cp .env.example .env
npm run seed && npm run dev   # http://localhost:3001

# frontend (outro terminal)
cd ccar-f/ccarf-simulado/frontend
npm install && npm run dev    # http://localhost:5173
```

---

## Roadmap

A pasta `ccar-f/` guarda também o plano para evoluir o simulado atual (hoje específico da CCAR-F) para uma plataforma multi-certificação — ver [`ccar-f/PROMPT-CLAUDE-CODE-SISTEMA-ESTUDO.md`](ccar-f/PROMPT-CLAUDE-CODE-SISTEMA-ESTUDO.md). Essa migração está deliberadamente pausada até a CCAR-F estar 100% estável para estudo; será retomada quando uma nova certificação entrar neste repositório.
