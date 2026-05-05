# Future Ideas for PromptSensei

Here is a backlog of potential features and improvements for the PromptSensei project:

## ✅ Completed

### 1. Smart "Search/Replace" Diff Parser
- **Current State:** Successfully implemented in `src/parser.ts` and `src/calculator.ts`. Supports parsing Unified Diffs and SEARCH/REPLACE blocks.
- **Impact:** Accurate calculation of code survival rates.

### 2. Anti-Pattern Detection Engine
- **Current State:** Successfully implemented in `src/antiPatterns.ts`.
- **Heuristics:** Detects "Vague Debugging", "Context Dumping", and "One More Thing Trap" to analyze developer prompts.

---

## 🚀 High-Impact Ideas (To Be Implemented)

### 3. Automated Context Optimizer (Token Shredder)
- **Concept:** Before sending a request to an LLM, this tool analyzes the project's dependency graph. It automatically prunes unrelated files and functions from the context window, drastically reducing token usage and hallucination risks.

### 4. `promptsensei optimize` (Prompt Refactoring)
- **Concept:** A CLI command and VS Code action that helps *before* you chat.
- **Usage:** `promptsensei optimize "Can you make a login form?"` -> tool rewrites the prompt to be more specific, token-efficient, and likely to succeed on the first try.

### 5. Multi-Agent Efficiency Benchmarks
- **Concept:** Run the exact same prompt through different models (e.g., Claude 3.5 Sonnet vs. GPT-4o) locally. The tool ranks them based on cost vs. how much generated code actually survives in the final git tree.

### 6. Git Hooks Integration (Pre-commit / Pre-push)
- **Concept:** A `pre-commit` hook that automatically calculates the wasted tokens since the last commit. It optionally appends an "AI Efficiency Report" to your commit message metadata.

### 7. CI/CD GitHub Action (PR Reviewer)
- **Concept:** Package PromptSensei as a GitHub Action.
- **Usage:** Automatically leaves a comment on Pull Requests: *"AI Efficiency Report: This PR cost $0.45 to generate. 80% of the code was kept."*

### 8. Real-time Budget & Efficiency Alerts
- **Concept:** Set a hard budget (e.g., "$2.00") or efficiency threshold (e.g., "75%") for an AI coding session. The VS Code extension visually alerts you when you are entering a "waste spiral".

---

## 💡 New Brainstormed Ideas

### 9. Token Waste Heatmap (VS Code)
- **Concept:** A gutter icon or heatmap in the editor that shows which lines of code have been rewritten by AI the most times in the last 24 hours.
- **Goal:** Identify "unstable" areas of the codebase where AI is struggling to find the right solution.

### 10. AI ROI Dashboard for Teams
- **Concept:** A web-based dashboard that aggregates stats from `graphify-out` across a whole team/org.
- **Goal:** Show leadership the actual ROI of AI tools (Time Saved vs. Token Cost vs. Code Quality).

### 11. Context Injection Simulator
- **Concept:** A "Dry Run" mode that shows you exactly what files and context snippets will be sent to the LLM *before* you hit enter.
- **Goal:** Prevent "Context Dumping" by allowing users to manually prune the context before the bill starts.

### 12. Semantic Diff Review
- **Concept:** Instead of just line-by-line diffs, use LLM to summarize the *intent* of the AI-generated changes compared to the final committed version.
- **Goal:** Highlight where the AI's logic diverged from the final implementation.
