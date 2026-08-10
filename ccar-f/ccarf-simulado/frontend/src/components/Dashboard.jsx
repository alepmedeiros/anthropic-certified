import { useEffect, useState } from "react";
import { api } from "../api/client";
import { wrapStyle, cardStyle, colors } from "../theme";

export default function Dashboard({ onPractice, onFullExam, refreshKey }) {
  const [domains, setDomains] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [domainsRes, progressRes] = await Promise.all([api.getDomains(), api.getProgress()]);
        setDomains(domainsRes);
        setProgress(progressRes);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshKey]);

  if (loading) {
    return <div style={{ ...wrapStyle, color: colors.textDim }}>Loading progress...</div>;
  }
  if (error) {
    return <div style={{ ...wrapStyle, color: colors.red }}>{error}</div>;
  }

  return (
    <div style={wrapStyle}>
      <div style={{ marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: "12px", color: colors.textDim, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            CCAR-F — domain coverage
          </div>
          <div style={{ fontSize: "20px", fontWeight: 600, marginTop: "4px" }}>Interactive practice exam</div>
        </div>
        <button
          onClick={onFullExam}
          style={{
            background: colors.accent,
            border: "none",
            color: colors.accentDark,
            borderRadius: "6px",
            padding: "8px 14px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          full mock exam ↗
        </button>
      </div>

      {domains.map((d) => {
        const p = progress[d.id] || { correct: 0, total: 0 };
        const pct = p.total > 0 ? Math.round((p.correct / p.total) * 100) : null;
        const barColor = pct === null ? "#3A4552" : pct >= 70 ? colors.accent : pct >= 40 ? colors.yellow : colors.red;
        return (
          <div key={d.id} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
              <span style={{ fontSize: "14px", fontWeight: 600 }}>
                [{d.id}] {d.name}
              </span>
              <span style={{ fontSize: "12px", color: colors.textDim }}>weight {d.weight}%</span>
            </div>
            <div style={{ height: "8px", background: colors.bg, borderRadius: "4px", overflow: "hidden", marginBottom: "6px" }}>
              <div style={{ width: pct === null ? "0%" : `${pct}%`, height: "100%", background: barColor }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: colors.textDim }}>
                {pct === null ? "not tested yet" : `${pct}% correct (${p.correct}/${p.total})`}
              </span>
              <button
                onClick={() => onPractice(d.id)}
                style={{
                  background: "transparent",
                  border: `1px solid ${colors.accent}`,
                  color: colors.accent,
                  borderRadius: "6px",
                  padding: "4px 12px",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                practice
              </button>
            </div>
          </div>
        );
      })}
      <div style={{ fontSize: "11px", color: colors.textDimmer, marginTop: "1rem" }}>
        Progress saved on the server. Fully in English, matching the real exam format.
      </div>
    </div>
  );
}
