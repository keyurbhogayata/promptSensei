import { generateCoachingPrompt } from '../src/advisor';
import { Turn } from '../src/parser';

describe('generateCoachingPrompt', () => {
  it('should generate a prompt containing only the wasted turns', () => {
    const turns: Turn[] = [
      { user: 'Turn 0 good', assistantCodeBlocks: ['good code'] },
      { user: 'Turn 1 bad', assistantCodeBlocks: ['bad code'] },
      { user: 'Turn 2 okay', assistantCodeBlocks: ['okay code'] },
      { user: 'Turn 3 bad again', assistantCodeBlocks: ['bad code 2'] },
    ];
    const wastedIndices = [1, 3];

    const prompt = generateCoachingPrompt(turns, wastedIndices);

    expect(prompt).toContain('Turn 1');
    expect(prompt).toContain('Turn 1 bad');
    expect(prompt).toContain('Turn 3');
    expect(prompt).toContain('Turn 3 bad again');
    
    // Should not contain non-wasted turns
    expect(prompt).not.toContain('Turn 0 good');
    expect(prompt).not.toContain('Turn 2 okay');
  });

  it('should handle empty wasted indices gracefully', () => {
    const turns: Turn[] = [
      { user: 'Turn 0 good', assistantCodeBlocks: ['good code'] }
    ];
    const prompt = generateCoachingPrompt(turns, []);
    expect(prompt).toBe('');
  });
});
