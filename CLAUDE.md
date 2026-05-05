# PromptSensei — Technical Reference

## Commands
- `npm run build` — Compile TypeScript
- `npm test` — Run all tests
- `npm run start:mcp` — Start the MCP server
- `node dist/cli.js review <path>` — Run the CLI tool

## Core Engines
- `src/parser.ts` — Chat log turn & diff extraction
- `src/calculator.ts` — Precise token math & git tree cross-referencing
- `src/advisor.ts` — Coaching prompt generation
- `src/optimizer.ts` — Context pruning logic
- `src/antiPatterns.ts` — Prompt mistake heuristics
