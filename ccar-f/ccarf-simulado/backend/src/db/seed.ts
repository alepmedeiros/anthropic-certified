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
  {
    id: "d1-6",
    domain: "D1",
    scenario:
      "In a multi-agent document-processing system, two subagents (an OCR agent and a formatting agent) begin communicating results to each other directly, bypassing the coordinator, to save a round trip. Debugging becomes difficult because the coordinator's logs no longer show what each subagent decided. What is the recommended architecture to fix this?",
    options: [
      "Let subagents communicate directly whenever it saves latency, and log only final outputs",
      "Route all inter-subagent communication through the coordinator, which manages error handling and information routing centrally",
      "Merge the two subagents into a single agent to eliminate the need for communication",
      "Give both subagents write access to a shared database instead of using tool calls",
    ],
    correct: "b",
    explanation:
      "Hub-and-spoke architecture routes all inter-subagent communication through the coordinator, preserving observability, consistent error handling, and controlled information flow — direct subagent-to-subagent communication defeats the purpose of the coordinator pattern.",
    reinforce: "Review: Task Statement 1.2, hub-and-spoke coordinator architecture.",
  },
  {
    id: "d1-7",
    domain: "D1",
    scenario:
      "A research coordinator always invokes all 4 of its subagents (web search, document analysis, code inspection, and financial data) for every query, even for queries that only need one or two of them. This wastes time and tokens on irrelevant subagent calls. What should the coordinator do instead?",
    options: [
      "Always run all subagents in parallel regardless of query, since parallel execution hides the extra latency",
      "Analyze the query's requirements and dynamically select which subagents are actually needed before delegating",
      "Randomly sample which subagents to invoke on each run to balance load",
      "Remove the subagents that are used least often over time",
    ],
    correct: "b",
    explanation:
      "The coordinator's role includes deciding which subagents to invoke based on query complexity and requirements — invoking every subagent unconditionally wastes resources and increases context bloat regardless of parallelism.",
    reinforce: "Review: Task Statement 1.2, dynamic subagent selection by the coordinator.",
  },
  {
    id: "d1-8",
    domain: "D1",
    scenario:
      "A coordinator needs to research three independent subtopics and currently spawns one subagent, waits for it to finish, then spawns the next, one at a time. This triples the wall-clock time compared to running them together. What change reduces latency without changing what each subagent does?",
    options: [
      "Emit all three Task tool calls within a single coordinator turn so the subagents run in parallel",
      "Increase max_tokens for the coordinator so it can think faster",
      "Combine the three subtopics into one prompt for a single subagent",
      "Switch the subagents to a smaller, faster model",
    ],
    correct: "a",
    explanation:
      "Independent subagent work should be parallelized by emitting multiple Task tool calls in a single coordinator response, rather than spawning them across separate sequential turns.",
    reinforce: "Review: Task Statement 1.3, parallel subagent spawning.",
  },
  {
    id: "d1-9",
    domain: "D1",
    scenario:
      "An agent handling account closures is supposed to confirm the user's identity via a verify_identity tool before calling close_account. The system prompt states this requirement clearly, but audits show the agent skips verification in 4% of cases under ambiguous phrasing. What is the correct fix?",
    options: [
      "Rewrite the system prompt to state the requirement even more forcefully, in bold",
      "Add a programmatic prerequisite that blocks close_account from executing until verify_identity has returned a successful result",
      "Ask the agent to double-check its own work before calling close_account",
      "Add a few-shot example showing verification happening first",
    ],
    correct: "b",
    explanation:
      "When a specific tool ordering is required for a business-critical action, only a programmatic enforcement mechanism (blocking the downstream call until the prerequisite completes) gives a deterministic guarantee — prompt-based instructions have a non-zero failure rate.",
    reinforce: "Review: Task Statement 1.4, programmatic enforcement vs. prompt-based guidance.",
  },
  {
    id: "d1-10",
    domain: "D1",
    type: "multi",
    scenario:
      "When a support agent escalates a case to a human, it currently just says 'this needs a human, please review the conversation.' Human agents report they have to re-read the entire transcript to figure out what's going on before they can help. Which two things should the structured escalation handoff include instead? (Select 2 responses)",
    options: [
      "The agent's self-reported confidence score for the case",
      "Customer/case identifying details (e.g., customer ID, order number)",
      "A full raw dump of the entire conversation transcript",
      "A root cause summary and recommended next action",
    ],
    correctOptions: ["b", "d"],
    explanation:
      "Structured handoff protocols for mid-process escalation should compile customer details, root cause analysis, and recommended actions — giving the human agent what they need without requiring them to reconstruct context from a raw transcript or rely on an unreliable confidence score.",
    reinforce: "Review: Task Statement 1.4, structured handoff summaries for escalation.",
  },
  {
    id: "d1-11",
    domain: "D1",
    scenario:
      "An agent pulls order data from three different backend systems through MCP tools. One returns timestamps as Unix epoch integers, another as ISO 8601 strings, and a third as a custom numeric status code. The agent frequently misinterprets these mixed formats when reasoning about order age. What is the best fix?",
    options: [
      "Add a system prompt note asking the model to be careful about date formats",
      "Implement a PostToolUse hook that normalizes all three formats into a consistent representation before the agent processes the results",
      "Remove two of the three backend integrations to reduce format variety",
      "Ask the model to convert formats itself using a text explanation each time",
    ],
    correct: "b",
    explanation:
      "PostToolUse hooks intercept tool results for transformation before the model processes them — this is the deterministic way to normalize heterogeneous data formats from different MCP tools, rather than relying on the model to handle inconsistent formats correctly every time.",
    reinforce: "Review: Task Statement 1.5, PostToolUse hooks for data normalization.",
  },
  {
    id: "d1-12",
    domain: "D1",
    scenario:
      "Company policy caps refunds an agent can issue autonomously at $500; anything above must go to a human. The system prompt states this limit, but the agent occasionally still calls process_refund with amounts above $500 when a customer is persistent. What is the recommended architectural control?",
    options: [
      "Increase the emphasis of the instruction in the system prompt",
      "Implement a tool call interception hook that blocks process_refund calls above $500 and redirects to human escalation",
      "Remove the process_refund tool entirely and require all refunds to be manual",
      "Lower the model's temperature to reduce variability",
    ],
    correct: "b",
    explanation:
      "A hook that intercepts outgoing tool calls to enforce a compliance rule (blocking refunds above a threshold and redirecting to escalation) provides a deterministic guarantee that prompt instructions alone cannot.",
    reinforce: "Review: Task Statement 1.5, tool call interception hooks for compliance.",
  },
  {
    id: "d1-13",
    domain: "D1",
    type: "multi",
    scenario:
      "A team is deciding how to structure two different Claude Code workflows: reviewing a pull request by checking each changed file against a fixed checklist, versus exploring an unfamiliar legacy codebase to plan a refactor, where what to look at next depends on what's discovered. Which two statements about task decomposition strategy are correct? (Select 2 responses)",
    options: [
      "Dynamic adaptive decomposition should always be used, since it is strictly more flexible than any fixed sequence",
      "Prompt chaining (fixed sequential steps) suits predictable, well-defined workflows like a checklist-based review",
      "Prompt chaining and dynamic decomposition are interchangeable, so the choice makes no practical difference",
      "Dynamic adaptive decomposition, generating subtasks based on what's discovered, suits open-ended investigation where the plan can't be fully specified upfront",
    ],
    correctOptions: ["b", "d"],
    explanation:
      "Prompt chaining fits predictable, multi-aspect reviews, while dynamic adaptive decomposition fits open-ended investigation. Treating one as universally superior, or as interchangeable with the other, ignores that the right choice depends on how predictable the workflow's structure is.",
    reinforce: "Review: Task Statement 1.6, prompt chaining vs. dynamic task decomposition.",
  },
  {
    id: "d1-14",
    domain: "D1",
    scenario:
      "A developer paused a long Claude Code investigation into a performance bug yesterday and resumes today. Overnight, another engineer refactored several of the files the agent had already analyzed. Should the developer resume the prior session, or start fresh?",
    options: [
      "Always resume the prior named session with --resume, since restarting loses all progress",
      "Resume the session, but explicitly inform the agent which specific files changed so it can re-analyze only those, rather than assuming its prior analysis is still valid",
      "Always start a completely new session with no reference to prior work, to avoid stale information",
      "Resume the session and instruct the agent to re-read the entire codebase from scratch to be safe",
    ],
    correct: "b",
    explanation:
      "Resuming a session is appropriate when prior context is mostly valid, but the agent must be informed about specific file changes for targeted re-analysis — assuming stale tool results are still accurate, or blindly re-exploring everything, both waste effort compared to a targeted update.",
    reinforce: "Review: Task Statement 1.7, session resumption and handling stale context.",
  },
  {
    id: "d2-5",
    domain: "D2",
    scenario:
      "Two MCP tools, analyze_content and analyze_document, have nearly identical one-line descriptions ('Analyzes content' and 'Analyzes a document'). The agent frequently calls the wrong one for web-page analysis tasks. Renaming isn't possible yet — what is the most effective immediate fix?",
    options: [
      "Expand both descriptions to explain input formats, example queries, and explicit boundaries distinguishing when to use each",
      "Remove one of the two tools so there's no ambiguity",
      "Lower the temperature so the model is more deterministic",
      "Add a disclaimer in the system prompt saying 'be careful which analyze tool you pick'",
    ],
    correct: "a",
    explanation:
      "Tool descriptions are the primary mechanism LLMs use for tool selection. Minimal, near-identical descriptions cause misrouting between similar tools — the fix is expanding descriptions with input formats, examples, and explicit boundaries, not vague prompt disclaimers.",
    reinforce: "Review: Task Statement 2.1, differentiating tool descriptions to prevent misrouting.",
  },
  {
    id: "d2-6",
    domain: "D2",
    scenario:
      "A single support agent has been given access to 18 tools spanning billing, shipping, account management, and internal analytics, so it can 'handle anything.' Tool selection accuracy has dropped noticeably since the tool count grew from 5. What is the recommended fix?",
    options: [
      "Add more few-shot examples covering all 18 tools",
      "Restrict each agent's tool access to only what its role needs, splitting broad responsibility across more narrowly-scoped agents if necessary",
      "Increase the context window so the agent can consider all 18 tools more carefully",
      "Sort the tools alphabetically in the system prompt so they're easier to scan",
    ],
    correct: "b",
    explanation:
      "Giving an agent access to too many tools increases decision complexity and degrades selection reliability. The fix is scoping each agent's tool access to its role, not compensating with more examples or context — that's a decision-complexity problem, not an information problem.",
    reinforce: "Review: Task Statement 2.3, scoped tool access and distribution across agents.",
  },
  {
    id: "d2-7",
    domain: "D2",
    type: "multi",
    scenario:
      "A developer wants to experiment with a new MCP server for local database inspection without affecting teammates, while the team already shares a GitHub MCP server configured with an environment-variable-based token. Which two statements about MCP server configuration scoping are correct? (Select 2 responses)",
    options: [
      "The shared GitHub server belongs in project-level .mcp.json, which is versioned and shared with the team",
      "Personal/experimental servers must also be placed in project-level .mcp.json so they're available to everyone",
      "Environment variable expansion (e.g., ${GITHUB_TOKEN}) allows crediting servers in .mcp.json without committing secrets",
      "All MCP servers in a project must use identical scoping — mixing project and personal scopes is not supported",
    ],
    correctOptions: ["a", "c"],
    explanation:
      "Project-scoped .mcp.json is for shared, versioned team tooling and supports environment-variable credential expansion. Personal/experimental servers belong in the user-scoped ~/.claude.json instead — projects can and do mix both scopes simultaneously.",
    reinforce: "Review: Task Statement 2.4, MCP server scoping (project vs. personal).",
  },
  {
    id: "d2-8",
    domain: "D2",
    scenario:
      "An agent working against a large issue tracker repeatedly calls a search_issues tool multiple times per task just to understand what categories and statuses exist before it can act. What MCP feature would reduce this exploratory overhead?",
    options: [
      "Exposing an MCP resource with a catalog of issue categories and statuses that the agent can reference directly, without repeated exploratory tool calls",
      "Increasing the rate limit on search_issues so more calls are allowed",
      "Caching every previous search_issues response client-side",
      "Removing search_issues and requiring manual issue lookup by the user",
    ],
    correct: "a",
    explanation:
      "MCP resources exist to expose content catalogs (like documentation hierarchies or, here, issue categories/statuses) so agents gain visibility into available data without needing repeated exploratory tool calls.",
    reinforce: "Review: Task Statement 2.4, MCP resources for reducing exploratory tool calls.",
  },
  {
    id: "d2-9",
    domain: "D2",
    scenario:
      "While using Claude Code, an agent needs to (1) find every file whose name matches **/*.test.tsx, and (2) modify a specific function body inside one of those files, but the anchor text it tries to Edit appears three times in the file with no unique surrounding context. What is the correct tool usage in each case?",
    options: [
      "Use Grep for both tasks, since it can search names and content alike",
      "Use Glob to find the matching files by name pattern; when Edit fails due to non-unique text, fall back to Read the full file followed by Write with the modified content",
      "Use Bash with a shell find command for both tasks instead of built-in tools",
      "Use Read on every file in the repository to locate matches, then use Edit repeatedly until it succeeds",
    ],
    correct: "b",
    explanation:
      "Glob is for file path pattern matching (like **/*.test.tsx), not Grep (which searches file contents). When Edit cannot find a unique anchor, the recommended fallback is Read the full file plus Write, rather than repeatedly guessing at more specific anchor text.",
    reinforce: "Review: Task Statement 2.5, selecting Glob vs. Grep and the Edit-to-Read+Write fallback.",
  },
  {
    id: "d3-6",
    domain: "D3",
    scenario:
      "A team lead wants a /deploy-checklist slash command available to every engineer automatically the moment they clone the repository, with no manual setup per developer. Where should this command be defined?",
    options: [
      "In ~/.claude/commands/ on the team lead's machine, then ask everyone to copy it manually",
      "In .claude/commands/ inside the project repository, so it's version-controlled and shared automatically",
      "In the project's README.md as documented instructions",
      "In an environment variable set in each developer's shell profile",
    ],
    correct: "b",
    explanation:
      "Project-scoped commands in .claude/commands/ are version-controlled and automatically available to every developer who clones or pulls the repo — personal commands in ~/.claude/commands/ require manual setup per machine and aren't shared.",
    reinforce: "Review: Task Statement 3.2, project-scoped vs. user-scoped slash commands.",
  },
  {
    id: "d3-7",
    domain: "D3",
    scenario:
      "A custom skill performs a deep codebase analysis that produces thousands of tokens of exploratory output before returning a short summary. Running it currently pollutes the main conversation with all that intermediate output. What frontmatter option addresses this?",
    options: [
      "allowed-tools, restricted to just Read",
      "argument-hint, so the skill prompts for parameters",
      "context: fork, so the skill runs in an isolated sub-agent context and only its result returns to the main conversation",
      "There is no way to prevent this — verbose skills always pollute the main context",
    ],
    correct: "c",
    explanation:
      "The context: fork frontmatter option runs a skill in an isolated sub-agent context, preventing its verbose intermediate output from polluting the main conversation — only the final result comes back.",
    reinforce: "Review: Task Statement 3.2, context: fork for skill isolation.",
  },
  {
    id: "d3-8",
    domain: "D3",
    scenario:
      "Two tasks land in the same afternoon: (1) add a null check to one function where a stack trace clearly shows the failure point, and (2) migrate an internal library used across 50+ files to a new major version with breaking API changes. How should each be approached?",
    options: [
      "Use plan mode for both, since it's always safer",
      "Use direct execution for both, since Claude Code can figure out the right approach as it goes either way",
      "Use direct execution for the null-check fix (simple, well-scoped); use plan mode for the library migration (large-scale, architectural, many files)",
      "Use plan mode for the null-check fix and direct execution for the migration, to save time on the bigger task",
    ],
    correct: "c",
    explanation:
      "Direct execution suits simple, well-scoped changes with a clear fix (the null check). Plan mode suits large-scale changes with architectural implications and many affected files (the library migration) — it lets you explore and design before committing, avoiding costly rework.",
    reinforce: "Review: Task Statement 3.4, choosing plan mode vs. direct execution by task complexity.",
  },
  {
    id: "d3-9",
    domain: "D3",
    type: "multi",
    scenario:
      "A team asks Claude Code to 'reformat these log entries into a cleaner structure' and gets inconsistent results across different log files — sometimes fields are renamed, sometimes reordered differently. Which two techniques would most effectively fix this inconsistency? (Select 2 responses)",
    options: [
      "Provide 2-3 concrete before/after examples of the exact transformation expected",
      "Write a test suite covering the expected structure first, then iterate by sharing test failures with the model",
      "Repeat the same vague instruction more emphatically in the prompt",
      "Switch to a larger model while keeping the original vague instruction unchanged",
    ],
    correctOptions: ["a", "b"],
    explanation:
      "When prose descriptions are interpreted inconsistently, concrete input/output examples and test-driven iteration (sharing concrete failures) are the effective fixes — repeating the same vague instruction or changing models without changing the instruction don't address the underlying ambiguity.",
    reinforce: "Review: Task Statement 3.5, using concrete examples for iterative refinement.",
  },
  {
    id: "d3-10",
    domain: "D3",
    scenario:
      "In a CI pipeline, the same Claude Code session that generated a bug fix is then asked to review its own diff before opening a pull request. The review consistently approves the change even when a fresh reviewer later finds real issues. What's the most effective fix?",
    options: [
      "Ask the same session to review more carefully, with a stricter prompt",
      "Run the review in an independent Claude Code instance that starts without the generating session's reasoning context",
      "Skip automated review entirely and rely only on human reviewers",
      "Have the same session re-generate the fix from scratch and compare the two versions",
    ],
    correct: "b",
    explanation:
      "A model that generated code retains reasoning context from that generation, making it less likely to question its own decisions in the same session. An independent review instance, without that prior context, is more effective at catching subtle issues.",
    reinforce: "Review: Task Statement 3.6, session isolation for effective code review in CI/CD.",
  },
  {
    id: "d4-5",
    domain: "D4",
    scenario:
      "A code review prompt instructs Claude to 'be conservative and only report high-confidence findings' to reduce false positives, but the false positive rate doesn't improve. What change is more likely to actually reduce false positives?",
    options: [
      "Add the word 'please' and rephrase the instruction to sound more polite",
      "Replace the vague conservatism instruction with explicit categorical criteria defining exactly which issues to report (e.g., bugs and security) vs. skip (e.g., minor style, local patterns)",
      "Lower the temperature to 0 so results are more deterministic",
      "Remove the false-positive-prone categories from the report entirely with no replacement guidance",
    ],
    correct: "b",
    explanation:
      "General instructions like 'be conservative' fail to improve precision compared to specific, categorical criteria that define which issues to report versus skip. Vague confidence-based filtering doesn't give the model a clear boundary to apply.",
    reinforce: "Review: Task Statement 4.1, explicit criteria vs. vague instructions for precision.",
  },
  {
    id: "d4-6",
    domain: "D4",
    scenario:
      "An invoice extraction schema marks 'purchase_order_number' as a required string field. Many source invoices don't include a PO number at all, and the model has started inventing plausible-looking values to satisfy the schema. What schema change fixes this?",
    options: [
      "Make the field optional/nullable, so the model can return null when the information isn't present in the source document",
      "Keep the field required but add a note in the prompt asking the model not to make things up",
      "Remove the field from the schema entirely so it's never extracted",
      "Require the model to explain its reasoning for the field in a separate free-text field",
    ],
    correct: "a",
    explanation:
      "Fields that may legitimately be absent from source documents should be designed as optional/nullable — this prevents the model from fabricating values just to satisfy a required-field constraint.",
    reinforce: "Review: Task Statement 4.3, nullable schema fields to prevent fabrication.",
  },
  {
    id: "d4-7",
    domain: "D4",
    scenario:
      "A document classification schema has a fixed enum for 'document_type' (invoice, receipt, contract), but roughly 8% of real documents don't fit any of those categories, forcing the model to mis-classify them into the closest wrong bucket. What schema pattern addresses this?",
    options: [
      "Add an 'other' enum value paired with a free-text detail field describing what the document actually is",
      "Expand the enum to include every possible document type the team can think of, no matter how rare",
      "Remove the enum constraint entirely and accept any free-text string",
      "Force the model to always pick the closest of the three existing categories, since consistency matters more than accuracy",
    ],
    correct: "a",
    explanation:
      "An 'other' + detail-string pattern keeps the enum extensible: rare or unanticipated categories get captured accurately via the detail field instead of being forced into the closest wrong bucket or requiring the enum to enumerate every possibility upfront.",
    reinforce: "Review: Task Statement 4.3, enum design with 'other' + detail fields.",
  },
  {
    id: "d4-8",
    domain: "D4",
    type: "multi",
    scenario:
      "An extraction pipeline validates output against a schema and retries on failure. For some documents, retries eventually succeed after the model fixes formatting. For others, retries fail repeatedly no matter how many attempts, because a required field simply isn't present anywhere in the source document. Which two statements correctly describe how to handle validation-retry loops? (Select 2 responses)",
    options: [
      "All validation failures should be retried the same fixed number of times regardless of cause",
      "For format/structural failures, retrying with the specific validation error appended to the prompt can guide the model to a correct fix",
      "Retrying with a longer prompt always eventually surfaces missing information, even if it isn't in the source",
      "When required information is genuinely absent from the source document, retrying will not succeed no matter how many attempts are made",
    ],
    correctOptions: ["b", "d"],
    explanation:
      "Retry-with-error-feedback is effective for format/structural errors, where the specific error can guide correction. But retries cannot manufacture information that simply isn't present in the source document — the pipeline should recognize this failure mode and stop retrying rather than treating all failures identically.",
    reinforce: "Review: Task Statement 4.4, effective vs. ineffective use of retry loops.",
  },
  {
    id: "d4-9",
    domain: "D4",
    scenario:
      "A nightly batch job submits 500 documents to the Message Batches API. When results come back, 12 requests failed — some because a document exceeded the model's context limit, others due to transient service errors. What is the correct way to handle this?",
    options: [
      "Resubmit the entire batch of 500 documents from scratch to be safe",
      "Ignore the 12 failures since they're a small percentage of the batch",
      "Use the custom_id on each failed request to identify exactly which documents failed, then resubmit only those — chunking any that were oversized — rather than reprocessing everything",
      "Switch the entire batch job to the synchronous API going forward to avoid failures",
    ],
    correct: "c",
    explanation:
      "custom_id fields correlate batch request/response pairs, letting you identify exactly which documents failed and why. The correct fix is targeted resubmission of only the failed documents (with document-specific modifications like chunking), not reprocessing the whole batch or abandoning batch processing.",
    reinforce: "Review: Task Statement 4.5, handling batch failures via custom_id.",
  },
  {
    id: "d4-10",
    domain: "D4",
    type: "multi",
    scenario:
      "A code review agent is asked to review a pull request touching 40 files in a single pass. It catches obvious issues but misses several cross-file inconsistencies (e.g., a renamed function not updated in one caller) and gives noticeably shallower feedback on files near the middle of the diff. Which two reasons explain why splitting the review into per-file passes plus a separate cross-file integration pass helps? (Select 2 responses)",
    options: [
      "It avoids attention dilution across a large diff, giving each file focused analysis",
      "It reduces the total token usage of the review to zero",
      "It adds a dedicated pass specifically targeting cross-file consistency issues that a single monolithic pass tends to miss",
      "It eliminates the need for any human review of the pull request afterward",
    ],
    correctOptions: ["a", "c"],
    explanation:
      "Splitting large reviews into per-file local passes plus a cross-file integration pass avoids attention dilution and specifically targets cross-file issues — it doesn't eliminate token usage or the value of human review, it improves the thoroughness of the automated pass.",
    reinforce: "Review: Task Statement 4.6, multi-pass review architecture for large diffs.",
  },
  {
    id: "d5-4",
    domain: "D5",
    type: "multi",
    scenario:
      "In a multi-agent research system, when a subagent's web search fails, it currently returns just the string 'search unavailable.' The coordinator has no way to tell whether this means 'try again later' or 'this topic has no results,' so it always just gives up on that subtopic. Which two pieces of information should the subagent's structured error response include so the coordinator can decide how to recover? (Select 2 responses)",
    options: [
      "The failure type (e.g., timeout vs. no-results) and what was attempted",
      "An automatic decision to terminate the entire research task",
      "Any partial results already gathered, plus possible alternative approaches",
      "A generic apology message with no other detail",
    ],
    correctOptions: ["a", "c"],
    explanation:
      "Structured error context — failure type, what was attempted, partial results, and alternatives — enables the coordinator to make an intelligent recovery decision. Automatically terminating the whole workflow or returning a generic message are exactly the anti-patterns this design avoids.",
    reinforce: "Review: Task Statement 5.3, structured error propagation across multi-agent systems.",
  },
  {
    id: "d5-5",
    domain: "D5",
    scenario:
      "During an extended Claude Code session exploring a large legacy codebase, the agent starts giving inconsistent answers about class structures it discovered earlier, and begins referencing 'typical patterns' instead of the specific classes it actually found. What technique most directly addresses this context degradation?",
    options: [
      "Have the agent maintain a scratchpad file recording key findings as it explores, and reference that file for subsequent questions",
      "Restart the session from scratch every 10 messages to keep context fresh",
      "Ask the agent to try harder to remember what it found earlier",
      "Increase the model's temperature so answers vary less predictably",
    ],
    correct: "a",
    explanation:
      "Scratchpad files that persist key findings across context boundaries directly counteract the degradation that happens in extended sessions — the agent can reference concrete recorded findings rather than drifting into generic 'typical pattern' answers as earlier details fade from effective attention.",
    reinforce: "Review: Task Statement 5.4, scratchpad files for context management in long exploration sessions.",
  },
  {
    id: "d5-6",
    domain: "D5",
    scenario:
      "An extraction system reports 97% overall accuracy, so the team stops reviewing its output. Months later, they discover one specific field on one document type has been wrong 40% of the time the whole time, hidden inside the aggregate number. What practice would have caught this earlier?",
    options: [
      "Trusting the aggregate accuracy number, since 97% is well above typical thresholds",
      "Having the model output field-level confidence scores, calibrated against a labeled validation set, and analyzing accuracy by document type and field before reducing human review",
      "Reviewing a random 1% sample of all output once per year",
      "Increasing the overall accuracy target to 99% instead of 97%",
    ],
    correct: "b",
    explanation:
      "Aggregate accuracy metrics can mask poor performance on specific document types or fields. Field-level confidence scores calibrated against labeled validation data, combined with accuracy analysis by document type/field, catches these hidden failure pockets before over-trusting an aggregate number.",
    reinforce: "Review: Task Statement 5.5, confidence calibration and validating accuracy by segment.",
  },
  {
    id: "d5-7",
    domain: "D5",
    scenario:
      "A multi-agent research report cites two credible sources that give different figures for the same statistic. The synthesis subagent currently picks whichever number appeared in its context first and presents it as the single answer. What should it do instead?",
    options: [
      "Average the two conflicting numbers together and present that as the answer",
      "Annotate the conflict explicitly, presenting both values with their source attribution, rather than arbitrarily selecting one",
      "Discard both numbers and state that no data is available",
      "Always prefer whichever source has the more recent publication date, without noting the discrepancy",
    ],
    correct: "b",
    explanation:
      "When credible sources conflict, the correct approach is annotating the conflict with source attribution for both values, letting the reader (or downstream decision-maker) see the discrepancy — arbitrarily picking or averaging one value hides real uncertainty in the underlying data.",
    reinforce: "Review: Task Statement 5.6, handling conflicting source data in multi-source synthesis.",
  },
];

