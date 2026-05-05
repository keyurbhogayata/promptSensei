# Future Ideas for PromptSensei

Here is a backlog of potential features and improvements for the PromptSensei project:

## ✅ Completed

### 2. Smart "Search/Replace" Diff Parser
- **Current State:** Successfully implemented in `parser.ts` and `calculator.ts`. Supports parsing Unified Diffs and SEARCH/REPLACE blocks.

### 3. Anti-Pattern Detection Engine
- **Current State:** Successfully implemented in `.worktrees/anti-pattern-engine`. Features heuristics for "Vague Debugging", "Context Dumping", and "One More Thing Trap" to analyze developer prompts.

---

## 🚀 New Impactful Ideas

### 4. Automated Context Optimizer (Token Shredder)
- **Concept:** Before sending a request to an LLM, this tool analyzes the project's dependency graph. It automatically prunes unrelated files and functions from the context window, drastically reducing token usage and hallucination risks.

### 5. Multi-Agent Efficiency Benchmarks
- **Concept:** Run the exact same prompt through different models (e.g., Claude 3.5 Sonnet vs. GPT-4o) locally. The tool ranks them based on cost vs. how much generated code actually survives in the final git tree. "Which model is most efficient for *this* specific task?"

### 6. Git Hooks Integration (Pre-commit / Pre-push)
- **Concept:** A `pre-commit` hook that automatically calculates the wasted tokens since the last commit. It optionally appends an "AI Efficiency Report" to your commit message metadata.

### 7. CI/CD GitHub Action
- **Concept:** Package PromptSensei as a GitHub Action.
- **Usage:** Automatically leaves a comment on Pull Requests: *"AI Efficiency Report: This PR cost $0.45 to generate. 80% of the code was kept."*

### 8. `promptsensei optimize` (Pre-flight Checks)
- **Concept:** A CLI command and VS Code action that helps *before* you chat.
- **Usage:** `promptsensei optimize "Can you make a login form?"` -> tool rewrites the prompt to be more specific, token-efficient, and likely to succeed on the first try.

### 9. Real-time Budget & Efficiency Alerts
- **Concept:** Set a hard budget (e.g., "$2.00") or efficiency threshold (e.g., "75%") for an AI coding session. The VS Code extension visually alerts you when you are approaching the budget or when you are entering a "waste spiral" (repeatedly fixing AI mistakes).
