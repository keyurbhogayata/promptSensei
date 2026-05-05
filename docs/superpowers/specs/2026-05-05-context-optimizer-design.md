# Design Spec: Automated Context Optimizer (Token Shredder)

**Status:** Draft
**Author:** Gemini CLI
**Date:** 2026-05-05

## 1. Overview
The **Automated Context Optimizer** (Token Shredder) is a technical utility for PromptSensei designed to prune unrelated files and code blocks from the AI's context window. By leveraging the existing `graphify` knowledge graph and an adaptive hybrid filtering strategy, it reduces token usage, lowers costs, and minimizes LLM hallucinations.

## 2. Goals
- **Token Efficiency**: Reduce context size by >40% for typical coding tasks.
- **High Recall**: Ensure zero "missing dependency" errors in optimized context.
- **Multi-Interface**: Support CLI, MCP, and VS Code extension usage.
- **Adaptive Precision**: Switch between file-level and symbol-level pruning based on file size.

## 3. Architecture

### 3.1 Components
- **GraphClient (`src/graphClient.ts`)**: Interface for reading and querying `graphify-out/graph.json`.
- **OptimizerEngine (`src/optimizer.ts`)**: The core pipeline orchestration logic.
- **SymbolExtractor (`src/utils/symbolExtractor.ts`)**: Regex-based utility to pull specific code blocks from large files using graph coordinates.
- **LLMFilter (`src/llmFilter.ts`)**: Lightweight interface to use an LLM for the final high-precision prune. In MCP mode, it uses the host LLM; in CLI mode, it requires a configured provider (e.g., OpenAI, Anthropic) or falls back to Graph-only mode.

### 3.2 The Optimization Pipeline
1. **Prompt Parsing**: Identify symbols mentioned in the user's natural language prompt.
2. **Graph Expansion**: 
    - Map identified symbols to Graph nodes.
    - Traverse edges to find 1st and 2nd-degree neighbors (imports, calls, tests).
    - If the graph is missing or stale, trigger a `graphify` rebuild.
3. **Hybrid Pruning**:
    - **Step A (Graph)**: Generate a "Wide Candidate Set" (Fast).
    - **Step B (LLM)**: Send file names + summaries to LLM to produce a "Precision Set" (Accurate).
4. **Adaptive Output Generation**:
    - For files < 200 lines: Include the entire file.
    - For files > 200 lines: Extract only the symbols identified in the Precision Set + file headers.

## 4. Interfaces

### 4.1 CLI
`promptsensei optimize <prompt> [--apply]`
- Returns a Markdown report of pruned context.
- `--apply` copies the optimized context to the clipboard.

### 4.2 MCP Server
`get_optimized_context(prompt: string)`
- Returns optimized context as a tool result for host LLMs.

### 4.3 VS Code
- Context menu action: "Optimize Workspace Context for Prompt".

## 5. Error Handling & Fallbacks
- **Missing Graph**: Rebuild via `graphify` command. If that fails, fallback to heuristic import-matching.
- **LLM Timeout**: Fallback to the Graph-only expansion set (skip high-precision pruning).
- **Ambiguity**: Include all candidate matches for ambiguous symbol names.

## 6. Testing Strategy
- **Unit Tests**: Mock `graph.json` to verify traversal logic and pruning thresholds.
- **Integration Tests**: Verify the full pipeline from prompt to optimized output using sample project logs.
- **Benchmarks**: Measure token count reduction across a set of 10 standard coding prompts.
