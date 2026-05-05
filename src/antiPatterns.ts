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

    if (patterns.length > 0) {
      reports.push({
        turnIndex: index,
        antiPatterns: patterns
      });
    }
  });

  return reports;
}
