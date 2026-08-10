import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "../../data.sqlite");

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
db.exec(schema);

// Migração idempotente para bancos criados antes do suporte a multi-resposta:
// CREATE TABLE IF NOT EXISTS acima não adiciona colunas a tabelas já existentes.
const existingColumns = new Set(
  (db.prepare("PRAGMA table_info(questions)").all() as { name: string }[]).map((c) => c.name)
);
if (!existingColumns.has("question_type")) {
  db.exec("ALTER TABLE questions ADD COLUMN question_type TEXT NOT NULL DEFAULT 'single'");
}
if (!existingColumns.has("correct_options")) {
  db.exec("ALTER TABLE questions ADD COLUMN correct_options TEXT");
}
if (!existingColumns.has("select_count")) {
  db.exec("ALTER TABLE questions ADD COLUMN select_count INTEGER NOT NULL DEFAULT 1");
}
