import { useEffect, useState } from "react";
import { api } from "../api/client";
import { wrapStyle, cardStyle, primaryButton, secondaryButton, colors } from "../theme";

const LETTERS = ["a", "b", "c", "d"];

function toOptions(q) {
  return LETTERS.map((letter) => ({ letter, text: q[`option_${letter}`] }));
}

export default function DomainQuiz({ domainId, onDone }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [qs, attempt] = await Promise.all([
          api.getQuestions(domainId),
          api.startAttempt("domain_practice", domainId),
        ]);
        setQuestions(qs);
        setAttemptId(attempt.attempt_id);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [domainId]);

  const current = questions[index];
  const isMulti = current?.question_type === "multi";
  const selectCount = current?.select_count ?? 1;

  const submitAnswer = async (letters) => {
    try {
      const result = await api.answer(attemptId, current.id, isMulti ? letters : letters[0]);
      if (result.is_correct) setCorrectCount((c) => c + 1);
      setFeedback(result);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleOption = (letter) => {
    if (feedback) return;
    if (!isMulti) {
      setSelected([letter]);
      submitAnswer([letter]);
      return;
    }
    setSelected((prev) =>
      prev.includes(letter) ? prev.filter((l) => l !== letter) : prev.length < selectCount ? [...prev, letter] : prev
    );
  };

  const next = async () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setSelected([]);
      setFeedback(null);
    } else {
      try {
        await api.finish(attemptId);
      } catch (err) {
        setError(err.message);
      }
      setFinished(true);
    }
  };

  if (loading) return <div style={{ ...wrapStyle, color: colors.textDim }}>Loading questions...</div>;
  if (error) return <div style={{ ...wrapStyle, color: colors.red }}>{error}</div>;

  if (finished) {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <div style={wrapStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: "12px", color: colors.textDim, marginBottom: "4px" }}>[{domainId}] session result</div>
          <div style={{ fontSize: "24px", fontWeight: 600, marginBottom: "8px" }}>
            {correctCount}/{questions.length} ({pct}%)
          </div>
          <div style={{ fontSize: "13px", color: colors.textDim }}>
            {pct >= 70
              ? "Domain solid in this sample — keep up spaced review."
              : "Reinforce this domain before the full mock exam — review the material pointed out in the explanations above."}
          </div>
        </div>
        <button onClick={onDone} style={secondaryButton}>
          back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <div style={{ fontSize: "12px", color: colors.textDim, marginBottom: "8px" }}>
        [{domainId}] question {index + 1}/{questions.length}
      </div>
      <div style={{ ...cardStyle, marginBottom: "1rem" }}>
        <div style={{ fontSize: "14px", lineHeight: 1.6 }}>{current.scenario}</div>
      </div>
      {isMulti && !feedback && (
        <div style={{ fontSize: "12px", color: colors.textDim, marginBottom: "8px" }}>
          Select {selectCount} responses ({selected.length}/{selectCount} chosen)
        </div>
      )}
      <div>
        {toOptions(current).map(({ letter, text }) => {
          let bg = colors.card;
          let border = colors.border;
          const isSelected = selected.includes(letter);
          if (feedback) {
            if (feedback.is_correct && isSelected) {
              bg = colors.ok;
              border = colors.accent;
            } else if (!feedback.is_correct && isSelected) {
              bg = colors.bad;
              border = colors.red;
            }
          } else if (isMulti && isSelected) {
            bg = colors.ok;
            border = colors.accent;
          }
          return (
            <button
              key={letter}
              onClick={() => toggleOption(letter)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                background: bg,
                border: `1px solid ${border}`,
                color: colors.text,
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "8px",
                fontSize: "13px",
                fontFamily: "inherit",
                cursor: feedback ? "default" : "pointer",
              }}
            >
              {isMulti ? (isSelected ? "☑ " : "☐ ") : ""}
              {text}
            </button>
          );
        })}
      </div>
      {isMulti && !feedback && (
        <button
          onClick={() => submitAnswer(selected)}
          disabled={selected.length !== selectCount}
          style={{
            ...primaryButton,
            opacity: selected.length !== selectCount ? 0.5 : 1,
            cursor: selected.length !== selectCount ? "default" : "pointer",
          }}
        >
          submit answer
        </button>
      )}
      {feedback && (
        <div style={{ ...cardStyle, marginTop: "0.5rem" }}>
          <div style={{ fontSize: "13px", marginBottom: "6px", color: feedback.is_correct ? colors.accent : colors.red }}>
            {feedback.is_correct ? "Correct" : "Incorrect"}
          </div>
          <div style={{ fontSize: "13px", lineHeight: 1.6, marginBottom: "8px" }}>{feedback.explanation}</div>
          <div style={{ fontSize: "12px", color: colors.textDim }}>{feedback.reinforce}</div>
        </div>
      )}
      {feedback && (
        <button onClick={next} style={{ ...primaryButton, marginTop: "0.75rem" }}>
          {index + 1 < questions.length ? "next question" : "finish"}
        </button>
      )}
    </div>
  );
}
