// src/antiPatterns.ts
import { Turn } from './parser';

export type AntiPatternType = 'Vague Debugging' | 'Context Dumping' | 'One More Thing Trap';

export interface AntiPatternReport {
  turnIndex: number;
  antiPatterns: AntiPatternType[];
}

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

    // Context Dumping: Input length exceeds 1500 characters
    if (userInput.length > 1500) {
      patterns.push('Context Dumping');
    }

    // One More Thing Trap: Turn index >= 3 and starts with specific "add-on" phrases
    const oneMoreThingPhrases = ['also', 'one more thing', 'by the way', 'additionally', 'wait'];
    if (index >= 3 && oneMoreThingPhrases.some(phrase => userInput.startsWith(phrase))) {
      patterns.push('One More Thing Trap');
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
