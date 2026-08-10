# Projeto: Simulado CCAR-F multiusuário

Briefing para implementação completa via Claude Code. Cole este arquivo na raiz do projeto (como `CLAUDE.md` ou `PROJECT_BRIEF.md`) e peça para o Claude Code executar de ponta a ponta.

## 1. Objetivo

Evoluir o simulado CCAR-F (hoje um artefato React front-end-only, com gabarito exposto no cliente) para uma aplicação real com backend, pensada para ser usada por múltiplas pessoas estudando para a certificação Claude Certified Architect – Foundations.

**Requisito não-negociável de segurança:** o front-end nunca deve receber o índice da resposta correta antes da correção. Toda validação de resposta acontece no servidor.

## 2. Stack técnica

- **Backend:** Node.js + Express (TypeScript opcional, mas recomendado para consistência de schema)
- **Banco:** SQLite via `better-sqlite3` para começar (zero infra; migração para Postgres é trivial depois se o volume de usuários crescer)
- **Autenticação:** token simples por usuário (e-mail + senha com hash bcrypt), sessão via JWT
- **Frontend:** React (reaproveitar os componentes já criados em `checklist-ccarf.jsx` e `simulado-ccarf.jsx`, adaptando para consumir a API em vez do array local `QUESTIONS`)

## 3. Estrutura de pastas sugerida

```
ccarf-simulado/
  backend/
    src/
      db/
        schema.sql
        seed.ts
        connection.ts
      routes/
        auth.ts
        questions.ts
        exam.ts
      middleware/
        auth.ts
      server.ts
    package.json
  frontend/
    src/
      components/
        Dashboard.jsx
        DomainQuiz.jsx
        FullExam.jsx
        ExamResult.jsx
      api/
        client.ts
      App.jsx
    package.json
  README.md
```

## 4. Schema do banco (SQL)

```sql
CREATE TABLE domains (
  id TEXT PRIMARY KEY,        -- 'D1', 'D2', etc.
  name TEXT NOT NULL,
  weight INTEGER NOT NULL     -- peso percentual no exame real
);

CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  domain_id TEXT NOT NULL REFERENCES domains(id),
  scenario TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option CHAR(1) NOT NULL,  -- 'a'..'d' — NUNCA enviado ao cliente antes da correção
  explanation TEXT NOT NULL,
  reinforce TEXT NOT NULL
);

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exam_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  mode TEXT NOT NULL,           -- 'domain_practice' | 'full_exam'
  domain_id TEXT REFERENCES domains(id),  -- null se full_exam
  scaled_score INTEGER,         -- só preenchido em full_exam
  passed BOOLEAN,
  started_at TEXT DEFAULT CURRENT_TIMESTAMP,
  finished_at TEXT
);

CREATE TABLE attempt_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_id INTEGER NOT NULL REFERENCES exam_attempts(id),
  question_id TEXT NOT NULL REFERENCES questions(id),
  chosen_option CHAR(1) NOT NULL,
  is_correct BOOLEAN NOT NULL
);
```

## 5. Rotas da API

| Método | Rota | Descrição | Retorna gabarito? |
|---|---|---|---|
| POST | `/auth/register` | cria usuário (email + senha) | — |
| POST | `/auth/login` | retorna JWT | — |
| GET | `/domains` | lista domínios + peso | — |
| GET | `/questions?domain=D1&mode=practice` | retorna N perguntas do domínio (embaralhadas), **sem** `correct_option`, `explanation` ou `reinforce` | **Não** |
| GET | `/exam/full` | retorna todas as perguntas embaralhadas para o simulado completo, sem gabarito | **Não** |
| POST | `/exam/attempt` | inicia uma tentativa (`mode`, `domain_id` opcional) → retorna `attempt_id` | — |
| POST | `/exam/attempt/:id/answer` | envia `{question_id, chosen_option}` → servidor valida e retorna `{is_correct, explanation, reinforce}` | Só depois de responder |
| POST | `/exam/attempt/:id/finish` | fecha a tentativa, calcula `scaled_score` (para full_exam) e retorna resumo por domínio | — |
| GET | `/progress` | progresso agregado do usuário logado, por domínio | — |

**Regra de ouro:** `GET /questions` e `GET /exam/full` fazem `SELECT` explícito excluindo `correct_option`, `explanation`, `reinforce` — nunca usar `SELECT *`.

## 6. Regras de segurança

- Nunca usar `SELECT *` nas rotas que servem perguntas antes da resposta
- Hash de senha com bcrypt (nunca texto plano)
- JWT com expiração razoável (ex. 7 dias)
- Rate limiting básico na rota de login (evitar brute force)
- CORS restrito ao domínio do frontend em produção

## 7. Dados iniciais (seed)

Migrar as 14 questões já criadas nos artefatos `simulado-ccarf.jsx` (domínios D1, D2, D3, D4, D5) como seed inicial do banco — todo o conteúdo (scenario, options, explanation, reinforce, domain, weight) já está pronto em inglês, só precisa ser convertido para linhas SQL/seed script.

## 8. Frontend — adaptação

Os componentes visuais (dashboard com barra de cobertura por domínio, tela de quiz, tela de simulado completo sem feedback intermediário, tela de resultado ponderado) já existem e funcionam — só trocar a fonte de dados: em vez do array `QUESTIONS` local, chamar a API (`fetch`/`axios`) nas rotas acima. Manter o layout escuro/monoespaçado já definido (tema "terminal/console").

## 9. Sugestões de próximos passos (não obrigatório para o MVP)

- Deploy simples: Render, Railway ou Fly.io (free tier) para o backend; Vercel/Netlify para o frontend
- Painel de admin simples para adicionar novas perguntas sem editar SQL na mão
- Exportar histórico de tentativas por usuário
