// src/calculator.ts
import { encode } from 'gpt-tokenizer';
import { Turn, ParsedDiff } from './parser';

export interface WasteReport {
  totalTokens: number;
  wastedTokens: number;
  moneyWasted: number; // in USD
  wastedTurns: number[];
}

export type ModelProvider = 'gpt-5-5' | 'claude-4-7-opus' | 'claude-4-7-sonnet' | 'claude-4-7-haiku' | 'gemini-3-1-pro' | 'gemini-3-1-flash' | 'generic';

export interface ModelProfile {
  name: string;
  pricePerMillion: number; // USD
  tokenizer: 'cl100k' | 'char-approx';
}

const MODEL_PROFILES: Record<ModelProvider, ModelProfile> = {
  'gpt-5-5': { name: 'GPT-5.5 (Agentic)', pricePerMillion: 5.0, tokenizer: 'cl100k' },
  'claude-4-7-opus': { name: 'Claude 4.7 Opus', pricePerMillion: 8.0, tokenizer: 'cl100k' },
  'claude-4-7-sonnet': { name: 'Claude 4.7 Sonnet', pricePerMillion: 3.0, tokenizer: 'cl100k' },
  'claude-4-7-haiku': { name: 'Claude 4.7 Haiku', pricePerMillion: 0.25, tokenizer: 'cl100k' },
  'gemini-3-1-pro': { name: 'Gemini 3.1 Pro', pricePerMillion: 1.25, tokenizer: 'char-approx' },
  'gemini-3-1-flash': { name: 'Gemini 3.1 Flash', pricePerMillion: 0.05, tokenizer: 'char-approx' },
  'generic': { name: 'Generic Frontier Model', pricePerMillion: 2.0, tokenizer: 'cl100k' },
};

/**
 * Estimator using chosen strategy.
 */
function countTokens(text: string, profile: ModelProfile): number {
  if (!text.trim()) return 0;
  
  if (profile.tokenizer === 'cl100k') {
    return encode(text).length;
  } else {
    // Gemini/Character-based approximation (approx 4 chars per token)
    return Math.ceil(text.length / 4);
  }
}

/**
 * Checks if any of the code blocks or parsed diffs generated in a turn survived into the final tree.
 * Uses multi-anchor fingerprinting to be robust against partial changes or generic headers.
 */
function codeFoundInFinalTree(codeBlocks: string[], diffs: ParsedDiff[], finalTreeContent: string): boolean {
  if (codeBlocks.length === 0 && diffs.length === 0) return true;

  const strippedFinal = finalTreeContent.replace(/\s+/g, '');
  if (!strippedFinal) return false;

  const isBlockFound = codeBlocks.some((code) => {
    const strippedCode = code.replace(/\s+/g, '');
    if (strippedCode.length < 20) return strippedFinal.includes(strippedCode);

    // Multi-anchor fingerprinting: check start, middle, and end
    const len = strippedCode.length;
    const fingerprints = [
      strippedCode.substring(0, 50), // Start
      strippedCode.substring(Math.floor(len / 2) - 25, Math.floor(len / 2) + 25), // Middle
      strippedCode.substring(len - 50), // End
    ].filter(f => f.length >= 20);

    // If any significant anchor is found, we assume the code (or its logic) survived
    return fingerprints.some((f) => strippedFinal.includes(f));
  });

  if (isBlockFound) return true;

  return diffs.some((diff) => {
    if (diff.addedLines.length === 0) return false;
    const addedCode = diff.addedLines.join('\n');
    const strippedCode = addedCode.replace(/\s+/g, '');
    if (strippedCode.length < 20) return strippedFinal.includes(strippedCode);

    const len = strippedCode.length;
    const fingerprints = [
      strippedCode.substring(0, 50),
      strippedCode.substring(Math.floor(len / 2) - 25, Math.floor(len / 2) + 25),
      strippedCode.substring(len - 50),
    ].filter(f => f.length >= 20);

    return fingerprints.some((f) => strippedFinal.includes(f));
  });
}

export async function calculateWaste(
  turns: Turn[],
  finalTreeContent: string,
  provider: ModelProvider = 'generic'
): Promise<WasteReport> {
  const profile = MODEL_PROFILES[provider] || MODEL_PROFILES['generic'];
  let totalTokens = 0;
  let wastedTokens = 0;
  const wastedTurnsSet = new Set<number>();

  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i];
    const userTokens = countTokens(turn.user, profile);
    const codeTokens = turn.assistantCodeBlocks.reduce(
      (acc, code) => acc + countTokens(code, profile),
      0
    );
    const diffTokens = turn.assistantDiffs.reduce(
      (acc, diff) => acc + countTokens([diff.targetFile || '', ...diff.searchLines, ...diff.addedLines].join('\n'), profile),
      0
    );
    const turnTokens = userTokens + codeTokens + diffTokens;
    totalTokens += turnTokens;

    // Flag the turn as wasted if the AI generated code that didn't survive
    if (
      (turn.assistantCodeBlocks.length > 0 || turn.assistantDiffs.length > 0) &&
      !codeFoundInFinalTree(turn.assistantCodeBlocks, turn.assistantDiffs, finalTreeContent)
    ) {
      wastedTokens += turnTokens;
      wastedTurnsSet.add(i);
    }

    // Flag the previous turn as wasted if this turn contains explicit negative feedback
    const negFeedbackPatterns = /\b(error|wrong|fix|broken|failed|incorrect|redo|not work|instead of|refactor again)\b/i;
    const falsePositivePatterns = /\b(no error|no problem|no issues|without error)\b/i;

    if (
      negFeedbackPatterns.test(turn.user) && 
      !falsePositivePatterns.test(turn.user) &&
      i > 0 && 
      !wastedTurnsSet.has(i - 1)
    ) {
      wastedTurnsSet.add(i - 1);
      const prevTurn = turns[i - 1];
      const prevTokens =
        countTokens(prevTurn.user, profile) +
        prevTurn.assistantCodeBlocks.reduce((acc, c) => acc + countTokens(c, profile), 0) +
        prevTurn.assistantDiffs.reduce(
          (acc, diff) => acc + countTokens([diff.targetFile || '', ...diff.searchLines, ...diff.addedLines].join('\n'), profile),
          0
        );
      wastedTokens += prevTokens;
    }
  }

  return {
    totalTokens,
    wastedTokens,
    moneyWasted: wastedTokens * (profile.pricePerMillion / 1_000_000),
    wastedTurns: [...wastedTurnsSet].sort((a, b) => a - b),
  };
}
