# AI Coach Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Node.js CLI tool and MCP server that analyzes AI coding sessions to calculate wasted tokens and provide coaching advice.

**Architecture:** A modular Node.js application using TypeScript. Core consists of a parser for chat logs, a Git diff integration, a heuristic calculator for token waste, and an LLM advisor for qualitative feedback. It exposes both a standard CLI and an MCP server interface.

**Tech Stack:** Node.js, TypeScript, Jest (testing), Commander.js (CLI), @modelcontextprotocol/sdk (MCP), simple-git (Git diffs).

---

### Task 1: Project Setup and Testing Foundation

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `jest.config.js`
- Create: `src/index.ts`
- Create: `tests/index.test.ts`

- [ ] **Step 1: Write initial test for the entry point**
```typescript
// tests/index.test.ts
import { runCoach } from '../src/index';

describe('runCoach', () => {
  it('should return a basic success object when called', () => {
    const result = runCoach();
    expect(result).toEqual({ success: true, message: 'AI Coach initialized' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test tests/index.test.ts`
Expected: FAIL due to missing files and setup.

- [ ] **Step 3: Initialize project configuration**
```bash
npm init -y
npm install --save-dev typescript @types/node jest ts-jest @types/jest
npx tsc --init
```
Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```
Update `jest.config.js`:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
};
```
Update `package.json` scripts:
```json
  "scripts": {
    "build": "tsc",
    "test": "jest"
  }
```

- [ ] **Step 4: Write minimal implementation**
```typescript
// src/index.ts
export function runCoach() {
  return { success: true, message: 'AI Coach initialized' };
}
```

- [ ] **Step 5: Run test to verify it passes**
Run: `npm run test`
Expected: PASS

- [ ] **Step 6: Commit**
```bash
git add package.json tsconfig.json jest.config.js src/index.ts tests/index.test.ts
git commit -m "chore: setup typescript project and jest"
```

---

### Task 2: Implement the Log Parser

**Files:**
- Create: `src/parser.ts`
- Create: `tests/parser.test.ts`

- [ ] **Step 1: Write the failing test**
```typescript
// tests/parser.test.ts
import { parseLog } from '../src/parser';

describe('parseLog', () => {
  it('should extract turns from a markdown chat log', () => {
    const logContent = `
## User
Write a function

## Assistant
Here is the code:
\`\`\`javascript
function add(a, b) { return a + b; }
\`\`\`
`;
    const turns = parseLog(logContent);
    expect(turns.length).toBe(1);
    expect(turns[0].user).toBe('Write a function');
    expect(turns[0].assistantCodeBlocks).toContain('function add(a, b) { return a + b; }');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm run test tests/parser.test.ts`
Expected: FAIL "parseLog is not a function"

- [ ] **Step 3: Write minimal implementation**
```typescript
// src/parser.ts
export interface Turn {
  user: string;
  assistantCodeBlocks: string[];
}

export function parseLog(content: string): Turn[] {
  const turns: Turn[] = [];
  const parts = content.split('## User');
  
  for (let i = 1; i < parts.length; i++) {
    const section = parts[i];
    const [userPart, ...assistantParts] = section.split('## Assistant');
    
    const user = userPart.trim();
    const assistant = assistantParts.join('## Assistant');
    
    const codeBlocks: string[] = [];
    const codeRegex = /```[\w]*\n([\s\S]*?)```/g;
    let match;
    while ((match = codeRegex.exec(assistant)) !== null) {
      codeBlocks.push(match[1].trim());
    }
    
    turns.push({ user, assistantCodeBlocks: codeBlocks });
  }
  
  return turns;
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npm run test tests/parser.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/parser.ts tests/parser.test.ts
git commit -m "feat: add markdown log parser"
```

---

### Task 3: Implement the Heuristics Calculator

**Files:**
- Create: `src/calculator.ts`
- Create: `tests/calculator.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Install dependencies**
```bash
npm install simple-git
```

- [ ] **Step 2: Write the failing test**
```typescript
// tests/calculator.test.ts
import { calculateWaste } from '../src/calculator';
import { Turn } from '../src/parser';

describe('calculateWaste', () => {
  it('should flag a turn as wasted if code is not in final diff', async () => {
    const turns: Turn[] = [{
      user: 'Make an add function',
      assistantCodeBlocks: ['function add(a, b) { return a + b; }']
    }];
    
    // Mock the working tree content
    const finalTreeContent = 'function subtract(a, b) { return a - b; }';
    
    const report = await calculateWaste(turns, finalTreeContent);
    expect(report.wastedTokens).toBeGreaterThan(0);
    expect(report.wastedTurns).toContain(0);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**
Run: `npm run test tests/calculator.test.ts`
Expected: FAIL "calculateWaste is not a function"

- [ ] **Step 4: Write minimal implementation**
```typescript
// src/calculator.ts
import { Turn } from './parser';

export interface WasteReport {
  totalTokens: number;
  wastedTokens: number;
  moneyWasted: number; // in USD
  wastedTurns: number[];
}

export async function calculateWaste(turns: Turn[], finalTreeContent: string): Promise<WasteReport> {
  let totalTokens = 0;
  let wastedTokens = 0;
  const wastedTurns: number[] = [];
  
  // Rough estimation: 1 word = ~1.3 tokens
  const countTokens = (text: string) => Math.ceil(text.split(/\s+/).length * 1.3);

  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i];
    const userTokens = countTokens(turn.user);
    const codeTokens = turn.assistantCodeBlocks.reduce((acc, code) => acc + countTokens(code), 0);
    
    const turnTokens = userTokens + codeTokens;
    totalTokens += turnTokens;
    
    // If the assistant generated code, but it's not present in the final tree, consider it wasted
    if (turn.assistantCodeBlocks.length > 0) {
      const codeFound = turn.assistantCodeBlocks.some(code => finalTreeContent.includes(code.substring(0, 20))); // Check substring
      if (!codeFound) {
        wastedTokens += turnTokens;
        wastedTurns.push(i);
      }
    }
    
    // Check for negative feedback in user prompt
    const negFeedback = turn.user.toLowerCase().includes('error') || turn.user.toLowerCase().includes('no');
    if (negFeedback && i > 0 && !wastedTurns.includes(i - 1)) {
      wastedTurns.push(i - 1);
      // Rough approximation of previous turn tokens
      wastedTokens += 100; // Arbitrary placeholder for previous turn
    }
  }

  return {
    totalTokens,
    wastedTokens,
    moneyWasted: (wastedTokens / 1000000) * 3.0, // Assuming $3/1M tokens avg
    wastedTurns: [...new Set(wastedTurns)]
  };
}
```

- [ ] **Step 5: Run test to verify it passes**
Run: `npm run test tests/calculator.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**
```bash
git add src/calculator.ts tests/calculator.test.ts package.json package-lock.json
git commit -m "feat: add heuristic waste calculator"
```

