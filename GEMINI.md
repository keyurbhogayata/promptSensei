# PromptSensei - Project Instructions

This document provides foundational context and instructions for AI interactions within the PromptSensei repository.

## Project Overview
PromptSensei is a developer utility designed to analyze AI coding sessions. It quantifies wasted effort, tracks token costs, and provides qualitative prompt engineering coaching.

### Core Technologies
- **Language:** TypeScript
- **Runtime:** Node.js
- **CLI Framework:** Commander.js
- **Protocol:** Model Context Protocol (MCP) via `@modelcontextprotocol/sdk`
- **Git Integration:** `simple-git`
- **Tokenization:** `gpt-tokenizer` / `tiktoken`

### Key Components
- `src/parser.ts`: Parses chat logs into structured conversation turns.
- `src/calculator.ts`: Calculates token usage and identifies "wasted" turns by checking if generated code survived in the git tree.
- `src/advisor.ts`: Generates coaching prompts based on wasted turns.
- `src/antiPatterns.ts`: Heuristics to detect common prompting mistakes (e.g., "Context Dumping").
- `src/optimizer.ts`: Prunes context for subsequent AI requests using a knowledge graph.
- `src/cli.ts`: Entry point for terminal usage.
- `src/mcp-server.ts`: Entry point for MCP server usage.

## Building and Running

### Setup
```bash
npm install
```

### Build
```bash
npm run build
```

### Run CLI
```bash
node dist/cli.js review <path-to-chat-log.md>
```

### Run MCP Server
```bash
npm run start:mcp
```

### Testing
```bash
npm test
```

## Publishing and Releasing

### Prerequisites
- Logged into NPM (`npm login`).
- Azure DevOps PAT for VS Code Marketplace.

### Step-by-Step Release
1.  **Version Bump**:
    ```powershell
    $VERSION = npm version patch --no-git-tag-version
    cd vscode-extension; npm version $VERSION --no-git-tag-version; cd ..
    git add . ; git commit -m "chore: release $VERSION"; git tag $VERSION
    ```
2.  **Build & Package**:
    - Core: `npm run build`
    - Extension: `cd vscode-extension; npm run build; npx @vscode/vsce package --no-dependencies; cd ..`
3.  **Publish**:
    - NPM: `npm publish`
    - Marketplace: `cd vscode-extension; npx @vscode/vsce publish -p $PAT; cd ..`
4.  **Push**: `git push origin master --tags`

## Architecture and Discovery (Graphify)

This project utilizes **graphify** to maintain a technical knowledge graph.

### Graphify Rules
- **Map First**: Before answering complex architectural or dependency questions, read `graphify-out/GRAPH_REPORT.md`.
- **Navigation**: If `graphify-out/wiki/index.md` exists, use it as the primary navigation entry point.
- **Maintenance**: After making significant code changes, run `graphify update .` to keep the AST-based graph synchronized (this is free and requires no LLM).
- **Tools**: If the graphify MCP server is active, prefer `query_graph` or `get_node` over raw `grep` for precise symbol discovery.

## Development Conventions

### Coding Style
- **TypeScript First:** Maintain strict typing.
- **Modularity:** Keep logic separated into functional modules within `src`.
- **Async/Await:** Use modern asynchronous patterns for file and git operations.

### Testing Practices
- **Jest:** Use Jest for all unit and integration tests.
- **Test Location:** Mirror `src` structure in the `tests` directory.
- **TDD Preferred:** Follow Test-Driven Development when implementing new features or bug fixes.

### Git & Commits
- **Imperative Mood:** Use imperative messages for commits (e.g., `feat: add context optimizer`).
- **Scope:** Include scope in commit messages if possible (e.g., `fix(parser): handle empty logs`).

### Documentation
- Maintain `README.md` for user-facing instructions.
- Update `GEMINI.md` for repository-wide AI context when architecture or conventions change.
- Keep `FUTURE_IDEAS.md` updated with technical debt and upcoming features.

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
