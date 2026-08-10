# Domínio D5 — Context Management & Reliability (transversal, sem curso dedicado)

**Peso na prova:** 15%. Não existe um curso da Anthropic Academy dedicado só a este domínio — o conteúdo aparece espalhado em "Building with the Claude API" e nos 6 cenários oficiais do exame.

## Conteúdo (o que estudar)
- Compactação de contexto em trabalho de longa duração (resumir turnos anteriores periodicamente)
- Handoff confiável entre agentes: resumo estruturado de decisões + objetivos pendentes (não histórico bruto, não nada)
- Confiança auto-reportada pelo modelo é um sinal ruim de calibração — não usar como único critério de escalonamento
- Critério de escalonamento explícito (regras de negócio + few-shot) como alternativa correta

Referência de apoio: `FUNDAMENTOS-CCARF.md`, seção D5.

## Cobertura atual no banco de questões
- D5: 3 questões (d5-1 a d5-3)

## Gap — o que precisa ser criado
- **+4 questões novas em D5** (chegar a 7, proporcional ao peso 15% num banco de 50)

## Instrução para o Claude Code gerar as questões
1. Ler `FUNDAMENTOS-CCARF.md` (seção D5) e o `ccar-f-guide.pdf` (Task Statements de D5)
2. Gerar cenários **originais** testando: gestão de contexto longo, handoff entre agentes, por que confiança auto-reportada falha como proxy de escalonamento, critérios de reliability em produção
3. Formato: 1 cenário + 4 alternativas + 1 correta + 3 distratores plausíveis
4. Seguir o shape de objeto já usado em `seed.ts`
5. Citar o Task Statement específico no campo `reinforce`
