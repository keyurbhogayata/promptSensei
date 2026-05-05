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
