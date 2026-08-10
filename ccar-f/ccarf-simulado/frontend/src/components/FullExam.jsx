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
  const isMulti = current?.question_type === "multi";
  const selectCount = current?.select_count ?? 1;
  const chosen = current ? selections[current.id] ?? [] : [];
  const isLocked = current ? Boolean(submitted[current.id]) : false;
  const isAnswerComplete = chosen.length === selectCount;

  const select = (letter) => {
    if (isLocked) return;
    if (!isMulti) {
      setSelections((prev) => ({ ...prev, [current.id]: [letter] }));
      return;
    }
    setSelections((prev) => {
      const prevChosen = prev[current.id] ?? [];
      const nextChosen = prevChosen.includes(letter)
        ? prevChosen.filter((l) => l !== letter)
        : prevChosen.length < selectCount
        ? [...prevChosen, letter]
        : prevChosen;
      return { ...prev, [current.id]: nextChosen };
    });
  };

  const commitCurrent = async () => {
    if (submitted[current.id]) return;
    const choice = selections[current.id] ?? [];
    await api.answer(attemptId, current.id, isMulti ? choice : choice[0]);
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
      {isMulti && (
        <div style={{ fontSize: "12px", color: colors.textDim, marginBottom: "8px" }}>
          Select {selectCount} responses ({chosen.length}/{selectCount} chosen)
        </div>
      )}
      <div>
        {toOptions(current).map(({ letter, text }) => {
          const isSelected = chosen.includes(letter);
          return (
            <button
              key={letter}
              onClick={() => select(letter)}
              disabled={isLocked}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                background: isSelected ? colors.ok : colors.card,
                border: `1px solid ${isSelected ? colors.accent : colors.border}`,
                color: colors.text,
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "8px",
                fontSize: "13px",
                fontFamily: "inherit",
                cursor: isLocked ? "default" : "pointer",
                opacity: isLocked && !isSelected ? 0.6 : 1,
              }}
            >
              {isMulti ? (isSelected ? "☑ " : "☐ ") : ""}
              {text}
            </button>
          );
        })}
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
          disabled={!isAnswerComplete || submitting}
          style={{
            background: !isAnswerComplete || submitting ? colors.border : colors.accent,
            border: "none",
            color: !isAnswerComplete || submitting ? colors.textDimmer : colors.accentDark,
            borderRadius: "6px",
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: !isAnswerComplete || submitting ? "default" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {index + 1 < questions.length ? "next" : "finish exam"}
        </button>
      </div>
    </div>
  );
}
