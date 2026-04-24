// src/parser.ts
export interface Turn {
  user: string;
  assistantCodeBlocks: string[];
}

export function parseLog(content: string): Turn[] {
  const turns: Turn[] = [];
  const parts = content.split('## User');

  for (let i = 1; i < parts.length; i++) {
    const section = parts[i];
    const [userPart, ...assistantParts] = section.split('## Assistant');

    const user = userPart.trim();
    const assistant = assistantParts.join('## Assistant');

    const codeBlocks: string[] = [];
    const codeRegex = /```[\w]*\n([\s\S]*?)```/g;
    let match;
    while ((match = codeRegex.exec(assistant)) !== null) {
      codeBlocks.push(match[1].trim());
    }

    turns.push({ user, assistantCodeBlocks: codeBlocks });
  }

  return turns;
}
