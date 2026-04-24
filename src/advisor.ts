// src/advisor.ts
import { Turn } from './parser';

export function generateCoachingPrompt(turns: Turn[], wastedIndices: number[]): string {
  if (wastedIndices.length === 0) return '';

  let prompt = 'You are an AI Prompt Engineering Coach.\n';
  prompt += 'I have analyzed a coding session and identified the following turns as "wasted" (the generated code was discarded or required immediate correction).\n\n';
  prompt += 'Please analyze why these turns were wasteful. Was it a lack of context? Poor phrasing? Ambiguity?\n';
  prompt += 'Provide a concise "Coaching Tip" for the user to improve their prompting.\n\n';
  prompt += '### Wasted Context:\n\n';

  for (const index of wastedIndices) {
    if (index >= 0 && index < turns.length) {
      const turn = turns[index];
      prompt += `--- Turn ${index} ---\n`;
      prompt += `User Prompt: ${turn.user}\n`;
      prompt += `Generated Code Snippets: ${turn.assistantCodeBlocks.length}\n\n`;
    }
  }

  return prompt.trim();
}

export async function getAdviceFromLLM(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return '';
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      return `Failed to fetch advice (API Error: ${response.status})`;
    }

    const data = await response.json() as any;
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No advice generated.';
  } catch (error) {
    return 'Failed to fetch advice from LLM.';
  }
}
