// src/calculator.ts
import { Turn } from './parser';

export interface WasteReport {
  totalTokens: number;
  wastedTokens: number;
  moneyWasted: number; // in USD
  wastedTurns: number[];
}

/**
 * Rough token estimator: 1 word ≈ 1.3 tokens (industry heuristic).
 */
function countTokens(text: string): number {
  if (!text.trim()) return 0;
  return Math.ceil(text.split(/\s+/).length * 1.3);
}

/**
 * Checks if any of the code blocks generated in a turn survived into the final tree.
 * Uses a whitespace-stripped fingerprint to be robust against formatting changes.
 */
function codeFoundInFinalTree(codeBlocks: string[], finalTreeContent: string): boolean {
  const strippedFinal = finalTreeContent.replace(/\s+/g, '');
  if (!strippedFinal) return false;

  return codeBlocks.some((code) => {
    const strippedCode = code.replace(/\s+/g, '');
    // Take the first 40 non-whitespace characters as a fingerprint
    const fingerprint = strippedCode.substring(0, 40);
    return fingerprint.length > 0 && strippedFinal.includes(fingerprint);
  });
}

export async function calculateWaste(
  turns: Turn[],
  finalTreeContent: string
): Promise<WasteReport> {
  let totalTokens = 0;
  let wastedTokens = 0;
  const wastedTurnsSet = new Set<number>();

  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i];
    const userTokens = countTokens(turn.user);
    const codeTokens = turn.assistantCodeBlocks.reduce(
      (acc, code) => acc + countTokens(code),
      0
    );
    const turnTokens = userTokens + codeTokens;
    totalTokens += turnTokens;

    // Flag the turn as wasted if the AI generated code that didn't survive
    if (
      turn.assistantCodeBlocks.length > 0 &&
      !codeFoundInFinalTree(turn.assistantCodeBlocks, finalTreeContent)
    ) {
      wastedTokens += turnTokens;
      wastedTurnsSet.add(i);
    }

    // Flag the previous turn as wasted if this turn contains negative feedback patterns
    const negFeedbackPatterns = /\b(error|wrong|no|fix|broken|failed|incorrect|redo|again)\b/i;
    if (negFeedbackPatterns.test(turn.user) && i > 0 && !wastedTurnsSet.has(i - 1)) {
      wastedTurnsSet.add(i - 1);
      // Approximate the previous turn's tokens if not already counted
      const prevTurn = turns[i - 1];
      const prevTokens =
        countTokens(prevTurn.user) +
        prevTurn.assistantCodeBlocks.reduce((acc, c) => acc + countTokens(c), 0);
      wastedTokens += prevTokens;
    }
  }

  // Price based on average of input/output cost (~$3/1M tokens for mid-tier models)
  const PRICE_PER_TOKEN = 3.0 / 1_000_000;

  return {
    totalTokens,
    wastedTokens,
    moneyWasted: wastedTokens * PRICE_PER_TOKEN,
    wastedTurns: [...wastedTurnsSet].sort((a, b) => a - b),
  };
}
