# Graph Report - .  (2026-04-28)

## Corpus Check
- Corpus is ~6,291 words - fits in a single context window. You may not need a graph.

## Summary
- 57 nodes · 61 edges · 21 communities detected
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.5)
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
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]

## God Nodes (most connected - your core abstractions)
1. `calculateWaste()` - 3 edges
2. `readGitWorkingTree()` - 3 edges
3. `countTokens()` - 2 edges
4. `codeFoundInFinalTree()` - 2 edges
5. `isReadable()` - 2 edges
6. `isGitRepo()` - 2 edges
7. `parseLog()` - 2 edges
8. `createTurn()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Smart Search/Replace Diff Parser` --would_enhance--> `Git Survival Detection`  [INFERRED]
   →   _Bridges community 0 → community 1_
- `AI Coach Implementation Plan` --plans_implementation_of--> `PromptSensei`  [EXTRACTED]
   →   _Bridges community 6 → community 0_
- `FUTURE_IDEAS.md` --proposes_features_for--> `PromptSensei`  [EXTRACTED]
   →   _Bridges community 6 → community 1_
- `Token Counting` --enables--> `calculateWaste()`  [EXTRACTED]
   →   _Bridges community 0 → community 2_

## Hyperedges (group relationships)
- **Shared Review Pipeline** —  [EXTRACTED]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (11): AI Coach Design Specification, AI Coach Implementation Plan, calculateWaste(), getGitContent(), Git Survival Detection, Negative Feedback Detection, parseLog(), review_session tool (MCP) (+3 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (10): AI ROI Dashboard, Anti-Pattern Detection Engine, Smart Search/Replace Diff Parser, FUTURE_IDEAS.md, Gemini API, generateAdvice(), CI/CD GitHub Action, OpenAI SDK (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (5): calculateWaste(), codeFoundInFinalTree(), countTokens(), tiktoken (cl100k_base), Token Counting

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (3): isGitRepo(), isReadable(), readGitWorkingTree()

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (0): 

### Community 5 - "Community 5"
Cohesion: 0.0
Nodes (2): createTurn(), parseLog()

### Community 6 - "Community 6"
Cohesion: 0.0
Nodes (3): PromptSensei, README.md, sample-chat.md

### Community 7 - "Community 7"
Cohesion: 0.0
Nodes (0): 

### Community 8 - "Community 8"
Cohesion: 0.0
Nodes (0): 

### Community 9 - "Community 9"
Cohesion: 0.0
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 0.0
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 0.0
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 0.0
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 0.0
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 0.0
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 0.0
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 0.0
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 0.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 0.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 0.0
Nodes (1): Commander.js

### Community 20 - "Community 20"
Cohesion: 0.0
Nodes (1): @modelcontextprotocol/sdk

## Knowledge Gaps
- **Thin community `Community 7`** (2 nodes): `runCoach()`, `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (2 nodes): `startMcpServer()`, `mcp-server.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (2 nodes): `makeTestRepo()`, `git-reader.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (1 nodes): `jest.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (1 nodes): `cli.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (1 nodes): `advisor.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (1 nodes): `calculator.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (1 nodes): `calculator.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (1 nodes): `index.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (1 nodes): `index.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (1 nodes): `parser.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (1 nodes): `parser.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `Commander.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `@modelcontextprotocol/sdk`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.