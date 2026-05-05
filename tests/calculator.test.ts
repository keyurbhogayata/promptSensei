// tests/calculator.test.ts
import { calculateWaste } from '../src/calculator';
import { Turn } from '../src/parser';

describe('calculateWaste', () => {
  it('should flag a turn as wasted if code is not in final tree', async () => {
    const turns: Turn[] = [{
      user: 'Make an add function',
      assistantDiffs: [], assistantCodeBlocks: ['function add(a, b) { return a + b; }']
    }];

    const finalTreeContent = 'function subtract(a, b) { return a - b; }';

    const report = await calculateWaste(turns, finalTreeContent);
    expect(report.wastedTokens).toBeGreaterThan(0);
    expect(report.wastedTurns).toContain(0);
  });

  it('should NOT flag a turn as wasted if code is present in final tree', async () => {
    const turns: Turn[] = [{
      user: 'Make a subtract function',
      assistantDiffs: [], assistantCodeBlocks: ['function subtract(a, b) { return a - b; }']
    }];

    const finalTreeContent = 'function subtract(a, b) { return a - b; }';

    const report = await calculateWaste(turns, finalTreeContent);
    expect(report.wastedTurns).not.toContain(0);
  });

  it('should count total tokens for all turns', async () => {
    const turns: Turn[] = [
      { user: 'hello world', assistantDiffs: [], assistantCodeBlocks: [] },
      { user: 'another prompt here', assistantDiffs: [], assistantCodeBlocks: ['const x = 1;'] }
    ];
    const report = await calculateWaste(turns, '');
    expect(report.totalTokens).toBeGreaterThan(0);
  });

  it('should calculate money wasted based on token count', async () => {
    const turns: Turn[] = [{
      user: 'Make an add function',
      assistantDiffs: [], assistantCodeBlocks: ['function add(a, b) { return a + b; }']
    }];
    const report = await calculateWaste(turns, '');
    expect(report.moneyWasted).toBeGreaterThanOrEqual(0);
  });

  it('should detect code survival even if only the middle part matches (multi-anchor)', async () => {
    // Shared core logic that should survive
    const coreLogic = 'function calculateInternal(val) { return val * 42 + Math.sqrt(val); }';
    const longCode = `/* License Header A */\n${coreLogic}\n// Footer A`;
    const turns: Turn[] = [{
      user: 'Write complex logic',
      assistantDiffs: [], assistantCodeBlocks: [longCode]
    }];

    // Final tree has different header/footer but same core logic
    const finalTree = `// Different Header B\n${coreLogic}\n/* Different Footer B */`;

    const report = await calculateWaste(turns, finalTree);
    expect(report.wastedTurns).not.toContain(0);
  });

  it('should NOT flag waste for false positive feedback like "no error"', async () => {
    const turns: Turn[] = [
      { user: 'Write a function', assistantDiffs: [], assistantCodeBlocks: ['const x = 1;'] },
      { user: 'There is no error here, good job.', assistantDiffs: [], assistantCodeBlocks: [] }
    ];
    // Final tree has the code
    const report = await calculateWaste(turns, 'const x = 1;');
    expect(report.wastedTurns).not.toContain(0);
  });

  it('should flag waste for explicit negative feedback like "instead of"', async () => {
    const turns: Turn[] = [
      { user: 'Write a function', assistantDiffs: [], assistantCodeBlocks: ['const x = 1;'] },
      { user: 'I wanted y instead of x', assistantDiffs: [], assistantCodeBlocks: [] }
    ];
    // Final tree doesn't have x
    const report = await calculateWaste(turns, 'const y = 1;');
    expect(report.wastedTurns).toContain(0);
  });
  
  it('should use different token counting for Gemini (char-approx) vs OpenAI (cl100k)', async () => {
    const turns: Turn[] = [{
      user: 'Long prompt with many characters but few tokens',
      assistantDiffs: [], assistantCodeBlocks: ['const x = 1;']
    }];
    
    const reportGPT = await calculateWaste(turns, '', 'gpt-5-5');
    const reportGemini = await calculateWaste(turns, '', 'gemini-3-1-flash');
    
    // Character approximation for Gemini (chars/4) vs BPE for GPT
    expect(reportGPT.totalTokens).not.toBe(reportGemini.totalTokens);
    expect(reportGemini.moneyWasted).toBeLessThan(reportGPT.moneyWasted);
  });

  it('should flag a turn as wasted if diff addedLines are not in final tree', async () => {
    const turns: Turn[] = [{
      user: 'Update the file',
      assistantCodeBlocks: [],
      assistantDiffs: [{
        targetFile: 'a.js',
        searchLines: [],
        addedLines: ['function newLogic() { return true; }']
      }]
    }];

    const finalTreeContent = 'function subtract(a, b) { return a - b; }';

    const report = await calculateWaste(turns, finalTreeContent);
    expect(report.wastedTokens).toBeGreaterThan(0);
    expect(report.wastedTurns).toContain(0);
  });

  it('should NOT flag a turn as wasted if diff addedLines survive', async () => {
    const turns: Turn[] = [{
      user: 'Update the file',
      assistantCodeBlocks: [],
      assistantDiffs: [{
        targetFile: 'a.js',
        searchLines: [],
        addedLines: ['function newLogic() { return true; }']
      }]
    }];

    const finalTreeContent = 'function something() {}\nfunction newLogic() { return true; }';

    const report = await calculateWaste(turns, finalTreeContent);
    expect(report.wastedTurns).not.toContain(0);
  });
});
