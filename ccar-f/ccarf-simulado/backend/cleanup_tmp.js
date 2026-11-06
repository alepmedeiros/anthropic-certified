const Database = require('better-sqlite3');
const db = new Database('data.sqlite');
const user = db.prepare('SELECT id FROM users WHERE email = ?').get('validate8@test.local');
if (user) {
  const attempts = db.prepare('SELECT id FROM exam_attempts WHERE user_id = ?').all(user.id);
  const delAnswers = db.prepare('DELETE FROM attempt_answers WHERE attempt_id = ?');
  for (const a of attempts) delAnswers.run(a.id);
  db.prepare('DELETE FROM exam_attempts WHERE user_id = ?').run(user.id);
  db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
  console.log('Cleaned up test user', user.id, 'and', attempts.length, 'attempts');
}
console.log('total:', db.prepare('SELECT COUNT(*) c FROM questions').get());
console.log('by type:', db.prepare("SELECT question_type, COUNT(*) c FROM questions GROUP BY question_type").all());
