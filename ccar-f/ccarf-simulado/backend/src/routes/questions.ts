import { Router } from "express";
import { db } from "../db/connection";
import { requireAuth } from "../middleware/auth";
import { shuffle } from "../util/shuffle";

const router = Router();

// Regra de ouro: nunca usar SELECT * aqui — correct_option/explanation/reinforce
// jamais podem sair antes da correção.
const SAFE_QUESTION_COLUMNS =
  "id, domain_id, scenario, option_a, option_b, option_c, option_d, question_type, select_count, scenario_tag";

router.get("/domains", requireAuth, (_req, res) => {
  const domains = db.prepare("SELECT id, name, weight FROM domains ORDER BY id ASC").all();
  res.json(domains);
});

router.get("/questions", requireAuth, (req, res) => {
  const { domain } = req.query;
  if (typeof domain !== "string" || !domain) {
    return res.status(400).json({ error: "domain query param is required" });
  }

  const domainExists = db.prepare("SELECT id FROM domains WHERE id = ?").get(domain);
  if (!domainExists) {
    return res.status(404).json({ error: "Unknown domain" });
  }

  const rows = db
    .prepare(`SELECT ${SAFE_QUESTION_COLUMNS} FROM questions WHERE domain_id = ?`)
    .all(domain);
  res.json(shuffle(rows));
});

export default router;

export function getFullExamQuestions() {
  const rows = db.prepare(`SELECT ${SAFE_QUESTION_COLUMNS} FROM questions`).all();
  return shuffle(rows);
}
