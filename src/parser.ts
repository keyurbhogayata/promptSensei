// src/parser.ts
export interface ParsedDiff {
  targetFile: string | null;
  searchLines: string[];
  addedLines: string[];
}

export interface Turn {
  user: string;
  assistantCodeBlocks: string[];
  assistantDiffs: ParsedDiff[];
}

export function parseLog(content: string): Turn[] {
  const turns: Turn[] = [];
  const splitRegex = /^(?:#+\s*|\*\*|__)?(User|Human|Assistant|AI|Claude|Gemini)(?:\*\*|__)?\s*:?\s*$/mig;
  
  const parts = content.split(splitRegex);
  
  let currentUserText = '';
  let currentAssistantText = '';

  for (let i = 1; i < parts.length; i += 2) {
    const roleMatch = parts[i].toLowerCase();
    const text = parts[i + 1] || '';
    
    const isUser = roleMatch === 'user' || roleMatch === 'human';
    const isAssistant = roleMatch === 'assistant' || roleMatch === 'ai' || roleMatch === 'claude' || roleMatch === 'gemini';

    if (isUser) {
      if (currentUserText && currentAssistantText) {
        turns.push(createTurn(currentUserText, currentAssistantText));
        currentUserText = '';
        currentAssistantText = '';
      }
      currentUserText += text + '\n';
    } else if (isAssistant) {
      currentAssistantText += text + '\n';
    }
  }

  if (currentUserText) {
    turns.push(createTurn(currentUserText, currentAssistantText));
  }

  return turns;
}

function createTurn(userText: string, assistantText: string): Turn {
  const codeBlocks: string[] = [];
  
  // 1. Standard Markdown Code Blocks
  const codeRegex = /```[\w]*\n([\s\S]*?)```/g;
  let match;
  while ((match = codeRegex.exec(assistantText)) !== null) {
    const blockContent = match[1].trim();
    if (blockContent) {
      // Check if this block contains SEARCH/REPLACE blocks
      const srBlocks = extractSearchReplace(blockContent);
      if (srBlocks.length > 0) {
        codeBlocks.push(...srBlocks);
      } else {
        codeBlocks.push(blockContent);
      }
    }
  }

  // 2. Loose SEARCH/REPLACE blocks (not wrapped in code blocks)
  const looseSR = extractSearchReplace(assistantText);
  // Avoid duplicates if they were already found inside code blocks
  looseSR.forEach(block => {
    if (!codeBlocks.includes(block)) {
      codeBlocks.push(block);
    }
  });

  return { user: userText.trim(), assistantCodeBlocks: codeBlocks, assistantDiffs: [] };
}

/**
 * Extracts the 'REPLACE' part of SEARCH/REPLACE blocks.
 */
function extractSearchReplace(text: string): string[] {
  const results: string[] = [];
  const srRegex = /<<<<<<< SEARCH[\s\S]*?=======([\s\S]*?)>>>>>>>/g;
  const srRegexAlternative = /<<<< SEARCH[\s\S]*?====([\s\S]*?)>>>>/g;
  
  let match;
  while ((match = srRegex.exec(text)) !== null) {
    if (match[1].trim()) results.push(match[1].trim());
  }
  while ((match = srRegexAlternative.exec(text)) !== null) {
    if (match[1].trim()) results.push(match[1].trim());
  }
  
  return results;
}
