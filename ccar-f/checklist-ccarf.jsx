import React, { useState, useEffect } from "react";

const PLAN = [
  {
    period: "Dia 1 (05/08)",
    domain: "Base — AI Fluency & Exam Guide",
    items: [
      "Curso 'AI Fluency: Framework & Foundations' (Anthropic Academy)",
      "Ler o Exam Guide oficial CCAR-F v1.0 na íntegra (domínios, 6 cenários, escopo)",
      "Nota: cursos de nuvem (Claude on Google Cloud / Amazon Bedrock) NÃO entram no escopo da prova — pular",
    ],
  },
  {
    period: "Dias 2-4 (06-08/08)",
    domain: "D1 — Agentic Architecture & Orchestration (27%)",
    items: [
      "Curso 'Claude 101' (Anthropic Academy)",
      "Curso 'Building with the Claude API'",
      "Estudar Claude Agent SDK, subagent delegation, lifecycle hooks",
      "Estudar critério '1 agente vs. múltiplos agentes'",
      "Exercício oficial 1: agente multi-tool com stop_reason, hooks e escalonamento",
    ],
  },
  {
    period: "Dias 5-7 (09-11/08)",
    domain: "D3 — Claude Code Configuration & Workflows (20%)",
    items: [
      "Curso 'Claude Code in Action'",
      "Estudar CLAUDE.md (hierarquia), .claude/rules/ com glob patterns, @import",
      "Estudar plan mode vs. direct execution, Explore subagent",
      "Exercício oficial 2: configurar Claude Code p/ workflow de time (CLAUDE.md + rules + skill + MCP)",
    ],
  },
  {
    period: "Dias 8-10 (12-14/08)",
    domain: "D4 — Prompt Engineering & Structured Output (20%)",
    items: [
      "Revisar documentação de prompt engineering",
      "Estudar structured output / JSON schema, tool_choice (auto/any/forced)",
      "Estudar Message Batches API — quando é apropriado usar",
      "Exercício oficial 3: pipeline de extração estruturada com validação-retry",
    ],
  },
  {
    period: "Dias 11-13 (15-17/08)",
    domain: "D2 — Tool Design & MCP Integration (18%)",
    items: [
      "Curso 'Introduction to Model Context Protocol'",
      "Estudar design de tool definitions, isError e categorias de erro MCP",
      "Estudar escopo de MCP servers (.mcp.json projeto vs. ~/.claude.json pessoal)",
      "Exercício oficial 4: pipeline de pesquisa multi-agente com propagação de erro",
    ],
  },
  {
    period: "Dias 14-15 (18-19/08)",
    domain: "D5 — Context Management & Reliability (15%)",
    items: [
      "Estudar gestão de contexto longo, handoff entre agentes, scratchpad files",
      "Estudar calibração de confiança (evitar confiança auto-reportada como proxy)",
      "Revisar os 6 cenários oficiais do exam guide",
    ],
  },
  {
    period: "Dias 16-17 (20-21/08)",
    domain: "Simulados",
    items: [
      "Simulado completo 1 (60 questões, 120 min)",
      "Simulado completo 2 (60 questões, 120 min)",
      "Identificar domínio mais fraco",
    ],
  },
  {
    period: "Dia 18 (22/08)",
    domain: "Revisão dirigida",
    items: ["Revisar só o domínio mais fraco do simulado"],
  },
  {
    period: "Dia 19 (23/08)",
    domain: "Fechamento",
    items: ["Releitura do exam guide oficial", "Descanso — sem estudo pesado"],
  },
  {
    period: "24/08",
    domain: "Prova",
    items: [
      "Confirmar horário e modalidade (OnVUE ou test center)",
      "Documento de identificação em mãos",
      "Ambiente/mesa limpos",
    ],
  },
];

const ALL_ITEMS = PLAN.flatMap((block, bi) =>
  block.items.map((label, ii) => ({ id: `${bi}-${ii}`, label, block: bi }))
);

export default function App() {
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("ccarf-checklist", false);
        if (res && res.value) setChecked(JSON.parse(res.value));
      } catch (e) {
        /* no data yet */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggle = async (id) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    try {
      await window.storage.set("ccarf-checklist", JSON.stringify(next), false);
    } catch (e) {
      /* best effort */
    }
  };

  const doneCount = ALL_ITEMS.filter((it) => checked[it.id]).length;
  const totalCount = ALL_ITEMS.length;
  const pct = Math.round((doneCount / totalCount) * 100);

  if (loading) {
    return <div style={{ padding: "1.5rem", color: "#7C8A9A", fontFamily: "monospace" }}>Carregando...</div>;
  }

  const wrap = {
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    background: "#0F1419",
    color: "#E6EDF3",
    padding: "1.5rem",
    borderRadius: "12px",
    maxWidth: "720px",
    margin: "0 auto",
  };

  return (
    <div style={wrap}>
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ fontSize: "12px", color: "#7C8A9A", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Intensivo CCAR-F — 05/08 a 24/08 (base: Exam Guide oficial v1.0)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "6px" }}>
          <div style={{ flex: 1, height: "8px", background: "#1B222C", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "#4FD1C5" : "#F2C14E" }} />
          </div>
          <span style={{ fontSize: "13px", fontWeight: 600 }}>
            {doneCount}/{totalCount} ({pct}%)
          </span>
        </div>
      </div>

      {PLAN.map((block, bi) => {
        const blockItems = ALL_ITEMS.filter((it) => it.block === bi);
        const blockDone = blockItems.filter((it) => checked[it.id]).length;
        return (
          <div
            key={bi}
            style={{
              background: "#1B222C",
              border: "1px solid #2A3441",
              borderRadius: "10px",
              padding: "1rem 1.25rem",
              marginBottom: "0.75rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <div>
                <div style={{ fontSize: "11px", color: "#7C8A9A" }}>{block.period}</div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>{block.domain}</div>
              </div>
              <div style={{ fontSize: "12px", color: "#7C8A9A", alignSelf: "center" }}>
                {blockDone}/{blockItems.length}
              </div>
            </div>
            {blockItems.map((it) => (
              <label
                key={it.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  fontSize: "13px",
                  padding: "4px 0",
                  cursor: "pointer",
                  color: checked[it.id] ? "#7C8A9A" : "#E6EDF3",
                  textDecoration: checked[it.id] ? "line-through" : "none",
                }}
              >
                <input
                  type="checkbox"
                  checked={!!checked[it.id]}
                  onChange={() => toggle(it.id)}
                  style={{ marginTop: "3px" }}
                />
                {it.label}
              </label>
            ))}
          </div>
        );
      })}
      <div style={{ fontSize: "11px", color: "#5A6572", marginTop: "0.5rem" }}>
        Progresso salvo automaticamente. Compromisso: {doneCount === totalCount ? "intensivo completo." : `${totalCount - doneCount} entregas restantes até 24/08.`}
      </div>
    </div>
  );
}
