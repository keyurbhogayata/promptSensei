# Graph Report - C:\Users\KeyurBhogayata\.gemini\antigravity\scratch\promptSensei  (2026-05-05)

## Corpus Check
- 15 files · ~20,196 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 62 nodes · 58 edges · 15 communities detected
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]

## God Nodes (most connected - your core abstractions)
1. `GraphClient` - 5 edges
2. `createTurn()` - 4 edges
3. `calculateWaste()` - 3 edges
4. `readGitWorkingTree()` - 3 edges
5. `OptimizerEngine` - 3 edges
6. `extractUnifiedDiffs()` - 3 edges
7. `countTokens()` - 2 edges
8. `codeFoundInFinalTree()` - 2 edges
9. `isReadable()` - 2 edges
10. `isGitRepo()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Community 0"
Cohesion: 0.24
Nodes (2): GraphClient, OptimizerEngine

### Community 1 - "Community 1"
Cohesion: 0.2
Nodes (10): Docker MCP Toolkit, Features, Getting Started, Icon, License, MCP Server Mode, PromptSensei, Standalone CLI Mode (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.33
Nodes (0): 

### Community 3 - "Community 3"
Cohesion: 0.6
Nodes (5): createTurn(), extractSearchReplace(), extractUnifiedDiffs(), parseDiffContent(), parseLog()

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (6): AI ROI Dashboard, Anti-Pattern Detection Engine, CI/CD GitHub Action, Smart Search/Replace Diff Parser, Future Ideas for PromptSensei, promptsensei optimize Command

### Community 5 - "Community 5"
Cohesion: 0.5
Nodes (2): activate(), deactivate()

### Community 6 - "Community 6"
Cohesion: 0.83
Nodes (3): calculateWaste(), codeFoundInFinalTree(), countTokens()

### Community 7 - "Community 7"
Cohesion: 0.83
Nodes (3): isGitRepo(), isReadable(), readGitWorkingTree()

### Community 8 - "Community 8"
Cohesion: 1.0
Nodes (0): 

### Community 9 - "Community 9"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 8`** (2 nodes): `generateCoachingPrompt()`, `advisor.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (2 nodes): `detectAntiPatterns()`, `antiPatterns.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (2 nodes): `mcp-server.ts`, `startMcpServer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (2 nodes): `symbolExtractor.ts`, `extractSymbol()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (1 nodes): `jest.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (1 nodes): `cli.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Not enough signal to generate questions. This usually means the corpus has no AMBIGUOUS edges, no bridge nodes, no INFERRED relationships, and all communities are tightly cohesive. Add more files or run with --mode deep to extract richer edges._