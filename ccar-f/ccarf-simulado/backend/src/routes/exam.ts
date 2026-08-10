import { Router } from "express";
import { db } from "../db/connection";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { getFullExamQuestions } from "./questions";

const router = Router();

const PASS_CUTOFF = 720;
const VALID_OPTIONS = new Set(["a", "b", "c", "d"]);

interface Attempt {
  id: number;
  user_id: number;
  mode: "domain_practice" | "full_exam";
  domain_id: string | null;
  scaled_score: number | null;
  passed: number | null;
  started_at: string;
  finished_at: string | null;
}

function getOwnedAttempt(attemptId: number, userId: number): Attempt | undefined {
  return db.prepare("SELECT * FROM exam_attempts WHERE id = ? AND user_id = ?").get(attemptId, userId) as
    | Attempt
    | undefined;
}

router.get("/exam/full", requireAuth, (_req, res) => {
  res.json(getFullExamQuestions());
});

router.post("/exam/attempt", requireAuth, (req: AuthedRequest, res) => {
  const { mode, domain_id } = req.body ?? {};
  if (mode !== "domain_practice" && mode !== "full_exam") {
    return res.status(400).json({ error: "mode must be 'domain_practice' or 'full_exam'" });
  }
  if (mode === "domain_practice") {
    if (typeof domain_id !== "string" || !domain_id) {
      return res.status(400).json({ error: "domain_id is required for domain_practice" });
    }
    const domain = db.prepare("SELECT id FROM domains WHERE id = ?").get(domain_id);
    if (!domain) return res.status(404).json({ error: "Unknown domain" });
  }

  const info = db
    .prepare("INSERT INTO exam_attempts (user_id, mode, domain_id) VALUES (?, ?, ?)")
    .run(req.userId, mode, mode === "domain_practice" ? domain_id : null);

  res.status(201).json({ attempt_id: info.lastInsertRowid });
});

router.post("/exam/attempt/:id/answer", requireAuth, (req: AuthedRequest, res) => {
  const attemptId = Number(req.params.id);
  const { question_id, chosen_option } = req.body ?? {};

  if (!Number.isInteger(attemptId)) return res.status(400).json({ error: "Invalid attempt id" });
  if (typeof question_id !== "string" || !VALID_OPTIONS.has(chosen_option)) {
    return res.status(400).json({ error: "question_id and chosen_option (a-d) are required" });
  }

  const attempt = getOwnedAttempt(attemptId, req.userId!);
  if (!attempt) return res.status(404).json({ error: "Attempt not found" });
  if (attempt.finished_at) return res.status(409).json({ error: "Attempt already finished" });

  const question = db
    .prepare("SELECT id, domain_id, correct_option, explanation, reinforce FROM questions WHERE id = ?")
    .get(question_id) as
    | { id: string; domain_id: string; correct_option: string; explanation: string; reinforce: string }
    | undefined;
  if (!question) return res.status(404).json({ error: "Question not found" });
  if (attempt.mode === "domain_practice" && question.domain_id !== attempt.domain_id) {
    return res.status(400).json({ error: "Question does not belong to this attempt's domain" });
  }

  const isCorrect = chosen_option === question.correct_option;

  try {
    db.prepare(
      "INSERT INTO attempt_answers (attempt_id, question_id, chosen_option, is_correct) VALUES (?, ?, ?, ?)"
    ).run(attemptId, question_id, chosen_option, isCorrect ? 1 : 0);
  } catch {
    return res.status(409).json({ error: "Question already answered in this attempt" });
  }

  if (attempt.mode === "full_exam") {
    // Real-exam style: no per-question feedback until /finish, to avoid
    // leaking the gabarito by brute-forcing a/b/c/d one at a time.
    return res.json({ recorded: true });
  }

  res.json({
    is_correct: isCorrect,
    explanation: question.explanation,
    reinforce: question.reinforce,
  });
});

router.post("/exam/attempt/:id/finish", requireAuth, (req: AuthedRequest, res) => {
  const attemptId = Number(req.params.id);
  if (!Number.isInteger(attemptId)) return res.status(400).json({ error: "Invalid attempt id" });

  const attempt = getOwnedAttempt(attemptId, req.userId!);
  if (!attempt) return res.status(404).json({ error: "Attempt not found" });
  if (attempt.finished_at) return res.status(409).json({ error: "Attempt already finished" });

  const answers = db
    .prepare(
      `SELECT aa.question_id, aa.chosen_option, aa.is_correct, q.domain_id, q.scenario, q.explanation, q.reinforce
       FROM attempt_answers aa JOIN questions q ON q.id = aa.question_id
       WHERE aa.attempt_id = ?`
    )
    .all(attemptId) as {
    question_id: string;
    chosen_option: string;
    is_correct: number;
    domain_id: string;
    scenario: string;
    explanation: string;
    reinforce: string;
  }[];

  const domains = db.prepare("SELECT id, weight FROM domains").all() as { id: string; weight: number }[];
  const byDomain: Record<string, { correct: number; total: number; missed: unknown[] }> = {};
  for (const d of domains) byDomain[d.id] = { correct: 0, total: 0, missed: [] };

  for (const a of answers) {
    const bucket = byDomain[a.domain_id];
    bucket.total += 1;
    if (a.is_correct) {
      bucket.correct += 1;
    } else {
      bucket.missed.push({
        question_id: a.question_id,
        scenario: a.scenario,
        chosen_option: a.chosen_option,
        explanation: a.explanation,
        reinforce: a.reinforce,
      });
    }
  }

  let scaledScore: number | null = null;
  let passed: number | null = null;
  if (attempt.mode === "full_exam") {
    let weightedScore = 0;
    for (const d of domains) {
      const b = byDomain[d.id];
      const acc = b.total > 0 ? b.correct / b.total : 0;
      weightedScore += acc * d.weight;
    }
    scaledScore = Math.round(weightedScore * 10);
    passed = scaledScore >= PASS_CUTOFF ? 1 : 0;
  }

  db.prepare(
    "UPDATE exam_attempts SET finished_at = CURRENT_TIMESTAMP, scaled_score = ?, passed = ? WHERE id = ?"
  ).run(scaledScore, passed, attemptId);

  res.json({
    mode: attempt.mode,
    domain_id: attempt.domain_id,
    scaled_score: scaledScore,
    passed: passed === null ? null : Boolean(passed),
    pass_cutoff: PASS_CUTOFF,
    by_domain: byDomain,
  });
});

router.get("/progress", requireAuth, (req: AuthedRequest, res) => {
  const rows = db
    .prepare(
      `SELECT q.domain_id AS domain_id,
              SUM(aa.is_correct) AS correct,
              COUNT(*) AS total
       FROM attempt_answers aa
       JOIN exam_attempts ea ON ea.id = aa.attempt_id
       JOIN questions q ON q.id = aa.question_id
       WHERE ea.user_id = ? AND ea.finished_at IS NOT NULL
       GROUP BY q.domain_id`
    )
    .all(req.userId) as { domain_id: string; correct: number; total: number }[];

  const domains = db.prepare("SELECT id, name, weight FROM domains").all() as {
    id: string;
    name: string;
    weight: number;
  }[];

  const progress: Record<string, { correct: number; total: number }> = {};
  for (const d of domains) progress[d.id] = { correct: 0, total: 0 };
  for (const r of rows) progress[r.domain_id] = { correct: r.correct, total: r.total };

  res.json(progress);
});

export default router;
