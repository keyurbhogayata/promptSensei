# Future Ideas for AI Coach

Here is a backlog of potential features and improvements for the AI Coach project:

## 1. "AI ROI" Dashboard (Web UI)
- Command like `ai-coach serve` that spins up a local React dashboard on `localhost`.
- Visualizes token usage over time, plots "efficiency scores" (kept code vs. wasted code).
- Visually highlights exactly which prompts cost the most money.

## 2. Anti-Pattern Detection Engine
- A heuristic engine that reads the user's prompts and flags specific **Prompt Engineering Anti-Patterns**.
- **Context Dumping:** Pasting a 2,000-line file but only asking to change a variable name.
- **Vague Debugging:** Saying "It doesn't work, fix it" without providing an error stack trace.
- **The "One More Thing" Trap:** Asking the AI to do 5 unrelated tasks in a single prompt instead of breaking them down.

## 3. Smart "Search/Replace" Diff Parser
- Agents like Cline and Roo Code often generate `<<<< SEARCH ==== REPLACE >>>>` blocks instead of raw code.
- A sophisticated parser that understands standard diff formats and simulates applying the diff internally to detect if the AI's intended change actually survived in the codebase.

## 4. CI/CD GitHub Action
- Package the AI Coach as a GitHub Action.
- Automatically leaves a comment on Pull Requests: *"AI Efficiency Report: This PR cost $0.45 to generate. 80% of the code was kept."*

## 5. `ai-coach optimize` (Pre-flight Checks)
- A command that helps *before* you chat.
- E.g., `ai-coach optimize "Can you make a login form?"` -> tool rewrites the prompt to be more specific, token-efficient, and likely to succeed on the first try.
