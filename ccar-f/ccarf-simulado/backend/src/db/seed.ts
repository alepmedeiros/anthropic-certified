import "dotenv/config";
import { db } from "./connection";

const DOMAINS = [
  { id: "D1", name: "Agentic Architecture & Orchestration", weight: 27 },
  { id: "D2", name: "Tool Design & MCP Integration", weight: 18 },
  { id: "D3", name: "Claude Code Configuration & Workflows", weight: 20 },
  { id: "D4", name: "Prompt Engineering & Structured Output", weight: 20 },
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
    correct: "b",
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
    correct: "b",
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
    correct: "b",
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
    correct: "b",
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
    correct: "a",
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
    correct: "b",
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
    correct: "b",
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
    correct: "a",
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
    correct: "b",
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
    correct: "b",
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
    correct: "b",
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
    correct: "b",
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
    correct: "b",
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
    correct: "a",
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
    correct: "a",
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
    correct: "a",
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
    correct: "c",
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
    correct: "b",
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
    correct: "c",
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
    correct: "b",
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
    correct: "a",
    explanation:
      "The guide explicitly calls out self-reported confidence as an unreliable signal for escalation — the model can be confidently wrong. The recommended fix is explicit escalation criteria with few-shot examples, not tuning a confidence threshold.",
    reinforce: "Review: Task Statement 5.2, escalation triggers vs. unreliable confidence/sentiment proxies.",
  },
];

const insertDomain = db.prepare(
  `INSERT INTO domains (id, name, weight) VALUES (@id, @name, @weight)
   ON CONFLICT(id) DO UPDATE SET name = excluded.name, weight = excluded.weight`
);

const insertQuestion = db.prepare(
  `INSERT INTO questions (id, domain_id, scenario, option_a, option_b, option_c, option_d, correct_option, explanation, reinforce)
   VALUES (@id, @domain_id, @scenario, @option_a, @option_b, @option_c, @option_d, @correct_option, @explanation, @reinforce)
   ON CONFLICT(id) DO UPDATE SET
     domain_id = excluded.domain_id,
     scenario = excluded.scenario,
     option_a = excluded.option_a,
     option_b = excluded.option_b,
     option_c = excluded.option_c,
     option_d = excluded.option_d,
     correct_option = excluded.correct_option,
     explanation = excluded.explanation,
     reinforce = excluded.reinforce`
);

const seed = db.transaction(() => {
  for (const d of DOMAINS) insertDomain.run(d);
  for (const q of QUESTIONS) {
    insertQuestion.run({
      id: q.id,
      domain_id: q.domain,
      scenario: q.scenario,
      option_a: q.options[0],
      option_b: q.options[1],
      option_c: q.options[2],
      option_d: q.options[3],
      correct_option: q.correct,
      explanation: q.explanation,
      reinforce: q.reinforce,
    });
  }
});

seed();
console.log(`Seeded ${DOMAINS.length} domains and ${QUESTIONS.length} questions.`);
