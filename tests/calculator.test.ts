// tests/calculator.test.ts
import { calculateWaste } from '../src/calculator';
import { Turn } from '../src/parser';

describe('calculateWaste', () => {
  it('should flag a turn as wasted if code is not in final tree', async () => {
    const turns: Turn[] = [{
      user: 'Make an add function',
      assistantCodeBlocks: ['function add(a, b) { return a + b; }']
    }];

    const finalTreeContent = 'function subtract(a, b) { return a - b; }';

    const report = await calculateWaste(turns, finalTreeContent);
    expect(report.wastedTokens).toBeGreaterThan(0);
    expect(report.wastedTurns).toContain(0);
  });

  it('should NOT flag a turn as wasted if code is present in final tree', async () => {
    const turns: Turn[] = [{
      user: 'Make a subtract function',
      assistantCodeBlocks: ['function subtract(a, b) { return a - b; }']
    }];

    const finalTreeContent = 'function subtract(a, b) { return a - b; }';

    const report = await calculateWaste(turns, finalTreeContent);
    expect(report.wastedTurns).not.toContain(0);
  });

  it('should count total tokens for all turns', async () => {
    const turns: Turn[] = [
      { user: 'hello world', assistantCodeBlocks: [] },
      { user: 'another prompt here', assistantCodeBlocks: ['const x = 1;'] }
    ];
    const report = await calculateWaste(turns, '');
    expect(report.totalTokens).toBeGreaterThan(0);
  });

  it('should calculate money wasted based on token count', async () => {
    const turns: Turn[] = [{
      user: 'Make an add function',
      assistantCodeBlocks: ['function add(a, b) { return a + b; }']
    }];
    const report = await calculateWaste(turns, '');
    expect(report.moneyWasted).toBeGreaterThanOrEqual(0);
  });
});
