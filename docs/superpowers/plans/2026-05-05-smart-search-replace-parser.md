# Smart Search/Replace Diff Parser Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a sophisticated AST/Regex-based parser that natively understands both `<<<< SEARCH ==== REPLACE >>>>` blocks and Unified Diffs (`--- a/file +++ b/file`), extracting the exact "added" code and target files to accurately calculate AI token waste without false positives.

**Architecture:** 
- `src/parser.ts` will be upgraded to export a new `ParsedDiff` interface rather than just raw code blocks. It will parse line-by-line to handle Unified Diffs, isolating `+` lines as the intended new code.
- `src/calculator.ts` will be updated to check these extracted `ParsedDiff` objects against the final tree. If a target file is known, it will limit its search space to that specific file for higher accuracy.

**Tech Stack:** TypeScript, Node.js (Regex & String Manipulation), Jest (Testing)

---

### Task 1: Define Diff Interfaces & Update Types

**Files:**
- Modify: `src/parser.ts`
- Modify: `tests/parser.test.ts` (if exists, or create it)

- [ ] **Step 1: Write the failing test**
Create or update `tests/parser.test.ts`:
```typescript
import { parseLog, ParsedDiff } from '../src/parser';

describe('Diff Parser', () => {
  it('extracts parsed diffs correctly', () => {
    const log = `## Assistant\nHere is the diff:\n\`\`\`diff\n--- a/test.ts\n+++ b/test.ts\n@@ -1,1 +1,1 @@\n- var a = 1;\n+ var a = 2;\n\`\`\``;
    const turns = parseLog(log);
    expect(turns[0].assistantDiffs.length).toBe(1);
    expect(turns[0].assistantDiffs[0].targetFile).toBe('test.ts');
    expect(turns[0].assistantDiffs[0].addedLines.join('\\n')).toBe('var a = 2;');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test`
Expected: FAIL because `assistantDiffs` does not exist on `Turn`.

- [ ] **Step 3: Write minimal implementation**
Update `src/parser.ts`:
```typescript
export interface ParsedDiff {
  targetFile: string | null;
  searchLines: string[];
  addedLines: string[];
}

export interface Turn {
  user: string;
  assistantCodeBlocks: string[];
  assistantDiffs: ParsedDiff[];
}

