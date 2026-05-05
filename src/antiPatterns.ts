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
