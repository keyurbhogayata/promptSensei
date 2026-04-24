// src/parser.ts
export interface Turn {
  user: string;
  assistantCodeBlocks: string[];
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
  const codeRegex = /```[\w]*\n([\s\S]*?)```/g;
  let match;
  while ((match = codeRegex.exec(assistantText)) !== null) {
    if (match[1].trim()) {
      codeBlocks.push(match[1].trim());
    }
  }
  return { user: userText.trim(), assistantCodeBlocks: codeBlocks };
}
