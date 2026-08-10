import { useEffect, useState } from "react";
import { api } from "../api/client";
import { wrapStyle, cardStyle, secondaryButton, colors } from "../theme";

export default function ExamResult({ result, onDone }) {
  const [domains, setDomains] = useState([]);

  useEffect(() => {
    api.getDomains().then(setDomains).catch(() => {});
  }, []);

  return (
    <div style={wrapStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: "12px", color: colors.textDim, marginBottom: "4px" }}>full mock exam result</div>
        <div style={{ fontSize: "28px", fontWeight: 700, color: result.passed ? colors.accent : colors.red }}>
          {result.scaled_score}/1000
        </div>
        <div style={{ fontSize: "13px", marginTop: "4px" }}>
          {result.passed ? `Pass (cutoff ${result.pass_cutoff})` : `Fail (cutoff ${result.pass_cutoff})`}
        </div>
      </div>

      {domains.map((d) => {
        const b = result.by_domain[d.id];
        if (!b || b.total === 0) return null;
        const acc = Math.round((b.correct / b.total) * 100);
        return (
          <div key={d.id} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600 }}>
                [{d.id}] {d.name}
              </span>
              <span style={{ fontSize: "12px", color: acc >= 70 ? colors.accent : colors.red }}>
                {b.correct}/{b.total} ({acc}%)
              </span>
            </div>
            {b.missed.length > 0 && (
              <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: "6px", marginTop: "4px" }}>
                {b.missed.map((q) => (
                  <div key={q.question_id} style={{ fontSize: "12px", marginBottom: "6px" }}>
                    <div style={{ color: colors.red, marginBottom: "2px" }}>missed: {q.scenario.slice(0, 70)}...</div>
                    <div style={{ color: colors.textDim }}>{q.reinforce}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <button onClick={onDone} style={secondaryButton}>
        back to dashboard
      </button>
    </div>
  );
}
