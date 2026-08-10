import React, { useState, useEffect } from "react";

const DOMAINS = [
  { id: "D1", name: "Agentic Architecture & Orchestration", weight: 27 },
  { id: "D3", name: "Claude Code Configuration & Workflows", weight: 20 },
  { id: "D4", name: "Prompt Engineering & Structured Output", weight: 20 },
  { id: "D2", name: "Tool Design & MCP Integration", weight: 18 },
  { id: "D5", name: "Context Management & Reliability", weight: 15 },
];

const QUESTIONS = [
  {
    id: "d1-1",
    domain: "D1",
    scenario:
      "A customer support system currently uses a single Claude agent that both classifies the incoming ticket and drafts the reply. Response quality has dropped as ticket categories grew from 5 to 40. What is the most defensible architectural change?",
    options: [
      "Increase max_tokens so the single agent has more room to reason",
      "Split into a classifier subagent that routes to specialized reply subagents per category cluster",
      "Switch the single agent from Haiku to Opus",
      "Add a longer system prompt listing all 40 categories",
    ],
    correct: 1,
    explanation:
      "As category variety grows, a single generalist agent degrades. The correct pattern is decomposing into specialized subagents with a router in front — it reduces the cognitive load of each prompt and lets you optimize each subagent independently.",
    reinforce: "Review: 'Building with the Claude API' course, section on subagent delegation and when to split responsibilities.",
  },
  {
    id: "d1-2",
    domain: "D1",
    scenario:
      "An agent occasionally enters a loop, repeatedly calling the same tool with near-identical arguments without making progress. Which control best addresses this at the architecture level?",
    options: [
      "Lower the temperature to 0",
      "Add a maximum iteration count and a stagnation check that halts the loop and escalates",
      "Remove the tool from the agent's toolset",
      "Ask the user to rephrase the request",
    ],
    correct: 1,
    explanation:
      "Non-terminating loops are a known risk in agentic systems. The architectural fix is an explicit guardrail (max iteration count + stagnation detection), not generation parameters.",
    reinforce: "Review: lifecycle hooks and agentic loop termination.",
  },
  {
    id: "d1-3",
    domain: "D1",
    scenario:
      "A multi-agent research system has a lead agent delegating to 4 parallel research subagents. Each subagent returns 3,000 tokens of raw findings. What is the recommended handoff pattern?",
    options: [
      "Pass all raw findings directly into the lead agent's context untouched",
      "Have each subagent return a compressed summary with citations, not raw findings",
      "Have the lead agent re-run each subagent's search itself to verify",
      "Discard subagent output and let the lead agent answer from its own knowledge",
    ],
    correct: 1,
    explanation:
      "Subagents should return condensed, citable results, not raw context — this avoids blowing out the lead agent's context window and keeps traceability.",
    reinforce: "Review: Context Management & Reliability (D5) crossed with multi-agent orchestration.",
  },
  {
    id: "d3-1",
    domain: "D3",
    scenario:
      "A team's CLAUDE.md at the repo root conflicts with a more specific CLAUDE.md in a subdirectory used only by the payments module. Which file's instructions take precedence for work inside that subdirectory?",
    options: [
      "The repo root CLAUDE.md always wins",
      "The more specific, nested CLAUDE.md takes precedence for that scope",
      "Both are merged with no precedence",
      "Neither is used unless referenced explicitly in the prompt",
    ],
    correct: 1,
    explanation:
      "Claude Code resolves CLAUDE.md hierarchically: the file closest/most specific to the working scope takes precedence over the more generic one.",
    reinforce: "Review: 'Claude Code in Action' course, section on CLAUDE.md hierarchy.",
  },
  {
    id: "d3-2",
    domain: "D3",
    scenario:
      "You want Claude Code to automatically run the test suite after every file edit and block the edit from being considered complete if tests fail. What is the correct mechanism?",
    options: [
      "A post-edit hook that runs the test command and surfaces failures",
      "A comment in CLAUDE.md asking Claude to remember to run tests",
      "A separate agent that reviews the diff manually",
      "Increasing the context window",
    ],
    correct: 0,
    explanation:
      "Hooks are the deterministic mechanism for workflow automation (e.g., running tests post-edit). CLAUDE.md instructions are guidance, not a guarantee of execution.",
    reinforce: "Review: hooks and workflow automation in the 'Claude Code in Action' course.",
  },
  {
    id: "d3-3",
    domain: "D3",
    scenario:
      "In a CI/CD pipeline, Claude Code is used to generate a fix for a failing build. What is the safest way to integrate this into the pipeline?",
    options: [
      "Auto-merge any change Claude Code proposes directly to main",
      "Have Claude Code open a PR with the proposed fix for human review before merge",
      "Run Claude Code with no logging to save cost",
      "Give Claude Code direct write access to production",
    ],
    correct: 1,
    explanation:
      "The safe pattern is generating the proposal as a PR, keeping human review before merge — full autonomy with no review is the anti-pattern the exam tends to test for.",
    reinforce: "Review: conservative-autonomy principles and human-in-the-loop in CI/CD.",
  },
  {
    id: "d4-1",
    domain: "D4",
    scenario:
      "An application needs Claude to always return a JSON object matching a fixed schema, even when the model is uncertain about a field. What is the most reliable approach?",
    options: [
      "Ask nicely in the prompt to 'please return valid JSON'",
      "Provide the schema explicitly and use structured output / tool-call-style constrained generation",
      "Post-process free text with regex to extract fields",
      "Increase temperature so the model is more creative with formatting",
    ],
    correct: 1,
    explanation:
      "Format reliability comes from constrained/structured output with an explicit schema, not from politely asking in the prompt nor from best-effort parsing afterward.",
    reinforce: "Review: structured output and JSON schema documentation in the API course.",
  },
  {
    id: "d4-2",
    domain: "D4",
    scenario:
      "A prompt produces inconsistent quality across similar inputs. The team suspects the instructions are too vague about edge cases. What is the best first fix?",
    options: [
      "Add few-shot examples covering the edge cases explicitly",
      "Switch models to a larger one without changing the prompt",
      "Reduce the prompt to a single sentence for simplicity",
      "Increase max_tokens",
    ],
    correct: 0,
    explanation:
      "Edge-case inconsistency is mainly solved with examples (few-shot) that anchor the expected behavior, not by switching models or trimming instructions.",
    reinforce: "Review: prompt engineering — few-shot and edge-case coverage.",
  },
  {
    id: "d4-3",
    domain: "D4",
    scenario:
      "You need Claude to output a confidence-tagged answer so a downstream system can decide whether to escalate to a human. What should the prompt/schema require?",
    options: [
      "A free-text explanation only, no structured field",
      "An explicit confidence field with defined thresholds tied to the schema",
      "No confidence signal — let the human always review everything",
      "A binary yes/no with no nuance",
    ],
    correct: 1,
    explanation:
      "Confidence calibration requires an explicit, structured field with defined thresholds, letting the downstream system make an automated escalation decision.",
    reinforce: "Review: Context Management & Reliability, confidence calibration section.",
  },
  {
    id: "d2-1",
    domain: "D2",
    scenario:
      "A tool definition for 'search_orders' accepts a free-text 'query' string and internally tries to guess whether the user meant an order ID, a customer name, or a date range. Agents frequently misuse it. What is the better tool design?",
    options: [
      "Keep one flexible tool but add more examples to the system prompt",
      "Split into explicit, narrowly-scoped tools (search_by_order_id, search_by_customer, search_by_date_range)",
      "Remove the tool and let the agent write raw SQL",
      "Add a confirmation step asking the user to clarify every time",
    ],
    correct: 1,
    explanation:
      "Ambiguous, generic tools lead to misuse. Good tool design calls for a narrow, explicit scope per tool, reducing the surface for misinterpretation.",
    reinforce: "Review: 'Introduction to Model Context Protocol' course, tool design section.",
  },
  {
    id: "d2-2",
    domain: "D2",
    scenario:
      "Your team needs the same set of internal tools (CRM lookup, ticket creation) available to both a Claude Code workflow and a separate customer-facing agent. What is the most maintainable approach?",
    options: [
      "Duplicate the tool implementations in each codebase",
      "Expose the tools once via an MCP server that both consumers connect to",
      "Hard-code the CRM logic inside each agent's system prompt",
      "Give both agents direct database credentials",
    ],
    correct: 1,
    explanation:
      "MCP exists exactly for this case: centralizing reusable tools behind a single server, avoiding duplication and enabling centralized governance.",
    reinforce: "Review: MCP — motivation and architecture, 'Introduction to Model Context Protocol' course.",
  },
  {
    id: "d5-1",
    domain: "D5",
    scenario:
      "A long-running agent workflow is approaching the context window limit after many tool calls. What is the recommended reliability pattern?",
    options: [
      "Let the context overflow and truncate silently",
      "Periodically summarize/compact prior turns and carry forward only what's needed",
      "Restart the conversation from scratch with no memory of progress",
      "Increase max_tokens on the response only",
    ],
    correct: 1,
    explanation:
      "Periodic compaction (summarizing prior turns, keeping only what's essential) is the reliability pattern for long-running work, avoiding overflow and quality loss.",
    reinforce: "Review: Context Management & Reliability — compaction and handoff.",
  },
  {
    id: "d5-2",
    domain: "D5",
    scenario:
      "When handing off a task from one subagent to another, what should be passed to preserve reliability without bloating context?",
    options: [
      "The full raw conversation history of the first subagent",
      "A structured summary of decisions made and remaining objectives",
      "Nothing — the second subagent should start blind",
      "Only the original user prompt, ignoring intermediate progress",
    ],
    correct: 1,
    explanation:
      "Reliable handoffs pass a structured summary of decisions made and remaining objectives — not the raw history (expensive and noisy) nor nothing at all (loses progress).",
    reinforce: "Review: agent-to-agent handoff patterns, D5.",
  },
  {
    id: "d1-4",
    domain: "D1",
    scenario:
      "You are implementing the control flow for an agentic loop using the Claude Agent SDK. After sending a request, you inspect the response's stop_reason field. What should determine whether the loop continues to another iteration?",
    options: [
      "Continue when stop_reason is 'tool_use'; terminate when it is 'end_turn'",
      "Continue until the assistant's text content mentions the word 'done'",
      "Continue for a fixed number of iterations regardless of stop_reason",
      "Terminate as soon as any tool is called, to keep latency low",
    ],
    correct: 0,
    explanation:
      "The documented control flow checks stop_reason: 'tool_use' means Claude wants to call a tool and the loop continues; 'end_turn' means the model is done. Parsing text content or using a fixed iteration cap as the primary mechanism are explicit anti-patterns.",
    reinforce: "Review: Task Statement 1.1, agentic loop lifecycle and stop_reason handling.",
  },
  {
    id: "d1-5",
    domain: "D1",
    scenario:
      "A coordinator agent needs to spawn subagents to research a topic. What must be true for this to work correctly with the Claude Agent SDK?",
    options: [
      "The coordinator's allowedTools must include 'Task', and each subagent must receive its needed context explicitly in its prompt",
      "Subagents automatically inherit the coordinator's full conversation history",
      "Only one subagent can be spawned per coordinator turn",
      "Subagents share a single memory space with the coordinator by default",
    ],
    correct: 0,
    explanation:
      "Spawning subagents requires 'Task' in the coordinator's allowedTools. Subagents run with isolated context and do NOT automatically inherit the coordinator's history — required context must be passed explicitly in the prompt.",
    reinforce: "Review: Task Statement 1.3, Task tool and explicit context passing.",
  },
  {
    id: "d2-3",
    domain: "D2",
    scenario:
      "An MCP tool occasionally fails. Some failures are due to a temporary network timeout, others because the requested refund exceeds a policy threshold. Both currently return a generic 'Operation failed' message. What should change?",
    options: [
      "Return structured error metadata: an errorCategory (transient/validation/permission/business), an isRetryable boolean, and a human-readable description",
      "Always retry three times regardless of error type before giving up",
      "Suppress the error and return an empty successful result instead",
      "Terminate the entire agent session whenever any tool call fails",
    ],
    correct: 0,
    explanation:
      "Uniform 'Operation failed' messages prevent the agent from making appropriate recovery decisions. Structured error responses with errorCategory and isRetryable let the agent distinguish transient errors (worth retrying) from business/policy errors (explain to the user, don't retry).",
    reinforce: "Review: Task Statement 2.2, MCP isError pattern and structured error responses.",
  },
  {
    id: "d2-4",
    domain: "D2",
    scenario:
      "You want to guarantee that a specific extraction tool, extract_metadata, is always the first tool called before any enrichment tools run, regardless of what the model might otherwise choose. Which tool_choice configuration achieves this?",
    options: [
      "tool_choice: 'auto'",
      "tool_choice: 'any'",
      "tool_choice: {'type': 'tool', 'name': 'extract_metadata'} (forced selection)",
      "Omitting tool_choice entirely",
    ],
    correct: 2,
    explanation:
      "Forced tool selection guarantees the model calls that specific named tool. 'auto' lets the model choose freely (or return text); 'any' guarantees a tool call but not which one.",
    reinforce: "Review: Task Statement 4.3, tool_choice options (auto/any/forced).",
  },
  {
    id: "d3-4",
    domain: "D3",
    scenario:
      "A new team member joins the project and doesn't receive the team's shared Claude Code instructions, even though other developers do. Investigation shows the instructions were placed in their personal configuration. Where should shared, version-controlled team instructions live instead?",
    options: [
      "~/.claude/CLAUDE.md (user-level)",
      "The project-level CLAUDE.md, committed to the repository",
      "A private note sent to each new hire individually",
      "Environment variables on each developer's machine",
    ],
    correct: 1,
    explanation:
      "User-level CLAUDE.md (~/.claude/CLAUDE.md) applies only to that individual and is not shared via version control. Project-level CLAUDE.md, committed to the repo, is what every team member receives automatically.",
    reinforce: "Review: Task Statement 3.1, CLAUDE.md hierarchy (user/project/directory).",
  },
  {
    id: "d3-5",
    domain: "D3",
    scenario:
      "Your codebase has test files scattered across many directories (e.g., Button.test.tsx next to Button.tsx), and you want the same testing conventions applied automatically regardless of location. What is the most maintainable mechanism?",
    options: [
      "A CLAUDE.md file placed in every subdirectory that contains a test file",
      "A single monolithic root CLAUDE.md listing every convention under separate headers",
      "A .claude/rules/ file with YAML frontmatter specifying a glob pattern like paths: ['**/*.test.tsx']",
      "Renaming all test files to live in one central folder",
    ],
    correct: 2,
    explanation:
      ".claude/rules/ with glob-pattern path scoping applies conventions by file pattern regardless of directory location — exactly suited for conventions (like test standards) that span many directories. Directory-bound CLAUDE.md files can't handle files spread across the codebase.",
    reinforce: "Review: Task Statement 3.3, path-specific rules with glob patterns.",
  },
  {
    id: "d4-4",
    domain: "D4",
    scenario:
      "Your team wants to move two workflows to the Message Batches API for its 50% cost savings: (1) a blocking pre-merge check developers wait on, and (2) an overnight technical-debt report. Which is the correct evaluation?",
    options: [
      "Move both to batch processing — the cost savings apply universally",
      "Move only the overnight report to batch; keep the pre-merge check on the real-time API",
      "Keep both on the real-time API to avoid any batch complexity",
      "Move only the pre-merge check to batch, since it runs more frequently",
    ],
    correct: 1,
    explanation:
      "The Batches API can take up to 24 hours with no latency SLA — fine for a non-blocking overnight report, unacceptable for a blocking pre-merge check developers are actively waiting on.",
    reinforce: "Review: Task Statement 4.5, Message Batches API — when it is and isn't appropriate.",
  },
  {
    id: "d5-3",
    domain: "D5",
    scenario:
      "A customer support agent escalates a request to a human only when its self-reported confidence score drops below a set threshold. Production data shows this agent is often highly 'confident' while handling cases it actually mishandles. What does the exam guide identify as the core issue with this design?",
    options: [
      "Self-reported LLM confidence scores are poorly calibrated and are an unreliable proxy for actual case complexity",
      "The confidence threshold was simply set too low and needs to be raised",
      "Confidence-based escalation always outperforms explicit criteria",
      "The agent needs a larger context window to assess confidence accurately",
    ],
    correct: 0,
    explanation:
      "The guide explicitly calls out self-reported confidence as an unreliable signal for escalation — the model can be confidently wrong. The recommended fix is explicit escalation criteria with few-shot examples, not tuning a confidence threshold.",
    reinforce: "Review: Task Statement 5.2, escalation triggers vs. unreliable confidence/sentiment proxies.",
  },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  const [view, setView] = useState("dashboard");
  const [progress, setProgress] = useState(null);
  const [activeDomain, setActiveDomain] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [loading, setLoading] = useState(true);

  // full-exam mode
  const [examQuestions, setExamQuestions] = useState([]);
  const [examAnswers, setExamAnswers] = useState({});
  const [examIndex, setExamIndex] = useState(0);
  const [examResult, setExamResult] = useState(null);

  const startExam = () => {
    setExamQuestions(shuffle(QUESTIONS));
    setExamAnswers({});
    setExamIndex(0);
    setExamResult(null);
    setView("exam");
  };

  const examAnswer = (idx) => {
    setExamAnswers({ ...examAnswers, [examQuestions[examIndex].id]: idx });
  };

  const examNext = () => {
    if (examIndex + 1 < examQuestions.length) {
      setExamIndex(examIndex + 1);
    } else {
      finishExam();
    }
  };

  const examPrev = () => {
    if (examIndex > 0) setExamIndex(examIndex - 1);
  };

  const finishExam = async () => {
    const byDomain = {};
    DOMAINS.forEach((d) => (byDomain[d.id] = { correct: 0, total: 0, missed: [] }));
    examQuestions.forEach((q) => {
      const given = examAnswers[q.id];
      byDomain[q.domain].total += 1;
      if (given === q.correct) {
        byDomain[q.domain].correct += 1;
      } else {
        byDomain[q.domain].missed.push(q);
      }
    });
    let weightedScore = 0;
    DOMAINS.forEach((d) => {
      const b = byDomain[d.id];
      const acc = b.total > 0 ? b.correct / b.total : 0;
      weightedScore += acc * d.weight;
    });
    const scaled = Math.round(weightedScore * 10); // weights sum ~100 -> scale to /1000
    const passed = scaled >= 720;
    setExamResult({ byDomain, scaled, passed });

    const nextProgress = { ...progress };
    DOMAINS.forEach((d) => {
      nextProgress[d.id] = {
        correct: (nextProgress[d.id]?.correct || 0) + byDomain[d.id].correct,
        total: (nextProgress[d.id]?.total || 0) + byDomain[d.id].total,
      };
    });
    saveProgress(nextProgress);
    setView("examResult");
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("ccarf-progress", false);
        if (res && res.value) {
          setProgress(JSON.parse(res.value));
        } else {
          const init = {};
          DOMAINS.forEach((d) => (init[d.id] = { correct: 0, total: 0 }));
          setProgress(init);
        }
      } catch (e) {
        const init = {};
        DOMAINS.forEach((d) => (init[d.id] = { correct: 0, total: 0 }));
        setProgress(init);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveProgress = async (next) => {
    setProgress(next);
    try {
      await window.storage.set("ccarf-progress", JSON.stringify(next), false);
    } catch (e) {
      /* best effort */
    }
  };

  const startDomain = (domainId) => {
    setActiveDomain(domainId);
    setQIndex(0);
    setSelected(null);
    setRevealed(false);
    setSessionCorrect(0);
    setView("quiz");
  };

  const domainQuestions = QUESTIONS.filter((q) => q.domain === activeDomain);
  const current = domainQuestions[qIndex];

  const answer = (idx) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    if (idx === current.correct) setSessionCorrect((c) => c + 1);
  };

  const next = () => {
    if (qIndex + 1 < domainQuestions.length) {
      setQIndex(qIndex + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      const wasCorrect = selected === current.correct ? 0 : 0;
      const finalCorrect = sessionCorrect;
      const nextProgress = { ...progress };
      nextProgress[activeDomain] = {
        correct: nextProgress[activeDomain].correct + finalCorrect,
        total: nextProgress[activeDomain].total + domainQuestions.length,
      };
      saveProgress(nextProgress);
      setView("result");
    }
  };

  if (loading || !progress) {
    return (
      <div style={{ padding: "2rem", fontFamily: "var(--font-sans, sans-serif)", color: "var(--text-secondary, #666)" }}>
        Loading progress...
      </div>
    );
  }

  const wrapStyle = {
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    background: "#0F1419",
    color: "#E6EDF3",
    padding: "1.5rem",
    borderRadius: "12px",
    maxWidth: "720px",
    margin: "0 auto",
  };

  const cardStyle = {
    background: "#1B222C",
    border: "1px solid #2A3441",
    borderRadius: "10px",
    padding: "1rem 1.25rem",
    marginBottom: "0.75rem",
  };

  if (view === "dashboard") {
    return (
      <div style={wrapStyle}>
        <div style={{ marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: "12px", color: "#7C8A9A", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              CCAR-F — domain coverage
            </div>
            <div style={{ fontSize: "20px", fontWeight: 600, marginTop: "4px" }}>Interactive practice exam</div>
          </div>
          <button
            onClick={startExam}
            style={{
              background: "#4FD1C5",
              border: "none",
              color: "#04342C",
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

        {DOMAINS.map((d) => {
          const p = progress[d.id] || { correct: 0, total: 0 };
          const pct = p.total > 0 ? Math.round((p.correct / p.total) * 100) : null;
          const barColor = pct === null ? "#3A4552" : pct >= 70 ? "#4FD1C5" : pct >= 40 ? "#F2C14E" : "#F2555A";
          return (
            <div key={d.id} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                <span style={{ fontSize: "14px", fontWeight: 600 }}>
                  [{d.id}] {d.name}
                </span>
                <span style={{ fontSize: "12px", color: "#7C8A9A" }}>weight {d.weight}%</span>
              </div>
              <div style={{ height: "8px", background: "#0F1419", borderRadius: "4px", overflow: "hidden", marginBottom: "6px" }}>
                <div
                  style={{
                    width: pct === null ? "0%" : `${pct}%`,
                    height: "100%",
                    background: barColor,
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#7C8A9A" }}>
                  {pct === null ? "not tested yet" : `${pct}% correct (${p.correct}/${p.total})`}
                </span>
                <button
                  onClick={() => startDomain(d.id)}
                  style={{
                    background: "transparent",
                    border: "1px solid #4FD1C5",
                    color: "#4FD1C5",
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
        <div style={{ fontSize: "11px", color: "#5A6572", marginTop: "1rem" }}>
          Progress saved automatically between sessions. Fully in English, matching the real exam format. Questions grounded in the official CCAR-F Exam Guide v1.0 task statements.
        </div>
      </div>
    );
  }

  if (view === "quiz" && current) {
    return (
      <div style={wrapStyle}>
        <div style={{ fontSize: "12px", color: "#7C8A9A", marginBottom: "8px" }}>
          [{current.domain}] question {qIndex + 1}/{domainQuestions.length}
        </div>
        <div style={{ ...cardStyle, marginBottom: "1rem" }}>
          <div style={{ fontSize: "14px", lineHeight: 1.6 }}>{current.scenario}</div>
        </div>
        <div>
          {current.options.map((opt, idx) => {
            let bg = "#1B222C";
            let border = "#2A3441";
            if (revealed) {
              if (idx === current.correct) {
                bg = "#0F2B27";
                border = "#4FD1C5";
              } else if (idx === selected) {
                bg = "#2B1315";
                border = "#F2555A";
              }
            }
            return (
              <button
                key={idx}
                onClick={() => answer(idx)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: bg,
                  border: `1px solid ${border}`,
                  color: "#E6EDF3",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  marginBottom: "8px",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  cursor: revealed ? "default" : "pointer",
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {revealed && (
          <div style={{ ...cardStyle, marginTop: "0.5rem" }}>
            <div style={{ fontSize: "13px", marginBottom: "6px", color: selected === current.correct ? "#4FD1C5" : "#F2555A" }}>
              {selected === current.correct ? "Correct" : "Incorrect"}
            </div>
            <div style={{ fontSize: "13px", lineHeight: 1.6, marginBottom: "8px" }}>{current.explanation}</div>
            <div style={{ fontSize: "12px", color: "#7C8A9A" }}>{current.reinforce}</div>
          </div>
        )}
        {revealed && (
          <button
            onClick={next}
            style={{
              marginTop: "0.75rem",
              background: "#4FD1C5",
              border: "none",
              color: "#04342C",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {qIndex + 1 < domainQuestions.length ? "next question" : "finish"}
          </button>
        )}
      </div>
    );
  }

  if (view === "exam" && examQuestions.length > 0) {
    const eq = examQuestions[examIndex];
    const given = examAnswers[eq.id];
    return (
      <div style={wrapStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#7C8A9A", marginBottom: "8px" }}>
          <span>question {examIndex + 1}/{examQuestions.length}</span>
          <span>no feedback until the end — real exam style</span>
        </div>
        <div style={{ ...cardStyle, marginBottom: "1rem" }}>
          <div style={{ fontSize: "14px", lineHeight: 1.6 }}>{eq.scenario}</div>
        </div>
        <div>
          {eq.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => examAnswer(idx)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                background: given === idx ? "#0F2B27" : "#1B222C",
                border: `1px solid ${given === idx ? "#4FD1C5" : "#2A3441"}`,
                color: "#E6EDF3",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "8px",
                fontSize: "13px",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "8px", marginTop: "0.5rem" }}>
          <button
            onClick={examPrev}
            disabled={examIndex === 0}
            style={{
              background: "transparent",
              border: "1px solid #2A3441",
              color: examIndex === 0 ? "#3A4552" : "#E6EDF3",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "13px",
              cursor: examIndex === 0 ? "default" : "pointer",
              fontFamily: "inherit",
            }}
          >
            previous
          </button>
          <button
            onClick={examNext}
            disabled={given === undefined}
            style={{
              background: given === undefined ? "#2A3441" : "#4FD1C5",
              border: "none",
              color: given === undefined ? "#5A6572" : "#04342C",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: given === undefined ? "default" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {examIndex + 1 < examQuestions.length ? "next" : "finish exam"}
          </button>
        </div>
      </div>
    );
  }

  if (view === "examResult" && examResult) {
    return (
      <div style={wrapStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: "12px", color: "#7C8A9A", marginBottom: "4px" }}>full mock exam result</div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: examResult.passed ? "#4FD1C5" : "#F2555A" }}>
            {examResult.scaled}/1000
          </div>
          <div style={{ fontSize: "13px", marginTop: "4px" }}>
            {examResult.passed ? "Pass (cutoff 720)" : "Fail (cutoff 720)"}
          </div>
        </div>

        {DOMAINS.map((d) => {
          const b = examResult.byDomain[d.id];
          if (!b || b.total === 0) return null;
          const acc = Math.round((b.correct / b.total) * 100);
          return (
            <div key={d.id} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600 }}>
                  [{d.id}] {d.name}
                </span>
                <span style={{ fontSize: "12px", color: acc >= 70 ? "#4FD1C5" : "#F2555A" }}>
                  {b.correct}/{b.total} ({acc}%)
                </span>
              </div>
              {b.missed.length > 0 && (
                <div style={{ borderTop: "1px solid #2A3441", paddingTop: "6px", marginTop: "4px" }}>
                  {b.missed.map((q) => (
                    <div key={q.id} style={{ fontSize: "12px", marginBottom: "6px" }}>
                      <div style={{ color: "#F2555A", marginBottom: "2px" }}>missed: {q.scenario.slice(0, 70)}...</div>
                      <div style={{ color: "#7C8A9A" }}>{q.reinforce}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <button
          onClick={() => setView("dashboard")}
          style={{
            background: "transparent",
            border: "1px solid #4FD1C5",
            color: "#4FD1C5",
            borderRadius: "6px",
            padding: "8px 16px",
            fontSize: "13px",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          back to dashboard
        </button>
      </div>
    );
  }

  if (view === "result") {
    const pct = Math.round((sessionCorrect / domainQuestions.length) * 100);
    return (
      <div style={wrapStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: "12px", color: "#7C8A9A", marginBottom: "4px" }}>[{activeDomain}] session result</div>
          <div style={{ fontSize: "24px", fontWeight: 600, marginBottom: "8px" }}>
            {sessionCorrect}/{domainQuestions.length} ({pct}%)
          </div>
          <div style={{ fontSize: "13px", color: "#7C8A9A" }}>
            {pct >= 70
              ? "Domain solid in this sample — keep up spaced review."
              : "Reinforce this domain before the full mock exam — review the material pointed out in the explanations above."}
          </div>
        </div>
        <button
          onClick={() => setView("dashboard")}
          style={{
            background: "transparent",
            border: "1px solid #4FD1C5",
            color: "#4FD1C5",
            borderRadius: "6px",
            padding: "8px 16px",
            fontSize: "13px",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          back to dashboard
        </button>
      </div>
    );
  }

  return null;
}
