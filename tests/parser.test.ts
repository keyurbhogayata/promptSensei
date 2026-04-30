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

  it('should return empty array for logs with no user turns', () => {
    const turns = parseLog('No structured content here');
    expect(turns.length).toBe(0);
  });

  it('should handle multiple turns', () => {
    const logContent = `
## User
First question

## Assistant
First answer

## User
Second question

## Assistant
Second answer with code:
\`\`\`python
x = 1
\`\`\`
`;
    const turns = parseLog(logContent);
    expect(turns.length).toBe(2);
    expect(turns[1].assistantCodeBlocks).toContain('x = 1');
  });

  it('should extract code from SEARCH/REPLACE blocks', () => {
    const logContent = `
## User
Change the function

## Assistant
I will update it:
\`\`\`
<<<< SEARCH
function old() {}
====
function updated() {
  console.log("Improved");
}
>>>>
\`\`\`
`;
    const turns = parseLog(logContent);
    expect(turns.length).toBe(1);
    expect(turns[0].assistantCodeBlocks).toContain('function updated() {\n  console.log("Improved");\n}');
  });
});
