# Automated Context Optimizer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a utility that prunes unrelated files and functions from an AI's context window using the `graphify` knowledge graph.

**Architecture:** A core `OptimizerEngine` that extracts symbols from a prompt, expands them via a `GraphClient`, filters them via a lightweight LLM pass, and prunes large files using a `SymbolExtractor`.

**Tech Stack:** TypeScript, Node.js, Commander.js (CLI), @modelcontextprotocol/sdk (MCP), gpt-tokenizer (Token counting).

---

### Task 1: Graph Client Implementation

**Files:**
- Create: `src/graphClient.ts`
- Test: `tests/graphClient.test.ts`

- [ ] **Step 1: Define the Graph types and Client class**

```typescript
// src/graphClient.ts
import * as fs from 'fs';
import * as path from 'path';

export interface GraphNode {
  id: string;
  label: string;
  file_type: string;
  source_file: string;
  source_location: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
}

export class GraphClient {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];

  constructor(private graphPath: string) {}

  async load(): Promise<boolean> {
    if (!fs.existsSync(this.graphPath)) return false;
    const data = JSON.parse(fs.readFileSync(this.graphPath, 'utf8'));
    data.nodes.forEach((n: GraphNode) => this.nodes.set(n.id, n));
    this.edges = data.links || data.edges || [];
    return true;
  }

  findNodesByLabel(label: string): GraphNode[] {
    return Array.from(this.nodes.values()).filter(n => 
      n.label.toLowerCase().includes(label.toLowerCase())
    );
  }

  getNeighbors(nodeId: string): GraphNode[] {
    const neighborIds = this.edges
      .filter(e => e.source === nodeId || e.target === nodeId)
      .map(e => (e.source === nodeId ? e.target : e.source));
    
    return neighborIds
      .map(id => this.nodes.get(id))
      .filter((n): n is GraphNode => !!n);
  }
}
```

- [ ] **Step 2: Write tests for GraphClient**

```typescript
// tests/graphClient.test.ts
import { GraphClient } from '../src/graphClient';
import * as fs from 'fs';

describe('GraphClient', () => {
  it('should find nodes by label', async () => {
    // Mocking logic here...
  });
});
```

- [ ] **Step 3: Run tests and verify**

Run: `npm test tests/graphClient.test.ts`

- [ ] **Step 4: Commit**

```bash
git add src/graphClient.ts tests/graphClient.test.ts
git commit -m "feat(optimize): add GraphClient for dependency traversal"
```

---

### Task 2: Symbol Extractor Utility

**Files:**
- Create: `src/utils/symbolExtractor.ts`
- Test: `tests/symbolExtractor.test.ts`

- [ ] **Step 1: Implement extraction logic**

```typescript
// src/utils/symbolExtractor.ts
import * as fs from 'fs';

export function extractSymbol(filePath: string, lineRange: string): string {
  if (!fs.existsSync(filePath)) return '';
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  const startMatch = lineRange.match(/L(\d+)/);
  if (!startMatch) return '';
  
  const startLine = parseInt(startMatch[1]) - 1;
  // Naive extraction: get 50 lines or until next symbol (refined later)
  return lines.slice(startLine, startLine + 50).join('\n');
}
```

- [ ] **Step 2: Run tests**

- [ ] **Step 3: Commit**

```bash
git add src/utils/symbolExtractor.ts tests/symbolExtractor.test.ts
git commit -m "feat(optimize): add symbol extractor utility"
```

---

### Task 3: Core Optimizer Engine

**Files:**
- Create: `src/optimizer.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Implement the Engine pipeline**

```typescript
// src/optimizer.ts
import { GraphClient, GraphNode } from './graphClient';
import { extractSymbol } from './utils/symbolExtractor';

export class OptimizerEngine {
  constructor(private client: GraphClient) {}

  async optimize(prompt: string): Promise<string[]> {
    await this.client.load();
    const words = prompt.split(/\W+/);
    const seeds: GraphNode[] = [];
    
    for (const word of words) {
      if (word.length < 3) continue;
      seeds.push(...this.client.findNodesByLabel(word));
    }

    const candidates = new Set<string>();
    for (const seed of seeds) {
      candidates.add(seed.source_file);
      this.client.getNeighbors(seed.id).forEach(n => candidates.add(n.source_file));
    }

    return Array.from(candidates);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/optimizer.ts
git commit -m "feat(optimize): implement core OptimizerEngine"
```

---

### Task 4: CLI Integration

**Files:**
- Modify: `src/cli.ts`

- [ ] **Step 1: Add the `optimize` command**

```typescript
program
  .command('optimize')
  .description('Optimize context for a given prompt')
  .argument('<prompt>', 'The prompt to optimize for')
  .action(async (prompt) => {
    const client = new GraphClient(path.join(process.cwd(), 'graphify-out', 'graph.json'));
    const engine = new OptimizerEngine(client);
    const files = await engine.optimize(prompt);
    console.log('### Optimized Context Files:\n');
    files.forEach(f => console.log(`- ${f}`));
  });
```

---

### Task 5: MCP Integration

**Files:**
- Modify: `src/mcp-server.ts`

- [ ] **Step 1: Register `get_optimized_context` tool**

```typescript
{
  name: 'get_optimized_context',
  description: 'Returns a pruned list of files relevant to the user prompt.',
  inputSchema: {
    type: 'object',
    properties: {
      prompt: { type: 'string' }
    },
    required: ['prompt']
  }
}
```
