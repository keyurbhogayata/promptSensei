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

  it('extracts parsed diffs correctly', () => {
    const log = `## User\nUpdate it\n## Assistant\nHere is the diff:\n\`\`\`diff\n--- a/test.ts\n+++ b/test.ts\n@@ -1,1 +1,1 @@\n- var a = 1;\n+ var a = 2;\n\`\`\``;
    const turns = parseLog(log);
    expect(turns[0].assistantDiffs).toBeDefined();
    expect(turns[0].assistantDiffs.length).toBe(1);
    expect(turns[0].assistantDiffs[0].targetFile).toBe('test.ts');
    expect(turns[0].assistantDiffs[0].addedLines.join('\n')).toBe(' var a = 2;');
  });
});
