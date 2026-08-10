# Addendum — Suporte a Múltipla-Resposta no Simulado

**Descoberta:** a página oficial de certificação (anthropic-partners.skilljar.com) lista explicitamente "Question types: Multiple choice and multiple response" — a prova real tem os dois formatos, não só single-choice como o simulado atual assume.

## O que precisa mudar no schema

```sql
ALTER TABLE questions ADD COLUMN question_type TEXT NOT NULL DEFAULT 'single'; -- 'single' | 'multi'
ALTER TABLE questions ADD COLUMN correct_options TEXT; -- JSON array, ex: '["a","c"]' para multi; mantém correct_option (char único) para single por compatibilidade
```

## O que precisa mudar no frontend

- Questões `single`: continuam com radio button (comportamento atual, sem mudança)
- Questões `multi`: trocar para checkbox, permitindo mais de uma seleção; o enunciado deve deixar claro quantas respostas selecionar (ex. "Select 2 responses"), seguindo o padrão da prova real
- Pontuação de `multi`: definir se é tudo-ou-nada (só conta certo se acertar o conjunto exato) ou parcial — recomendo tudo-ou-nada, que é o padrão mais comum em provas de certificação, e mais fiel ao rigor da CCAR-F

## O que precisa mudar no banco de questões atual

As 21 questões existentes são todas `single` — não precisam mudar. Ao gerar as novas questões (fechando os GAPs do `MAPA-COBERTURA-TASK-STATEMENTS.md`), o Claude Code deve variar o tipo: misturar `single` e `multi`, já que a prova real mistura os dois. Sugestão: ~70-80% single, ~20-30% multi, já que os 12 exemplos do PDF oficial (que são reais, só não cobrem 100% da variedade) foram todos single — indício de que single é o formato predominante, mas não exclusivo.

## Instrução para o Claude Code

1. Aplicar a migração de schema acima
2. Atualizar a UI de quiz pra suportar checkbox quando `question_type === 'multi'`
3. Ajustar a rota `/exam/attempt/:id/answer` pra aceitar array de opções escolhidas quando o tipo for `multi`, e comparar contra `correct_options` (conjunto exato)
4. Ao gerar novas questões pros GAPs do mapa de cobertura, marcar ~20-30% delas como `multi`, priorizando Task Statements onde múltiplas ações corretas fazem sentido no mundo real (ex. "quais das seguintes são práticas recomendadas para X" — cabe bem em 2.1, 2.2, 4.2, 5.1)