---

### Task 4: Implement the CLI Wrapper

**Files:**
- Create: `src/cli.ts`
- Modify: `package.json`

- [ ] **Step 1: Install dependencies**
```bash
npm install commander
```

- [ ] **Step 2: Add bin configuration to package.json**
Modify `package.json` to include:
```json
  "bin": {
    "ai-coach": "./dist/cli.js"
  }
```

- [ ] **Step 3: Write CLI implementation**
```typescript
// src/cli.ts
#!/usr/bin/env node
import { Command } from 'commander';
import { parseLog } from './parser';
import { calculateWaste } from './calculator';
import * as fs from 'fs';

const program = new Command();

program
  .name('ai-coach')
  .description('Analyze AI coding sessions for wasted tokens')
  .version('1.0.0');

program
  .command('review <logPath>')
  .description('Review a chat log file')
  .action(async (logPath) => {
    try {
      const logContent = fs.readFileSync(logPath, 'utf-8');
      const turns = parseLog(logContent);
      
      // For MVP, we simulate the git working tree with a dummy string
      // In production, we would use simple-git to get current file contents
      const currentTree = ""; 
      
      const report = await calculateWaste(turns, currentTree);
      
      console.log('📊 Session Review');
      console.log(`- Total Tokens Used: ${report.totalTokens}`);
      console.log(`- Wasted Tokens: ${report.wastedTokens} (${Math.round((report.wastedTokens/report.totalTokens)*100 || 0)}%)`);
      console.log(`- Money Wasted: $${report.moneyWasted.toFixed(4)}`);
      
    } catch (err) {
      console.error('Error analyzing session:', err);
    }
  });

program.parse();
```

- [ ] **Step 4: Verify Compilation**
Run: `npm run build`
Expected: dist/cli.js is generated successfully.

- [ ] **Step 5: Commit**
```bash
git add src/cli.ts package.json package-lock.json
git commit -m "feat: add basic CLI wrapper"
```

---

### Task 5: Implement MCP Server Integration

**Files:**
- Create: `src/mcp-server.ts`
- Modify: `package.json`

- [ ] **Step 1: Install dependencies**
```bash
npm install @modelcontextprotocol/sdk
```

- [ ] **Step 2: Write MCP Server implementation**
```typescript
// src/mcp-server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { parseLog } from './parser';
import { calculateWaste } from './calculator';

const server = new Server(
  { name: "ai-coach", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "review_session",
        description: "Review a chat session log and calculate token waste",
        inputSchema: {
          type: "object",
          properties: {
            logContent: { type: "string", description: "The markdown content of the chat log" },
            finalFileContent: { type: "string", description: "The current content of the relevant modified files" }
          },
          required: ["logContent", "finalFileContent"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "review_session") {
    const { logContent, finalFileContent } = request.params.arguments as any;
    const turns = parseLog(logContent);
    const report = await calculateWaste(turns, finalFileContent);
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify(report, null, 2)
      }]
    };
  }
  throw new Error(`Tool not found: ${request.params.name}`);
});

export async function startMcpServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AI Coach MCP Server running on stdio");
}

// Start if run directly
if (require.main === module) {
  startMcpServer().catch(console.error);
}
```

- [ ] **Step 3: Verify compilation**
Run: `npm run build`
Expected: builds successfully

- [ ] **Step 4: Commit**
```bash
git add src/mcp-server.ts package.json package-lock.json
git commit -m "feat: add MCP server integration"
```
