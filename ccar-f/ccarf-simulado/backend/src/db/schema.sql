CREATE TABLE IF NOT EXISTS domains (
  id TEXT PRIMARY KEY,        -- 'D1', 'D2', etc.
  name TEXT NOT NULL,
  weight INTEGER NOT NULL     -- peso percentual no exame real
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  domain_id TEXT NOT NULL REFERENCES domains(id),
  scenario TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option CHAR(1) NOT NULL,  -- 'a'..'d' — NUNCA enviado ao cliente antes da correção. Para question_type='multi', mantém a 1ª letra correta como placeholder; a correção real usa correct_options.
  question_type TEXT NOT NULL DEFAULT 'single',  -- 'single' | 'multi' — a prova real mistura os dois formatos
  correct_options TEXT,  -- JSON array (ex. '["b","d"]'), só usado quando question_type='multi' — NUNCA enviado ao cliente antes da correção
  select_count INTEGER NOT NULL DEFAULT 1,  -- quantas respostas selecionar; seguro expor ao cliente (não revela quais)
  explanation TEXT NOT NULL,
  reinforce TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exam_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  mode TEXT NOT NULL,           -- 'domain_practice' | 'full_exam'
  domain_id TEXT REFERENCES domains(id),  -- null se full_exam
  scaled_score INTEGER,         -- só preenchido em full_exam
  passed BOOLEAN,
  started_at TEXT DEFAULT CURRENT_TIMESTAMP,
  finished_at TEXT
);

CREATE TABLE IF NOT EXISTS attempt_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_id INTEGER NOT NULL REFERENCES exam_attempts(id),
  question_id TEXT NOT NULL REFERENCES questions(id),
  chosen_option CHAR(1) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  UNIQUE(attempt_id, question_id)
);
