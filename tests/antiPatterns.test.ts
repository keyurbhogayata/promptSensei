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
});
