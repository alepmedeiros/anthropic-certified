# Curso: Building with the Claude API

**Domínios da prova cobertos:** D1 — Agentic Architecture & Orchestration (27%) e parte de D4 — Prompt Engineering & Structured Output (20%)

## Conteúdo do curso (o que estudar)
- Claude Agent SDK: ciclo de vida do agente, `stop_reason` ("tool_use" vs "end_turn") como mecanismo de controle do loop
- Subagentes: `Task` tool no `allowedTools`, isolamento de contexto entre coordenador e subagentes, necessidade de passar contexto explicitamente
- Handoff entre agentes: resumos condensados e citáveis vs. contexto bruto
- Hooks de lifecycle (ex. `PostToolUse`)
- Structured output / JSON schema, `tool_choice` (auto / any / forçado)
- Message Batches API — quando é apropriado (não-bloqueante) vs. inadequado (bloqueante)

Referência de apoio: `FUNDAMENTOS-CCARF.md`, seções D1 e D4.

## Cobertura atual no banco de questões
- D1: 5 questões (d1-1 a d1-5)
- D4 (parte relevante a este curso: agent/API side): 4 questões (d4-1 a d4-4)

## Gap — o que precisa ser criado
- **+9 questões novas em D1** (chegar a 14, proporcional ao peso 27% num banco de 50)
- **+6 questões novas em D4** (chegar a 10)

## Instrução para o Claude Code gerar as questões
1. Ler `FUNDAMENTOS-CCARF.md` (seções D1 e D4) e o `ccar-f-guide.pdf` (Task Statements de D1 e D4)
2. Gerar cenários **originais** (não copiar/parafrasear de perto os exemplos do PDF oficial) que testem: decisão de quando usar múltiplos agentes, tratamento de loops sem terminação, handoff correto entre agentes, hooks, `stop_reason`, `tool_choice`, quando usar Batches API
3. Formato: 1 cenário + 4 alternativas + 1 correta + 3 distratores plausíveis (erros comuns de quem tem conhecimento incompleto, não respostas absurdas)
4. Seguir exatamente o shape de objeto já usado em `seed.ts` (`id`, `domain`, `scenario`, `options`, `correct`, `explanation`, `reinforce`)
5. No campo `reinforce`, citar o Task Statement específico testado (ex. "Task Statement 1.2")