// Update parseLog return type and createTurn signature.
// Initialize assistantDiffs as an empty array for now.
```
Update `src/calculator.ts` and `src/advisor.ts` to accommodate the new `Turn` structure so the compiler doesn't break.

- [ ] **Step 4: Run test to verify compilation and specific test failure**
Run: `npm test`
Expected: Compiles, but `expect(turns[0].assistantDiffs.length).toBe(1)` fails.

- [ ] **Step 5: Commit**
```bash
git add src/parser.ts src/calculator.ts src/advisor.ts tests/parser.test.ts
git commit -m "refactor: add ParsedDiff types to parser"
```

---

### Task 2: Implement Unified Diff Parsing

**Files:**
- Modify: `src/parser.ts`
- Modify: `tests/parser.test.ts`

- [ ] **Step 1: Write the failing test**
Add to `tests/parser.test.ts`:
```typescript
it('parses unified diffs without context line pollution', () => {
  const diff = `--- a/src/App.tsx\n+++ b/src/App.tsx\n@@ -10,2 +10,2 @@\n function App() {\n-  return <Old />;\n+  return <New />;\n }`;
  // Test the standalone unified diff extractor function
  const parsed = extractUnifiedDiffs(diff);
  expect(parsed[0].targetFile).toBe('src/App.tsx');
  expect(parsed[0].addedLines).toEqual(['  return <New />;']);
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test`
Expected: FAIL with "extractUnifiedDiffs is not defined".

- [ ] **Step 3: Write minimal implementation**
Add to `src/parser.ts`:
```typescript
export function extractUnifiedDiffs(text: string): ParsedDiff[] {
  const diffs: ParsedDiff[] = [];
  const diffRegex = /--- a\/(.+?)\n\+\+\+ b\/.+?\n([\s\S]*?)(?=--- a\/|$)/g;
  
  let match;
  while ((match = diffRegex.exec(text)) !== null) {
    const targetFile = match[1].trim();
    const body = match[2];
    
    const addedLines: string[] = [];
    const searchLines: string[] = [];
    
    const lines = body.split('\\n');
    for (const line of lines) {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        addedLines.push(line.substring(1));
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        searchLines.push(line.substring(1));
      }
    }
    
    diffs.push({ targetFile, addedLines, searchLines });
  }
  return diffs;
}
```
Update `createTurn` to use `extractUnifiedDiffs` and push to `assistantDiffs`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/parser.ts tests/parser.test.ts
git commit -m "feat: parse unified diff format"
```

---

### Task 3: Refactor Search/Replace Parsing

**Files:**
- Modify: `src/parser.ts`
- Modify: `tests/parser.test.ts`

- [ ] **Step 1: Write the failing test**
Add to `tests/parser.test.ts`:
```typescript
it('extracts target file and search blocks from SEARCH/REPLACE', () => {
  const sr = `<<<< SEARCH\noldCode\n====\nnewCode\n>>>>`;
  const parsed = extractSearchReplaceBlocks(sr);
  expect(parsed[0].searchLines).toEqual(['oldCode']);
  expect(parsed[0].addedLines).toEqual(['newCode']);
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test`
Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**
Update `extractSearchReplace` in `src/parser.ts` to `extractSearchReplaceBlocks` returning `ParsedDiff[]`:
```typescript
export function extractSearchReplaceBlocks(text: string): ParsedDiff[] {
  const results: ParsedDiff[] = [];
  const srRegex = /<<<<(?:<<<)? SEARCH[\s\S]*?\n([\s\S]*?)\n====(?:===)?([\s\S]*?)>>>>(?:>>>)?/g;
  
  let match;
  while ((match = srRegex.exec(text)) !== null) {
    results.push({
      targetFile: null, // Hard to extract from standard SR unless prefixed
      searchLines: match[1].trim().split('\\n'),
      addedLines: match[2].trim().split('\\n')
    });
  }
  return results;
}
```
Integrate this into `createTurn`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/parser.ts tests/parser.test.ts
git commit -m "refactor: upgrade search/replace parsing to use ParsedDiff"
```

---

### Task 4: Upgrade Calculator Diff Survival Checking

**Files:**
- Modify: `src/calculator.ts`

- [ ] **Step 1: Write the failing test**
Update `tests/calculator.test.ts` (or create it) to test the new survival check.

- [ ] **Step 2: Write minimal implementation**
Update `src/calculator.ts`:
```typescript
import { ParsedDiff } from './parser';

function diffFoundInFinalTree(diffs: ParsedDiff[], finalTreeContent: string): boolean {
  if (diffs.length === 0) return true; // If no diffs, fallback to code block checks

  const strippedFinal = finalTreeContent.replace(/\\s+/g, '');
  
  return diffs.some((diff) => {
    // Reconstruct the added code
    const addedCode = diff.addedLines.join('\\n').replace(/\\s+/g, '');
    if (!addedCode) return false;
    
    // In a real advanced scenario, if targetFile is present, we'd search ONLY in that file section
    return strippedFinal.includes(addedCode);
  });
}
```
Update `calculateWaste` loop to check BOTH `turn.assistantCodeBlocks` and `turn.assistantDiffs`. If diffs exist, and they failed to survive, flag as waste.

- [ ] **Step 3: Run test to verify it passes**
Run: `npm test`
Expected: PASS

- [ ] **Step 4: Commit**
```bash
git add src/calculator.ts
git commit -m "feat: use ParsedDiffs for accurate waste calculation"
```
