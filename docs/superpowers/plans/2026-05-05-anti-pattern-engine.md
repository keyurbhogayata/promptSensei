# Anti-Pattern Detection Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deterministic heuristic engine that analyzes user prompts and flags specific Prompt Engineering Anti-Patterns (Vague Debugging, Context Dumping, One More Thing Trap).

**Architecture:** A new module `src/antiPatterns.ts` will parse conversational turns and run heuristic checks on the user input. It will return a list of identified anti-patterns for each turn. Tests will be added in `tests/antiPatterns.test.ts`. Finally, we will export this module from `src/index.ts`.

**Tech Stack:** Node.js, TypeScript, Jest.

---

### Task 1: Create Anti-Pattern Interfaces and Basic Structure

**Files:**
- Create: `src/antiPatterns.ts`
- Create: `tests/antiPatterns.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/antiPatterns.test.ts
import { detectAntiPatterns } from '../src/antiPatterns';
import { Turn } from '../src/parser';

describe('Anti-Pattern Detection', () => {
  it('should return an empty array if no anti-patterns are detected', () => {
    const turns: Turn[] = [{
      user: 'Please implement a function that calculates the fibonacci sequence.',
      assistantCodeBlocks: [],
      assistantDiffs: []
    }];
    const result = detectAntiPatterns(turns);
    expect(result).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/antiPatterns.test.ts`
Expected: FAIL with "Cannot find module '../src/antiPatterns'"

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/antiPatterns.ts
import { Turn } from './parser';

export type AntiPatternType = 'Vague Debugging' | 'Context Dumping' | 'One More Thing Trap';

export interface AntiPatternReport {
  turnIndex: number;
  antiPatterns: AntiPatternType[];
}

export function detectAntiPatterns(turns: Turn[]): AntiPatternReport[] {
  return [];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/antiPatterns.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/antiPatterns.ts tests/antiPatterns.test.ts
git commit -m "feat(antiPatterns): scaffold anti-pattern detection engine"
```

---

### Task 2: Implement "Vague Debugging" Heuristic

**Files:**
- Modify: `src/antiPatterns.ts`
- Modify: `tests/antiPatterns.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// Append to tests/antiPatterns.test.ts
  it('should detect Vague Debugging', () => {
    const turns: Turn[] = [{
      user: 'it is broken fix the error',
      assistantCodeBlocks: [],
      assistantDiffs: []
    }];
    const result = detectAntiPatterns(turns);
    expect(result.length).toBe(1);
    expect(result[0].turnIndex).toBe(0);
    expect(result[0].antiPatterns).toContain('Vague Debugging');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/antiPatterns.test.ts`
Expected: FAIL (returns empty array)

- [ ] **Step 3: Write minimal implementation**

```typescript
// Update src/antiPatterns.ts
export function detectAntiPatterns(turns: Turn[]): AntiPatternReport[] {
  const reports: AntiPatternReport[] = [];

  turns.forEach((turn, index) => {
    const patterns: AntiPatternType[] = [];
    const userInput = turn.user.trim().toLowerCase();

    // Vague Debugging: Less than 50 characters and contains complaint keywords
    const complaintWords = ['broken', 'error', 'not working', 'fix', 'failed', 'bug'];
    if (userInput.length < 50 && complaintWords.some(word => userInput.includes(word))) {
      patterns.push('Vague Debugging');
    }

    if (patterns.length > 0) {
      reports.push({
        turnIndex: index,
        antiPatterns: patterns
      });
    }
  });

  return reports;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/antiPatterns.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/antiPatterns.ts tests/antiPatterns.test.ts
git commit -m "feat(antiPatterns): implement vague debugging heuristic"
```

---

### Task 3: Implement "Context Dumping" Heuristic

**Files:**
- Modify: `src/antiPatterns.ts`
- Modify: `tests/antiPatterns.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// Append to tests/antiPatterns.test.ts
  it('should detect Context Dumping', () => {
    // Generate a long string to simulate context dumping
    const longInput = 'Here is my code. ' + 'a'.repeat(2000);
    const turns: Turn[] = [{
      user: longInput,
      assistantCodeBlocks: [],
      assistantDiffs: []
    }];
    const result = detectAntiPatterns(turns);
    expect(result.length).toBe(1);
    expect(result[0].antiPatterns).toContain('Context Dumping');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/antiPatterns.test.ts`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```typescript
// Update src/antiPatterns.ts inside the turns.forEach block
    // Context Dumping: Input length exceeds 1500 characters
    if (userInput.length > 1500) {
      patterns.push('Context Dumping');
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/antiPatterns.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/antiPatterns.ts tests/antiPatterns.test.ts
git commit -m "feat(antiPatterns): implement context dumping heuristic"
```

---

### Task 4: Implement "One More Thing" Trap Heuristic

**Files:**
- Modify: `src/antiPatterns.ts`
- Modify: `tests/antiPatterns.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// Append to tests/antiPatterns.test.ts
  it('should detect One More Thing Trap on late turns', () => {
    const turns: Turn[] = [
      { user: '1', assistantCodeBlocks: [], assistantDiffs: [] },
      { user: '2', assistantCodeBlocks: [], assistantDiffs: [] },
      { user: '3', assistantCodeBlocks: [], assistantDiffs: [] },
      { user: 'also can you do this', assistantCodeBlocks: [], assistantDiffs: [] } // Turn index 3 (4th turn)
    ];
    const result = detectAntiPatterns(turns);
    expect(result.length).toBe(1);
    expect(result[0].turnIndex).toBe(3);
    expect(result[0].antiPatterns).toContain('One More Thing Trap');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/antiPatterns.test.ts`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```typescript
// Update src/antiPatterns.ts inside the turns.forEach block
    // One More Thing Trap: Turn index >= 3 and starts with specific "add-on" phrases
    const oneMoreThingPhrases = ['also', 'one more thing', 'by the way', 'additionally', 'wait'];
    if (index >= 3 && oneMoreThingPhrases.some(phrase => userInput.startsWith(phrase))) {
      patterns.push('One More Thing Trap');
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/antiPatterns.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/antiPatterns.ts tests/antiPatterns.test.ts
git commit -m "feat(antiPatterns): implement one more thing trap heuristic"
```

---

### Task 5: Export Module in index.ts

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Update src/index.ts**

```typescript
// Add export to src/index.ts
export { detectAntiPatterns, AntiPatternReport, AntiPatternType } from './antiPatterns';
```

- [ ] **Step 2: Verify project builds**

Run: `npm run build` (or equivalent typescript check `npx tsc --noEmit`)
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat(api): export anti-pattern detection engine"
```
