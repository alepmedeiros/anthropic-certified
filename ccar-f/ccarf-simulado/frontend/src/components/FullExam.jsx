import { useEffect, useState } from "react";
import { api } from "../api/client";
import { wrapStyle, cardStyle, colors } from "../theme";

const LETTERS = ["a", "b", "c", "d"];

function toOptions(q) {
  return LETTERS.map((letter) => ({ letter, text: q[`option_${letter}`] }));
}

export default function FullExam({ onDone }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selections, setSelections] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [qs, attempt] = await Promise.all([api.getFullExam(), api.startAttempt("full_exam")]);
        setQuestions(qs);
        setAttemptId(attempt.attempt_id);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const current = questions[index];
  const chosen = current ? selections[current.id] : undefined;
  const isLocked = current ? Boolean(submitted[current.id]) : false;

  const select = (letter) => {
    if (isLocked) return;
    setSelections((prev) => ({ ...prev, [current.id]: letter }));
  };

  const commitCurrent = async () => {
    if (submitted[current.id]) return;
    await api.answer(attemptId, current.id, selections[current.id]);
    setSubmitted((prev) => ({ ...prev, [current.id]: true }));
  };

  const goNext = async () => {
    setSubmitting(true);
    try {
      await commitCurrent();
      if (index + 1 < questions.length) {
        setIndex(index + 1);
      } else {
        const result = await api.finish(attemptId);
        onDone(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const goPrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  if (loading) return <div style={{ ...wrapStyle, color: colors.textDim }}>Loading exam...</div>;
  if (error) return <div style={{ ...wrapStyle, color: colors.red }}>{error}</div>;
  if (!current) return null;

  return (
    <div style={wrapStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: colors.textDim, marginBottom: "8px" }}>
        <span>
          question {index + 1}/{questions.length}
        </span>
        <span>no feedback until the end — real exam style</span>
      </div>
      <div style={{ ...cardStyle, marginBottom: "1rem" }}>
        <div style={{ fontSize: "14px", lineHeight: 1.6 }}>{current.scenario}</div>
      </div>
      <div>
        {toOptions(current).map(({ letter, text }) => (
          <button
            key={letter}
            onClick={() => select(letter)}
            disabled={isLocked}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              background: chosen === letter ? colors.ok : colors.card,
              border: `1px solid ${chosen === letter ? colors.accent : colors.border}`,
              color: colors.text,
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "8px",
              fontSize: "13px",
              fontFamily: "inherit",
              cursor: isLocked ? "default" : "pointer",
              opacity: isLocked && chosen !== letter ? 0.6 : 1,
            }}
          >
            {text}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "0.5rem" }}>
        <button
          onClick={goPrev}
          disabled={index === 0}
          style={{
            background: "transparent",
            border: `1px solid ${colors.border}`,
            color: index === 0 ? colors.textDimmer : colors.text,
            borderRadius: "6px",
            padding: "8px 16px",
            fontSize: "13px",
            cursor: index === 0 ? "default" : "pointer",
            fontFamily: "inherit",
          }}
        >
          previous
        </button>
        <button
          onClick={goNext}
          disabled={chosen === undefined || submitting}
          style={{
            background: chosen === undefined || submitting ? colors.border : colors.accent,
            border: "none",
            color: chosen === undefined || submitting ? colors.textDimmer : colors.accentDark,
            borderRadius: "6px",
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: chosen === undefined || submitting ? "default" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {index + 1 < questions.length ? "next" : "finish exam"}
        </button>
      </div>
    </div>
  );
}
