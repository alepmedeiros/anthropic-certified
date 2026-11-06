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
    id: "d1-15",
    domain: "D1",
    scenario:
      "An agent calls a lookup_inventory tool and receives a result. On the next turn, before deciding what to do, the agent re-calls lookup_inventory with the same arguments because it 'forgot' the result. Investigation shows the tool's output was discarded after being displayed to the user, and never added back into the conversation sent to the model. What is the fix?",
    options: [
      "Append the tool result to the conversation history so it's included in the next request to Claude",
      "Increase max_tokens so the model can hold more in its 'working memory'",
      "Ask the model to summarize the tool result immediately in its own words",
      "Switch to a model with a longer context window",
    ],
    correct: "a",
    explanation:
      "Tool results must be appended to the conversation history between iterations of the agentic loop — this is what lets the model reason about them on the next turn. If a result is displayed to the user but never sent back to the model, the model has no way to know it happened.",
    reinforce: "Review: Task Statement 1.1, appending tool results to conversation history between loop iterations.",
  },
  {
    id: "d1-16",
    domain: "D1",
    scenario:
      "Two designs are proposed for a support agent: Design A hard-codes a decision tree ('if the message contains refund, call process_refund; else if it contains shipping, call track_shipment; ...') that runs before Claude sees the message. Design B gives Claude the tools directly and lets it decide, per stop_reason, which tool (if any) to call based on the full conversation. Which design follows the agentic loop pattern the exam guide describes?",
    options: [
      "Design A, because deterministic keyword routing is more predictable",
      "Design B, because the model reasons about which tool to call next based on context, rather than following a pre-configured sequence",
      "Both are equivalent implementations of the same pattern",
      "Neither — a true agentic loop requires no tools at all",
    ],
    correct: "b",
    explanation:
      "The agentic loop lifecycle is built around model-driven decision-making: Claude inspects context and decides which tool (if any) to call, rather than executing a pre-configured decision tree or fixed tool sequence determined before the model sees the request.",
    reinforce: "Review: Task Statement 1.1, model-driven decision-making vs. pre-configured decision trees.",
    scenarioTag: "customer_support",
  },
  {
    id: "d1-17",
    domain: "D1",
    scenario:
      "An engineer implements loop termination by scanning the assistant's text output for phrases like 'I'm done' or 'task complete,' and stopping the loop when one is found. In testing, the agent sometimes says something resembling those phrases mid-explanation, terminating the loop prematurely. What is the correct fix?",
    options: [
      "Add more phrases to the list of completion signals to catch edge cases",
      "Replace text-parsing entirely with a check on the response's stop_reason field",
      "Ask the model to only use the exact phrase 'TASK COMPLETE' in all caps",
      "Increase the temperature so the model is more consistent about phrasing",
    ],
    correct: "b",
    explanation:
      "Parsing assistant text content to decide when a loop should terminate is an explicit anti-pattern — natural language is inherently ambiguous. The reliable signal is the structured stop_reason field ('end_turn' means done), not scanning generated text for keywords.",
    reinforce: "Review: Task Statement 1.1, avoiding natural-language-parsing as a loop termination signal.",
  },
  {
    id: "d1-18",
    domain: "D1",
    scenario:
      "A team sets a hard cap of exactly 3 tool-call iterations for their research agent, assuming most tasks finish by then, and treats hitting the cap as the normal way the loop ends. Complex queries that legitimately need a 5th or 6th tool call get cut off mid-task with incomplete results. What is the architectural issue?",
    options: [
      "The cap should simply be raised to a bigger fixed number like 20",
      "A fixed iteration cap is being used as the primary stopping mechanism instead of stop_reason; a cap should only be a safety backstop, not the expected way most tasks end",
      "Iteration caps should never be used under any circumstances",
      "The agent should be given fewer tools so it needs fewer iterations",
    ],
    correct: "b",
    explanation:
      "A fixed iteration cap as the primary stopping mechanism is an explicit anti-pattern — the loop should normally terminate based on stop_reason == 'end_turn'. A cap is appropriate only as a safety backstop against runaway loops, not as the expected completion signal for legitimate multi-step tasks.",
    reinforce: "Review: Task Statement 1.1, iteration caps as a backstop, not the primary stopping mechanism.",
  },
  {
    id: "d1-19",
    domain: "D1",
    scenario:
      "During an agentic loop, a tool call fails and returns an error (not a successful result). The stop_reason on that response is still 'tool_use' because the model requested other tool calls too. Should the loop continue, and what should happen to the error?",
    options: [
      "The loop should terminate immediately, since a tool failed",
      "The error result should be appended to the conversation like any other tool result, and the loop continues, letting the model reason about the failure on its next turn",
      "The error should be hidden from the model so it doesn't get confused",
      "The whole conversation should restart from the beginning",
    ],
    correct: "b",
    explanation:
      "stop_reason 'tool_use' means the loop continues regardless of whether the underlying tool call succeeded or failed — the result (success or error) is appended to the conversation history so the model can reason about it and decide how to proceed, such as retrying or informing the user.",
    reinforce: "Review: Task Statement 1.1, loop continuation and appending results (including errors) to context.",
  },
  {
    id: "d1-20",
    domain: "D1",
    type: "multi",
    scenario:
      "A team reviewing their agentic loop implementation wants to identify anti-patterns to remove. Which two of the following are explicit anti-patterns for agentic loop control flow? (Select 2 responses)",
    options: [
      "Checking the response's stop_reason field to decide whether to continue",
      "Parsing the assistant's natural-language text content as the primary way to detect task completion",
      "Appending tool results to the conversation history between iterations",
      "Using a fixed iteration cap as the primary mechanism for deciding when the loop ends",
    ],
    correctOptions: ["b", "d"],
    explanation:
      "Parsing free text for completion signals and relying on a fixed iteration count as the primary stop mechanism are both explicit anti-patterns. Checking stop_reason and appending tool results to context are the correct, recommended practices.",
    reinforce: "Review: Task Statement 1.1, agentic loop anti-patterns.",
  },
  {
    id: "d1-21",
    domain: "D1",
    type: "multi",
    scenario:
      "Which two practices correctly describe how an agentic loop built with the Claude Agent SDK should be implemented? (Select 2 responses)",
    options: [
      "Continue the loop when stop_reason is 'tool_use', and terminate when it is 'end_turn'",
      "Let Claude decide which tool to call next based on the current conversation context, rather than following a pre-scripted tool sequence",
      "Determine loop continuation primarily by scanning the assistant's reply for phrases suggesting it has finished",
      "Cap the loop at a small fixed number of iterations and treat hitting that cap as the normal way most tasks complete",
    ],
    correctOptions: ["a", "b"],
    explanation:
      "Correct agentic loop control checks stop_reason to decide whether to continue, and relies on the model's own reasoning to select tools dynamically — rather than parsing free text or leaning on a fixed iteration cap as the primary termination signal.",
    reinforce: "Review: Task Statement 1.1, correct agentic loop implementation practices.",
  },
  {
    id: "d1-22",
    domain: "D1",
    scenario:
      "You're asked to 'add comprehensive tests to a legacy codebase' with no existing test coverage and no documentation of which modules are riskiest. What decomposition approach does the exam guide recommend for this kind of open-ended task?",
    options: [
      "Write a single exhaustive prompt instructing Claude to add tests to every file in one pass",
      "First map the codebase's structure, identify high-impact/high-risk areas, then create a prioritized plan that adapts as dependencies are discovered along the way",
      "Alphabetize all files and add tests to them in that fixed order",
      "Skip planning and start writing tests for whichever file is opened first",
    ],
    correct: "b",
    explanation:
      "For open-ended tasks like adding comprehensive test coverage to an undocumented legacy codebase, the recommended approach is to first map structure and identify high-impact areas, then build a prioritized plan that adapts as dependencies are discovered — a single fixed-order pass or an unplanned start doesn't account for what can only be learned by exploring.",
    reinforce: "Review: Task Statement 1.6, decomposing open-ended tasks via adaptive, discovery-driven planning.",
    scenarioTag: "developer_productivity",
  },
  {
    id: "d1-23",
    domain: "D1",
    scenario:
      "A team wants Claude Code to review a pull request that touches both individual file logic and cross-cutting concerns (like a shared interface used across many files). They decide to break the review into a fixed sequence: first a pass analyzing each changed file individually, then a second pass specifically checking cross-file consistency. What kind of decomposition strategy is this?",
    options: [
      "Dynamic adaptive decomposition, since the plan changes based on findings",
      "Prompt chaining — a fixed sequence of predictable steps suited to a well-defined, predictable review structure",
      "This isn't a form of task decomposition at all, just a single prompt",
      "An anti-pattern, since reviews should always be done in one single pass",
    ],
    correct: "b",
    explanation:
      "A fixed sequence of steps known in advance (a per-file pass, then a cross-file integration pass) is prompt chaining — well suited to predictable, well-defined multi-aspect reviews, as opposed to dynamic adaptive decomposition, which is for open-ended work where the next step depends on what's found.",
    reinforce: "Review: Task Statement 1.6, prompt chaining for predictable multi-aspect reviews.",
    scenarioTag: "code_generation",
  },
  {
    id: "d1-24",
    domain: "D1",
    scenario:
      "A team writes a fixed 5-step prompt chain for Claude Code to 'investigate why the checkout service is slow': (1) check logs, (2) check database queries, (3) check network calls, (4) check caching, (5) write a report. In practice, step 1 reveals the issue is entirely in a background job unrelated to checkout, but the chain forces steps 2-4 anyway before allowing a report. What is the problem with this design?",
    options: [
      "Nothing — following the fixed steps in order ensures thoroughness",
      "A fixed prompt chain was used for an open-ended investigation task, where the right next step should depend on what's discovered — forcing predetermined steps wastes effort once the actual cause is already found",
      "The team should have used more steps in the chain to be extra thorough",
      "The problem is unrelated to task decomposition — it's a tool access issue",
    ],
    correct: "b",
    explanation:
      "Open-ended investigation, where what to look at next depends on findings, calls for dynamic adaptive decomposition rather than a fixed prompt chain. Forcing predetermined steps regardless of what's discovered wastes effort — exactly the failure mode this scenario shows.",
    reinforce: "Review: Task Statement 1.6, dynamic decomposition for open-ended investigation vs. rigid prompt chains.",
    scenarioTag: "developer_productivity",
  },
  {
    id: "d1-25",
    domain: "D1",
    scenario:
      "A team builds an elaborate dynamic decomposition system — Claude generates a fresh investigation plan from scratch at each step — for a task that is actually the same 4 well-defined steps every time (lint, run unit tests, run integration tests, generate a coverage report). What would be a more appropriate, simpler approach?",
    options: [
      "Keep the dynamic system, since more flexibility is always better regardless of the task",
      "Use prompt chaining instead — a fixed sequence fits this predictable, well-defined workflow, and avoids the overhead of regenerating a plan every time",
      "Remove all structure and let Claude decide everything with no guidance at all",
      "Run all 4 steps in parallel to save time regardless of dependencies between them",
    ],
    correct: "b",
    explanation:
      "When a workflow's steps are predictable and well-defined, prompt chaining (a fixed sequence) is the appropriate, simpler choice — building a dynamic decomposition system for a task that doesn't need adaptive planning adds unnecessary overhead without benefit.",
    reinforce: "Review: Task Statement 1.6, matching decomposition strategy to workflow predictability.",
    scenarioTag: "cicd",
  },
  {
    id: "d1-26",
    domain: "D1",
    scenario:
      "A database migration script task starts as a predictable, prompt-chained sequence (read schema, generate migration, run migration, verify). Partway through, the verification step reveals unexpected data inconsistencies that require investigating several unrelated tables before the migration can safely proceed. What is the appropriate response?",
    options: [
      "Abandon the task entirely, since the original plan no longer applies",
      "Rigidly continue the original fixed chain, since deviating from the plan is risky",
      "Adapt: switch to dynamically investigating the newly discovered data inconsistencies before resuming the migration, since the situation is no longer fully predictable",
      "Restart the entire migration script from scratch with no changes to the approach",
    ],
    correct: "c",
    explanation:
      "When a predictable, chained task encounters genuinely unexpected findings, the right response is to adapt — dynamically investigating the new information — rather than rigidly following the original plan or abandoning the task outright. Decomposition strategy should match what the situation actually calls for, even mid-task.",
    reinforce: "Review: Task Statement 1.6, adapting decomposition strategy when a predictable task surfaces unexpected complexity.",
  },
  {
    id: "d1-27",
    domain: "D1",
    type: "multi",
    scenario:
      "Which two statements correctly describe prompt chaining as a task decomposition strategy? (Select 2 responses)",
    options: [
      "It works best for well-defined, predictable workflows where the steps are known in advance",
      "It generates new subtasks dynamically based on what is discovered at each step",
      "A code review split into per-file passes plus a final cross-file integration pass is a typical example",
      "It is always the correct choice regardless of how much the workflow's structure can be predicted upfront",
    ],
    correctOptions: ["a", "c"],
    explanation:
      "Prompt chaining is a fixed sequence of steps, well suited to predictable, well-defined workflows — the per-file-plus-integration-pass code review is the guide's own example of this pattern. Generating subtasks dynamically based on discoveries describes adaptive decomposition instead, and no single strategy is always correct regardless of context.",
    reinforce: "Review: Task Statement 1.6, characteristics of prompt chaining.",
  },
  {
    id: "d1-28",
    domain: "D1",
    type: "multi",
    scenario:
      "Which two statements correctly describe dynamic adaptive task decomposition? (Select 2 responses)",
    options: [
      "Subtasks are generated based on what is discovered during the investigation, rather than fixed in advance",
      "It suits open-ended tasks, like exploring an unfamiliar codebase, where the next useful step depends on findings",
      "It should replace prompt chaining for every workflow, including short, fully predictable ones",
      "The full sequence of steps is fixed before the task begins and never changes",
    ],
    correctOptions: ["a", "b"],
    explanation:
      "Dynamic adaptive decomposition generates subtasks based on discoveries, making it suited to open-ended investigation. It shouldn't replace prompt chaining universally — predictable workflows are better served by a fixed sequence — and having a fully fixed, unchanging sequence describes prompt chaining, not this strategy.",
    reinforce: "Review: Task Statement 1.6, characteristics of dynamic adaptive decomposition.",
  },
  {
    id: "d1-29",
    domain: "D1",
    scenario:
      "Two engineers want to compare two different refactoring strategies for the same module, starting from the same completed codebase analysis, without redoing that analysis twice or having their explorations interfere with each other. What Claude Agent SDK session feature fits this need?",
    options: [
      "--resume with the same session name for both engineers",
      "fork_session, to create independent branches from the shared analysis baseline so each strategy can be explored separately",
      "Starting two entirely separate sessions from scratch, each re-analyzing the codebase independently",
      "Running both strategies in the same session, one after the other",
    ],
    correct: "b",
    explanation:
      "fork_session is designed exactly for this: creating independent branches from a shared analysis baseline so divergent approaches can be explored separately, without redoing the shared analysis or having the explorations interfere with each other.",
    reinforce: "Review: Task Statement 1.7, fork_session for exploring divergent approaches from a shared baseline.",
    scenarioTag: "developer_productivity",
  },
  {
    id: "d1-30",
    domain: "D1",
    scenario:
      "A developer started an investigation into a flaky test suite yesterday, gave the session a name, and wants to continue exactly that investigation today without starting over or mixing it up with other ongoing work. What is the correct mechanism?",
    options: [
      "Start a brand new session and paste in yesterday's chat log manually",
      "Use --resume <session-name> to continue that specific named session",
      "Ask a coworker to summarize what was discussed yesterday from memory",
      "There is no way to continue a previous Claude Code session",
    ],
    correct: "b",
    explanation:
      "Named session resumption via --resume <session-name> is the mechanism for continuing a specific prior conversation, keeping it distinct from other ongoing work rather than requiring a manual transcript replay or relying on someone's memory.",
    reinforce: "Review: Task Statement 1.7, named session resumption with --resume.",
    scenarioTag: "developer_productivity",
  },
  {
    id: "d1-31",
    domain: "D1",
    scenario:
      "A Claude Code session analyzed a codebase's dependency graph two weeks ago. Since then, a major dependency upgrade touched dozens of files, and the team isn't sure exactly which ones. Should the developer resume that old session to continue the work?",
    options: [
      "Yes, always resume — restarting always wastes more time than it saves",
      "It's better to start a new session with a structured summary of what's still relevant, since resuming would carry forward extensively stale tool results from before the major dependency upgrade",
      "Resume the session but ignore everything it says, defeating the purpose of resuming at all",
      "Resume the session and assume the dependency upgrade didn't change anything important",
    ],
    correct: "b",
    explanation:
      "Starting a new session with a structured summary is more reliable than resuming with stale tool results — especially when a lot has changed (like a major dependency upgrade touching many unknown files) since the prior analysis, making much of the old session's tool output unreliable.",
    reinforce: "Review: Task Statement 1.7, choosing a fresh session with a summary over resuming heavily stale context.",
    scenarioTag: "developer_productivity",
  },
  {
    id: "d1-32",
    domain: "D1",
    scenario:
      "A developer resumes a named session that previously analyzed a module in depth. Only two files in that module have changed since then (the rest of the analysis is still valid). What is the most effective way to handle this when resuming?",
    options: [
      "Explicitly tell the agent which two specific files changed, so it can re-analyze just those rather than assuming everything is still accurate or re-exploring the whole module",
      "Say nothing and let the agent naturally notice the changes on its own",
      "Always re-run the full original analysis from scratch to be safe, even though most of it is unaffected",
      "Start an entirely new, unrelated session instead of resuming",
    ],
    correct: "a",
    explanation:
      "When resuming a session after code changes, informing the agent about the specific files that changed enables targeted re-analysis of just those files — avoiding both the risk of assuming stale results are still accurate and the waste of a full unnecessary re-exploration.",
    reinforce: "Review: Task Statement 1.7, informing a resumed session about specific file changes for targeted re-analysis.",
  },
  {
    id: "d1-33",
    domain: "D1",
    type: "multi",
    scenario:
      "Which two statements correctly match a Claude Agent SDK session-management feature to its appropriate use case? (Select 2 responses)",
    options: [
      "Use fork_session when two team members want to explore different, divergent approaches starting from the same completed analysis",
      "Use --resume <session-name> to continue a specific earlier investigation that hasn't been touched by unrelated work",
      "Always resume a session rather than starting fresh, regardless of how stale its tool results have become",
      "fork_session and --resume are interchangeable and can always be used for identical purposes",
    ],
    correctOptions: ["a", "b"],
    explanation:
      "fork_session fits divergent parallel exploration from a shared baseline, while --resume continues a specific named investigation. Neither claiming they're interchangeable, nor always preferring resumption regardless of staleness, matches the guide's actual guidance — starting fresh with a summary is sometimes the better choice.",
    reinforce: "Review: Task Statement 1.7, matching session features (fork_session vs. --resume) to their use cases.",
  },
  {
    id: "d1-34",
    domain: "D1",
    type: "multi",
    scenario:
      "Which two practices make resuming or continuing Claude Code work more reliable across sessions? (Select 2 responses)",
    options: [
      "Informing a resumed session about specific files that changed since its last analysis, for targeted re-analysis",
      "Starting a new session with a structured summary instead of resuming, when prior tool results are heavily stale",
      "Always trusting that a resumed session's earlier tool results are still accurate, no matter how much time has passed",
      "Avoiding named sessions entirely, since unnamed sessions are more reliable to resume",
    ],
    correctOptions: ["a", "b"],
    explanation:
      "Reliable session continuity comes from informing the agent about specific changes when resuming, and from choosing a fresh session with a structured summary when prior results are too stale to trust — not from blindly trusting old results or avoiding the session-naming mechanism that makes targeted resumption possible in the first place.",
    reinforce: "Review: Task Statement 1.7, reliable practices for session resumption and handoff.",
  },
  {
    id: "d1-35",
    domain: "D1",
    scenario:
      "A coordinator for a market-research pipeline decomposes 'analyze the competitive landscape' into exactly 2 fixed subagent tasks: 'search competitor pricing' and 'search competitor features.' The resulting report misses competitor hiring trends and funding news — topics the fixed decomposition never considered. What is the architectural issue?",
    options: [
      "The coordinator decomposed the topic too narrowly, leading to incomplete coverage of a broad research topic",
      "The subagents were given too much autonomy",
      "The report should have been written before any subagents were spawned",
      "The pipeline needs more subagents regardless of what they research",
    ],
    correct: "a",
    explanation:
      "A known risk of coordinator-subagent orchestration is overly narrow task decomposition, which leaves broad topics incompletely covered. The fix isn't simply 'more subagents' — it's decomposing the topic to actually span its relevant subtopics.",
    reinforce: "Review: Task Statement 1.2, risk of overly narrow task decomposition by the coordinator.",
    scenarioTag: "multi_agent_research",
  },
  {
    id: "d1-36",
    domain: "D1",
    scenario:
      "A coordinator spawns 3 research subagents for 'summarize recent developments in battery technology,' but all 3 independently search and summarize the same handful of popular articles, producing heavily redundant findings. What should the coordinator do differently?",
    options: [
      "Partition the research scope across subagents — for example, assigning each a distinct subtopic or source type — to minimize duplicated work",
      "Reduce the number of subagents to 1, since parallelism isn't helping",
      "Instruct all 3 subagents to search for the exact same set of sources to ensure consistency",
      "Merge the 3 redundant summaries without changes, since agreement across subagents indicates confidence",
    ],
    correct: "a",
    explanation:
      "When subagents aren't given distinct scope, they tend to converge on the same obvious sources, producing duplication instead of coverage. Partitioning the research scope — distinct subtopics or source types per subagent — is the coordinator's job to prevent this.",
    reinforce: "Review: Task Statement 1.2, partitioning research scope across subagents to minimize duplication.",
    scenarioTag: "multi_agent_research",
  },
  {
    id: "d1-37",
    domain: "D1",
    scenario:
      "A coordinator's first synthesis pass produces a report on 'the impact of remote work on urban real estate' that thoroughly covers residential trends but has almost nothing on commercial office space. What is the recommended coordinator behavior at this point?",
    options: [
      "Publish the report as-is, since residential coverage is already substantial",
      "Evaluate the synthesis output for gaps, re-delegate to search/analysis subagents with a targeted query about commercial office space, then re-invoke synthesis once that gap is filled",
      "Discard all findings and restart the entire pipeline from scratch",
      "Ask the user to manually research the missing commercial office space section",
    ],
    correct: "b",
    explanation:
      "Coordinators should implement an iterative refinement loop: evaluate the synthesis output for gaps, re-delegate to relevant subagents with targeted follow-up queries addressing exactly what's missing, and re-invoke synthesis — rather than shipping incomplete coverage or discarding all the valid work already done.",
    reinforce: "Review: Task Statement 1.2, iterative refinement loops for closing coverage gaps.",
    scenarioTag: "multi_agent_research",
  },
  {
    id: "d1-38",
    domain: "D1",
    scenario:
      "Which of the following best describes the coordinator's core responsibilities in a hub-and-spoke multi-agent architecture?",
    options: [
      "Decomposing the task, delegating to appropriate subagents, aggregating their results, and deciding which subagents a given query actually needs",
      "Only forwarding the user's message unmodified to every available subagent",
      "Executing all the domain-specific work itself, using subagents purely as a logging mechanism",
      "Selecting a single subagent at random for each request to balance load",
    ],
    correct: "a",
    explanation:
      "The coordinator's core responsibilities are task decomposition, delegation, result aggregation, and deciding which subagents a given query's complexity actually calls for — not blind broadcast to every subagent, self-executing the work, or random selection.",
    reinforce: "Review: Task Statement 1.2, core coordinator responsibilities in hub-and-spoke orchestration.",
  },
  {
    id: "d1-39",
    domain: "D1",
    type: "multi",
    scenario:
      "Which two practices describe good coordinator design in a multi-agent system? (Select 2 responses)",
    options: [
      "Partitioning research scope across subagents to reduce duplicated work",
      "Always invoking every available subagent for every query, regardless of complexity",
      "Evaluating synthesis output for gaps and re-delegating with targeted queries until coverage is sufficient",
      "Letting subagents communicate results directly to each other, bypassing the coordinator, whenever convenient",
    ],
    correctOptions: ["a", "c"],
    explanation:
      "Good coordinator design partitions scope to avoid duplicated subagent work and iteratively closes coverage gaps by re-delegating targeted queries. Invoking every subagent regardless of need, and letting subagents bypass the coordinator, both undermine the hub-and-spoke pattern's efficiency and observability.",
    reinforce: "Review: Task Statement 1.2, coordinator design practices.",
  },
  {
    id: "d1-40",
    domain: "D1",
    scenario:
      "A coordinator spawns a 'synthesis' subagent, defining its AgentDefinition with a specific description, a system prompt scoped to synthesis work, and a tool restriction that excludes web-search tools (since it should only synthesize what other subagents already found). What is this configuration an example of?",
    options: [
      "A misconfiguration — every subagent should have access to every tool for flexibility",
      "Using AgentDefinition to scope each subagent type's description, system prompt, and tool restrictions to its specific role",
      "An anti-pattern, since subagents shouldn't have system prompts of their own",
      "An unnecessary step, since Claude ignores AgentDefinition restrictions in practice",
    ],
    correct: "b",
    explanation:
      "AgentDefinition configuration — description, system prompt, and tool restrictions per subagent type — is exactly how each subagent's role gets scoped, like restricting a synthesis-only subagent from web-search tools it doesn't need.",
    reinforce: "Review: Task Statement 1.3, AgentDefinition configuration per subagent type.",
    scenarioTag: "multi_agent_research",
  },
  {
    id: "d1-41",
    domain: "D1",
    scenario:
      "A coordinator has findings from a web-search subagent and a document-analysis subagent, and now needs a synthesis subagent to combine them into a report. What is the correct way to give the synthesis subagent what it needs?",
    options: [
      "Include the complete findings from both prior subagents directly in the synthesis subagent's prompt",
      "Tell the synthesis subagent to re-run the same web search and document analysis itself",
      "Assume the synthesis subagent automatically has access to the other subagents' conversation history",
      "Give the synthesis subagent only a one-sentence summary of what the other subagents were asked to do, without their actual findings",
    ],
    correct: "a",
    explanation:
      "Since subagents don't automatically inherit other agents' context, the synthesis subagent needs the complete findings from the prior subagents included directly in its prompt — re-running the work or assuming automatic access would either waste effort or simply fail to give it what it needs.",
    reinforce: "Review: Task Statement 1.3, including prior subagents' complete findings directly in the next subagent's prompt.",
    scenarioTag: "multi_agent_research",
  },
  {
    id: "d1-42",
    domain: "D1",
    scenario:
      "A synthesis subagent receives a mix of factual claims and where they came from, but the source URLs and page numbers were pasted inline as part of the same free-text blob as the claims themselves. The final report ends up attributing several claims to the wrong sources. What structural change would prevent this?",
    options: [
      "Use a structured data format that separates claim content from metadata (source URL, document name, page number), so attribution isn't lost when combining findings",
      "Ask the subagent to write more carefully next time",
      "Remove all source citations from the report to avoid the risk of misattribution",
      "Have the synthesis subagent guess the most likely source for each claim based on writing style",
    ],
    correct: "a",
    explanation:
      "Separating content from metadata using a structured format (rather than free-text blobs mixing claims and sources) is what preserves attribution reliably when context is passed between agents — guessing or removing citations doesn't solve the underlying structural problem.",
    reinforce: "Review: Task Statement 1.3, structured data formats separating content from metadata to preserve attribution.",
    scenarioTag: "multi_agent_research",
  },
  {
    id: "d1-43",
    domain: "D1",
    scenario:
      "A coordinator's prompt to a research subagent lists 15 numbered procedural steps to follow exactly, in order, with no room to deviate. When the subagent discovers the first source is a dead link, it has no guidance for what to do next except get stuck. What prompt design would have avoided this?",
    options: [
      "Specifying the research goal and quality criteria the subagent should meet, rather than a rigid step-by-step procedure — letting the subagent adapt to what it actually encounters",
      "Adding even more numbered steps to cover every possible failure case in advance",
      "Removing all guidance from the prompt entirely",
      "Having the coordinator manually handle every dead link itself instead of delegating",
    ],
    correct: "a",
    explanation:
      "Coordinator prompts that specify goals and quality criteria — rather than rigid step-by-step procedures — enable subagents to adapt to what they actually encounter (like a dead link), instead of getting stuck outside a pre-scripted sequence.",
    reinforce: "Review: Task Statement 1.3, specifying goals and quality criteria over step-by-step procedural instructions.",
  },
  {
    id: "d1-44",
    domain: "D1",
    type: "multi",
    scenario:
      "Which two practices correctly describe how a coordinator should pass context and configure subagents in the Claude Agent SDK? (Select 2 responses)",
    options: [
      "Including complete prior findings directly in a subagent's prompt, since subagents don't automatically inherit other agents' context",
      "Assuming all spawned subagents share the coordinator's full conversation history by default",
      "Using structured formats that separate content from metadata to preserve source attribution across handoffs",
      "Writing exhaustive step-by-step procedural instructions for every subagent to eliminate any need for judgment",
    ],
    correctOptions: ["a", "c"],
    explanation:
      "Subagents need relevant findings included explicitly in their prompts (since context isn't automatically inherited) and structured content/metadata separation to preserve attribution. Assuming automatic context sharing is factually wrong, and over-specifying rigid procedures removes the adaptability that goal-oriented prompts are meant to preserve.",
    reinforce: "Review: Task Statement 1.3, subagent context passing and configuration practices.",
  },
  {
    id: "d1-45",
    domain: "D1",
    scenario:
      "A customer message says: 'My last order arrived damaged AND I was charged twice for it.' The agent has tools to handle damage claims and billing disputes separately. What is the best way to handle this multi-concern request?",
    options: [
      "Decompose the request into its distinct concerns (damage claim, duplicate charge), investigate each in parallel using shared context, then synthesize a single unified resolution",
      "Only address the first concern mentioned and tell the customer to send a separate message for the second",
      "Pick whichever concern seems more urgent and silently ignore the other",
      "Escalate immediately to a human without attempting to resolve either concern",
    ],
    correct: "a",
    explanation:
      "Multi-concern customer requests should be decomposed into their distinct items, investigated in parallel using shared context, and then synthesized into one unified response — not handled partially, arbitrarily prioritized, or escalated by default when the agent has the tools to resolve both.",
    reinforce: "Review: Task Statement 1.4, decomposing and resolving multi-concern requests.",
    scenarioTag: "customer_support",
  },
  {
    id: "d1-46",
    domain: "D1",
    scenario:
      "An internal tool lets an agent adjust warehouse inventory counts. Company policy requires a manager-approval flag to be set before any adjustment above 500 units can be executed autonomously. The system prompt states this rule clearly, but audits find occasional adjustments above 500 units going through without the flag. What is the recommended fix?",
    options: [
      "Reword the system prompt rule to be even more explicit and repeated multiple times",
      "Add a programmatic prerequisite that blocks the inventory-adjustment tool call above 500 units until the manager-approval flag is confirmed set",
      "Remove the 500-unit threshold entirely so there's nothing to enforce",
      "Trust that clearer wording will eventually reach 100% compliance",
    ],
    correct: "b",
    explanation:
      "Business-critical ordering requirements (like requiring approval before a large inventory change) need a programmatic prerequisite gate — prompt-based instructions, no matter how clearly worded, carry a non-zero failure rate that a deterministic block does not.",
    reinforce: "Review: Task Statement 1.4, programmatic prerequisites for business-critical operation ordering.",
  },
  {
    id: "d1-47",
    domain: "D1",
    scenario:
      "A team is confident that as long as the system prompt is worded carefully enough, an agent will always verify a user's identity before revealing account details. After several prompt rewrites, a small number of failures still occur under unusual phrasing. What does this repeated pattern indicate?",
    options: [
      "The prompt just needs one more rewrite and will eventually reach zero failures",
      "Prompt-based compliance is inherently probabilistic and has a non-zero failure rate — for requirements where failure has real cost, only programmatic enforcement (like a hook or a gate) provides a deterministic guarantee",
      "The failures are unrelated to enforcement design and are just random model noise to be ignored",
      "The team should switch to an entirely different model and keep the same enforcement approach",
    ],
    correct: "b",
    explanation:
      "No amount of prompt wording eliminates the fundamentally probabilistic nature of instruction-following. When failures have real cost, the guide's recommendation is programmatic enforcement (deterministic), not further iteration on prompt wording alone.",
    reinforce: "Review: Task Statement 1.4, prompt-based compliance as inherently probabilistic vs. deterministic enforcement.",
  },
  {
    id: "d1-48",
    domain: "D1",
    type: "multi",
    scenario:
      "Which two statements correctly describe enforcement and handoff design for multi-step agentic workflows? (Select 2 responses)",
    options: [
      "Programmatic prerequisites (like blocking a downstream tool call until a required step completes) provide guarantees prompt instructions alone cannot",
      "Multi-concern requests should be handled one concern at a time across separate, unrelated conversations",
      "A structured handoff to a human should include enough context (like root cause and recommended action) that the human doesn't need to reconstruct it themselves",
      "Once a system prompt clearly states a compliance rule, no further enforcement mechanism is needed",
    ],
    correctOptions: ["a", "c"],
    explanation:
      "Programmatic prerequisites give deterministic guarantees, and structured handoffs should carry enough context for a human to act without reconstructing it. Splitting a multi-concern request across unrelated conversations, and trusting a prompt statement alone as sufficient enforcement, are both the anti-patterns this Task Statement warns against.",
    reinforce: "Review: Task Statement 1.4, enforcement and handoff design principles.",
  },
  {
    id: "d1-49",
    domain: "D1",
    scenario:
      "Why does the exam guide recommend using Agent SDK hooks, rather than relying solely on system-prompt instructions, when a business rule absolutely must be enforced every time?",
    options: [
      "Hooks provide a deterministic guarantee by intercepting tool calls programmatically, while prompt instructions only produce probabilistic compliance that can fail even when clearly written",
      "Hooks make the model respond faster, which is the only reason to prefer them",
      "System prompts cannot contain business rules at all, so hooks are the only option",
      "Hooks and prompt instructions are functionally identical, so the choice doesn't matter",
    ],
    correct: "a",
    explanation:
      "The core distinction is deterministic guarantee (hooks intercepting tool calls programmatically) versus probabilistic compliance (prompt instructions, which can fail even when well-written). That reliability gap — not speed — is why hooks are recommended for must-always-enforce rules.",
    reinforce: "Review: Task Statement 1.5, hooks for deterministic guarantees vs. probabilistic prompt compliance.",
  },
  {
    id: "d1-50",
    domain: "D1",
    scenario:
      "An agent pulls order status from three MCP tools that each represent status differently: one uses numeric codes (1, 2, 3), another uses short strings ('pending', 'shipped'), and a third uses full sentences. The agent frequently misreads status across systems. What is the recommended fix?",
    options: [
      "A PostToolUse hook that normalizes all three status representations into one consistent format before the agent reasons about them",
      "Ask the model to keep track of which system uses which format in its own memory",
      "Standardize on whichever format is used by the newest of the three backend systems and ignore the others",
      "Remove two of the three status sources to reduce inconsistency",
    ],
    correct: "a",
    explanation:
      "A PostToolUse hook normalizing heterogeneous status representations (numeric codes, short strings, sentences) into a consistent format before the model processes them is the deterministic fix — relying on the model to track format differences on its own is unreliable.",
    reinforce: "Review: Task Statement 1.5, PostToolUse hooks normalizing heterogeneous data formats.",
  },
  {
    id: "d1-51",
    domain: "D1",
    scenario:
      "An internal agent has access to a delete_customer_record tool. Company policy requires a supervisor-approval flag before any deletion can proceed. What is the recommended way to enforce this?",
    options: [
      "A tool call interception hook that blocks delete_customer_record unless the supervisor-approval flag is set, redirecting to manual review otherwise",
      "A note in the system prompt asking the agent to 'be careful' with deletions",
      "Trusting that the agent will rarely need to call this tool, so enforcement isn't necessary",
      "Removing all error messages related to the deletion tool so the agent doesn't get confused",
    ],
    correct: "a",
    explanation:
      "A tool call interception hook blocking the deletion until the required approval flag is set — and redirecting to manual review otherwise — is the deterministic enforcement mechanism for a high-consequence action like this, not a soft prompt reminder.",
    reinforce: "Review: Task Statement 1.5, tool call interception hooks for high-consequence actions.",
  },
  {
    id: "d1-52",
    domain: "D1",
    type: "multi",
    scenario:
      "Which two are correct characteristics of Agent SDK hooks as described in the exam guide? (Select 2 responses)",
    options: [
      "PostToolUse hooks can transform or normalize tool results before the model processes them",
      "Hooks intercepting outgoing tool calls can enforce compliance rules, like blocking an action above a policy threshold",
      "Hooks are optional stylistic sugar with no reliability advantage over well-written prompt instructions",
      "Hooks can only be used to log data and have no ability to block or alter agent behavior",
    ],
    correctOptions: ["a", "b"],
    explanation:
      "PostToolUse hooks can transform/normalize results, and hooks intercepting outgoing tool calls can enforce compliance rules like blocking policy-violating actions. Hooks provide deterministic guarantees prompts don't (the opposite of 'no reliability advantage'), and they can actively block or alter behavior, not just log.",
    reinforce: "Review: Task Statement 1.5, characteristics and capabilities of Agent SDK hooks.",
  },
  {
    id: "d1-53",
    domain: "D1",
    scenario:
      "A team's system prompt tells their coding agent to 'always double-check before deleting files.' Despite this instruction, the agent occasionally deletes files that shouldn't have been touched, under ambiguous instructions from the user. What change would reliably prevent this?",
    options: [
      "A hook that intercepts delete/write operations on protected paths and blocks or requires confirmation before they proceed, rather than relying on the prompt instruction alone",
      "Repeating the 'double-check before deleting' instruction twice in the system prompt for emphasis",
      "Removing the delete capability from the agent's tools entirely, even when legitimate deletions are needed",
      "Increasing the model's context window so it 'remembers' to double-check",
    ],
    correct: "a",
    explanation:
      "A prompt instruction to 'double-check' is still probabilistic compliance. A hook that intercepts the actual delete/write operation and enforces a check or confirmation gives a deterministic guarantee the prompt instruction alone cannot — without removing legitimate delete capability altogether.",
    reinforce: "Review: Task Statement 1.5, hooks vs. prompt instructions for reliably preventing unwanted actions.",
    scenarioTag: "code_generation",
  },
  {
    id: "d1-54",
    domain: "D1",
    scenario:
      "A team is deciding whether to enforce a critical business rule via an Agent SDK hook or via a very carefully worded system prompt instruction. What should determine their choice?",
    options: [
      "Whether the failure cost of a missed enforcement is high enough to require a deterministic guarantee (favoring a hook) versus a case where occasional probabilistic drift is an acceptable tradeoff (where prompt guidance may suffice)",
      "Whichever approach is faster to implement, regardless of the rule's consequences",
      "Hooks should never be used for business rules — they are reserved exclusively for logging",
      "System prompts should never be used to describe any rule, since hooks always replace them entirely",
    ],
    correct: "a",
    explanation:
      "The deciding factor is the cost of a compliance failure: when it's high (financial operations, data deletion, identity verification), a hook's deterministic guarantee is warranted. Choosing based purely on implementation speed, or treating one mechanism as universally forbidden, misses the actual tradeoff the guide describes.",
    reinforce: "Review: Task Statement 1.5, choosing between hooks and prompt-based guidance based on failure cost.",
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
  `INSERT INTO questions (id, domain_id, scenario, option_a, option_b, option_c, option_d, correct_option, question_type, correct_options, select_count, scenario_tag, explanation, reinforce)
   VALUES (@id, @domain_id, @scenario, @option_a, @option_b, @option_c, @option_d, @correct_option, @question_type, @correct_options, @select_count, @scenario_tag, @explanation, @reinforce)
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
     scenario_tag = excluded.scenario_tag,
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
      scenario_tag: q.scenarioTag ?? null,
      explanation: q.explanation,
      reinforce: q.reinforce,
    });
  }
});

seed();
console.log(`Seeded ${DOMAINS.length} domains and ${QUESTIONS.length} questions.`);
