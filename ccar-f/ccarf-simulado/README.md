# Simulado CCAR-F — multiusuário

Aplicação full-stack para praticar para a certificação Claude Certified Architect – Foundations,
com correção de respostas feita inteiramente no servidor (o front-end nunca recebe o gabarito
antes de responder).

## Stack

- **Backend:** Node.js + Express + TypeScript, SQLite via `better-sqlite3`, auth JWT com bcrypt.
- **Frontend:** React + Vite, consumindo a API (sem dados de perguntas embutidos no cliente).

## Rodando localmente

### Backend

```bash
cd backend
npm install
cp .env.example .env   # ajuste JWT_SECRET em produção
npm run seed            # cria domains/questions no SQLite
npm run dev              # http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173, com proxy /api -> :3001
```

Abra `http://localhost:5173`, crie uma conta e comece a praticar.

## Segurança

- Rotas `GET /questions` e `GET /exam/full` fazem `SELECT` explícito, nunca incluindo
  `correct_option`, `explanation` ou `reinforce`.
- `POST /exam/attempt/:id/answer` só revela `explanation`/`reinforce` no modo `domain_practice`.
  No `full_exam` retorna apenas `{ recorded: true }` — o gabarito só aparece em `/finish`,
  reproduzindo o formato do exame real (sem feedback intermediário).
- Cada rota de tentativa valida que o `attempt_id` pertence ao usuário autenticado (via JWT).
- `attempt_answers` tem `UNIQUE(attempt_id, question_id)`: uma resposta não pode ser reenviada
  ou trocada para forçar descoberta do gabarito por tentativa e erro.
- Senhas com bcrypt, JWT expira em 7 dias, rate limit em `/auth/login`.

## Observações

- O conteúdo original tinha **13 perguntas** (não 14): 3×D1, 3×D3, 3×D4, 2×D2, 2×D5.
  Todas foram migradas para o seed.
- Fórmula de pontuação do `full_exam` replica a lógica original do protótipo:
  `scaled_score = round(Σ(acurácia_domínio × peso_domínio) × 10)`, aprovação com `>= 720`.
- Escopo de admin/deploy (seção 9 do briefing) ficou fora do MVP.