const insertDomain = db.prepare(
  `INSERT INTO domains (id, name, weight) VALUES (@id, @name, @weight)
   ON CONFLICT(id) DO UPDATE SET name = excluded.name, weight = excluded.weight`
);

const insertQuestion = db.prepare(
  `INSERT INTO questions (id, domain_id, scenario, option_a, option_b, option_c, option_d, correct_option, question_type, correct_options, select_count, explanation, reinforce)
   VALUES (@id, @domain_id, @scenario, @option_a, @option_b, @option_c, @option_d, @correct_option, @question_type, @correct_options, @select_count, @explanation, @reinforce)
   ON CONFLICT(id) DO UPDATE SET
     domain_id = excluded.domain_id,
     scenario = excluded.scenario,
     option_a = excluded.option_a,
     option_b = excluded.option_b,
     option_c = excluded.option_c,
     option_d = excluded.option_d,
     correct_option = excluded.correct_option,
     question_type = excluded.question_type,
     correct_options = excluded.correct_options,
     select_count = excluded.select_count,
     explanation = excluded.explanation,
     reinforce = excluded.reinforce`
);

const seed = db.transaction(() => {
  for (const d of DOMAINS) insertDomain.run(d);
  for (const q of QUESTIONS) {
    const isMulti = q.type === "multi";
    insertQuestion.run({
      id: q.id,
      domain_id: q.domain,
      scenario: q.scenario,
      option_a: q.options[0],
      option_b: q.options[1],
      option_c: q.options[2],
      option_d: q.options[3],
      // Multi-response questions still populate correct_option with the first correct
      // letter as a NOT NULL placeholder — grading for 'multi' always uses correct_options.
      correct_option: isMulti ? q.correctOptions![0] : q.correct,
      question_type: q.type ?? "single",
      correct_options: isMulti ? JSON.stringify(q.correctOptions) : null,
      select_count: isMulti ? q.correctOptions!.length : 1,
      explanation: q.explanation,
      reinforce: q.reinforce,
    });
  }
});

seed();
console.log(`Seeded ${DOMAINS.length} domains and ${QUESTIONS.length} questions.`);
