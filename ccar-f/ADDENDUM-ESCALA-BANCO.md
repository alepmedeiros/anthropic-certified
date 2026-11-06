# Addendum — Escalar Banco de Questões (180-240) + Tag de Cenário

## Meta

6-8 questões por Task Statement (30 Task Statements) = 180-240 questões no total, distribuídas proporcionalmente aos pesos de domínio já usados no `MAPA-COBERTURA-TASK-STATEMENTS.md`.

## Mudança de schema — adicionar tag de cenário

```sql
ALTER TABLE questions ADD COLUMN scenario_tag TEXT;
-- valores: 'customer_support' | 'code_generation' | 'multi_agent_research' |
--          'developer_productivity' | 'cicd' | 'structured_extraction' | null (genérica, não amarrada a um cenário específico)
```

Cada questão nova deve, quando fizer sentido, ser ambientada em um dos 6 cenários oficiais (não precisa forçar todas — algumas são conceituais e ficam `null`), pra treinar o reconhecimento de padrão dentro do contexto narrativo real da prova, não só o conceito isolado.

## Processo de geração em lote (evitar queda de qualidade)

Gerar 240 questões de uma vez tende a produzir repetição de estrutura e distratores óbvios. Processo recomendado:

1. Gerar em lotes de 15-20 questões por vez (não tudo de uma chamada só)
2. Por lote, focar em 1-2 Task Statements específicos (usar o `MAPA-COBERTURA-TASK-STATEMENTS.md` como checklist, indo dos GAPs pros "Coberto (aprox.)")
3. Depois de cada lote, rodar uma checagem própria: nenhum cenário/enunciado repetido palavra por palavra, distratores plausíveis (não absurdos óbvios), e todo `reinforce` citando o Task Statement correto
4. Variar `question_type` entre `single` e `multi` (~70/30, conforme o addendum de múltipla-resposta já enviado)
5. Registrar progresso: atualizar uma tabela simples de contagem por Task Statement conforme os lotes forem entrando, pra não perder o controle de quanto falta

## Ordem sugerida de prioridade

1. Fechar os 17 GAPs completos do mapa de cobertura (1 questão cada, mínimo) — cobertura básica primeiro
2. Depois, engordar cada Task Statement até 6-8 questões, domínio por domínio, começando pelos de maior peso (D1 27%, depois D3/D4 20% cada, D2 18%, D5 15%)
3. Só then adicionar variação de cenário (`scenario_tag`) nas questões já existentes que fizer sentido reclassificar
