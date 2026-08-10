# Prompt para Claude Code — Sistema de Estudo Multi-Certificação

Cole este prompt no Claude Code, dentro do repositório `anthropic-certified/ccar-f/ccarf-simulado`, para evoluir o projeto atual (hoje específico pra CCAR-F) em uma plataforma genérica de estudo reaproveitável para qualquer certificação futura.

---

## Contexto que você (Claude Code) precisa saber

Este projeto já existe e funciona: backend Node/Express/SQLite + frontend React, com autenticação, banco de questões protegido (gabarito nunca exposto ao cliente antes da correção), modo de prática por domínio e modo de simulado completo com pontuação ponderada. O objetivo agora é generalizar essa base para qualquer certificação, mantendo tudo que já funciona.

**Importante:** você não tem acesso à conversa onde este projeto foi planejado. Todo o contexto necessário está neste prompt e no arquivo `ccar-f-guide.pdf` já presente no repositório — use-os como fonte de verdade, não invente domínios, pesos ou conteúdo de certificações que não estejam documentados.

## 1. Objetivo

Transformar o sistema atual (schema fixo pra uma certificação) em uma plataforma multi-certificação, onde:
- Cada certificação tem seus próprios domínios, pesos, checklist de estudo e banco de perguntas
- O fluxo de estudo é **integrado**: ao marcar o último item de um bloco de domínio como concluído no checklist, o sistema automaticamente inicia o simulado de prática daquele domínio (sem precisar navegar manualmente)
- Adicionar uma nova certificação no futuro deve ser um processo simples e documentado, não uma reescrita

## 2. Evolução do schema (migração incremental — não recriar do zero)

```sql
CREATE TABLE IF NOT EXISTS certifications (
  id TEXT PRIMARY KEY,              -- 'ccar-f', 'ccao-f', 'aws-saa-c03', etc.
  name TEXT NOT NULL,
  exam_guide_url TEXT,              -- link ou caminho local do PDF oficial
  pass_cutoff INTEGER NOT NULL,     -- ex. 720
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- domains e questions passam a referenciar certification_id
ALTER TABLE domains ADD COLUMN certification_id TEXT REFERENCES certifications(id);
ALTER TABLE questions ADD COLUMN certification_id TEXT REFERENCES certifications(id);

-- checklist agora vive no banco, não hardcoded no frontend
CREATE TABLE IF NOT EXISTS checklist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  certification_id TEXT NOT NULL REFERENCES certifications(id),
  domain_id TEXT,                   -- null se for item geral (ex. "ler exam guide")
  period_label TEXT NOT NULL,       -- ex. "Dias 1-4"
  block_label TEXT NOT NULL,        -- ex. "D1 — Agentic Architecture"
  item_text TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS checklist_progress (
  user_id INTEGER NOT NULL REFERENCES users(id),
  checklist_item_id INTEGER NOT NULL REFERENCES checklist_items(id),
  checked_at TEXT,
  PRIMARY KEY (user_id, checklist_item_id)
);
```

Escreva a migração como script incremental (`migrate.ts` ou similar) que roda sobre o banco existente sem apagar dados — a certificação CCAR-F com suas 21 questões e domínios já existentes deve ser preservada, só populando `certification_id = 'ccar-f'` nas linhas já existentes.

## 3. Fluxo integrado checklist → simulado

No frontend, ao marcar o último item de um `block_label` (domínio) como concluído:
1. Disparar automaticamente uma chamada para iniciar uma tentativa de prática (`POST /exam/attempt` com `mode: 'domain_practice'`) daquele domínio
2. Redirecionar o usuário direto para a tela de quiz daquele domínio, como se a prova daquele bloco estivesse começando
3. Se o usuário atingir 70%+ de acerto nessa tentativa, marcar o domínio como "pronto para revisão" no dashboard (indicador visual, não obrigatório pra continuar)

Isso NÃO deve travar o checklist — o usuário pode desmarcar/refazer itens livremente; o gatilho é só uma conveniência de navegação, não uma trava.

## 4. Geração de novas perguntas (por você, Claude Code)

Ao adicionar uma nova certificação, gere um banco inicial de perguntas seguindo este processo:
1. Leia o exam guide oficial da certificação (PDF fornecido pelo usuário no repositório)
2. Para cada domínio e seus "Task Statements", gere de 3 a 5 questões de múltipla escolha **originais** (cenário + 4 alternativas + explicação + apontamento de reforço), no mesmo estilo das 21 já existentes em `seed.ts` do CCAR-F
3. **Nunca copie ou parafraseie de perto as questões de exemplo do PDF oficial** — use-as só como referência de estilo e nível de dificuldade; as questões geradas devem ser cenários originais que testem o mesmo conceito
4. Cite, no campo `reinforce` de cada questão, qual Task Statement específico ela testa (ex. "Task Statement 2.2")

## 5. Regras que NÃO mudam (mantidas do projeto original)

- Rotas que servem perguntas (`GET /questions`, `GET /exam/full`) nunca fazem `SELECT *` — gabarito, explicação e reforço só saem depois da resposta
- Modo `full_exam` não dá feedback por questão, só no `/finish` (para não permitir descobrir o gabarito por tentativa e erro)
- Senha com bcrypt, JWT com expiração, rate limit no login — sem regressão nenhuma nisso

## 6. Passo a passo de implementação sugerido

1. Criar e rodar a migração do schema (seção 2), preservando os dados de CCAR-F
2. Adaptar as rotas existentes para receberem `certification_id` como parâmetro (`GET /questions?certification=ccar-f&domain=D1`)
3. Mover o checklist do frontend (hoje hardcoded em `checklist-ccarf.jsx`) para o banco, usando as tabelas `checklist_items`/`checklist_progress`
4. Implementar o gatilho automático checklist → simulado (seção 3)
5. Documentar no `README.md` o processo de "adicionar nova certificação": inserir linha em `certifications`, anexar PDF do exam guide, rodar o gerador de perguntas (seção 4), popular `checklist_items` a partir do plano de estudo
6. Só depois disso, migrar as 8 questões novas do CCAR-F que ainda faltam no `seed.ts` (já identificadas anteriormente — estão em `simulado-ccarf.jsx` na raiz do projeto, ids d1-4, d1-5, d2-3, d2-4, d3-4, d3-5, d4-4, d5-3)

Vá em etapas pequenas e rodáveis — não tente reescrever tudo de uma vez. Confirme que a CCAR-F continua funcionando 100% depois de cada etapa antes de seguir pra próxima.
