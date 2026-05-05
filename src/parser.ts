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
  const diffs: ParsedDiff[] = [];
  
  // 1. Standard Markdown Code Blocks
  const codeRegex = /```([\w]*)\n([\s\S]*?)```/g;
  let match;
  while ((match = codeRegex.exec(assistantText)) !== null) {
    const lang = match[1].trim().toLowerCase();
    const blockContent = match[2].trim();
    if (blockContent) {
      if (lang === 'diff' || lang === 'patch') {
        // Handled below by extractUnifiedDiffs
      } else {
        const srDiffs = extractSearchReplace(blockContent);
        if (srDiffs.length > 0) {
          diffs.push(...srDiffs);
        } else {
          codeBlocks.push(blockContent);
        }
      }
    }
  }

  // 2. Loose SEARCH/REPLACE blocks (not wrapped in code blocks)
  const textWithoutCodeBlocks = assistantText.replace(codeRegex, '');
  const looseSR = extractSearchReplace(textWithoutCodeBlocks);
  diffs.push(...looseSR);

  // 3. Unified Diffs
  const unifiedDiffs = extractUnifiedDiffs(assistantText);
  diffs.push(...unifiedDiffs);

  return { user: userText.trim(), assistantCodeBlocks: codeBlocks, assistantDiffs: diffs };
}

/**
 * Extracts SEARCH/REPLACE blocks as ParsedDiff objects.
 */
function extractSearchReplace(text: string): ParsedDiff[] {
  const results: ParsedDiff[] = [];
  const srRegex = /<<<<(?:<<<)? SEARCH\s*([\s\S]*?)====(?:===)?\s*([\s\S]*?)>>>>(?:>>>)?/g;
  
  let match;
  while ((match = srRegex.exec(text)) !== null) {
    const searchContent = match[1].trim();
    const replaceContent = match[2].trim();
    if (replaceContent || searchContent) {
      results.push({
        targetFile: null,
        searchLines: searchContent ? searchContent.split('\n') : [],
        addedLines: replaceContent ? replaceContent.split('\n') : []
      });
    }
  }
  
  return results;
}

/**
 * Extracts and parses Unified Diff blocks.
 */
function extractUnifiedDiffs(text: string): ParsedDiff[] {
  const results: ParsedDiff[] = [];
  const diffRegex = /```(?:diff|patch)\n([\s\S]*?)```/g;
  let match;
  while ((match = diffRegex.exec(text)) !== null) {
    const diffContent = match[1].trim();
    const diffs = parseDiffContent(diffContent);
    results.push(...diffs);
  }
  return results;
}

function parseDiffContent(content: string): ParsedDiff[] {
  const diffs: ParsedDiff[] = [];
  let currentDiff: ParsedDiff | null = null;

  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('+++ ')) {
      let targetFile = line.substring(4).trim();
      if (targetFile.startsWith('b/')) {
        targetFile = targetFile.substring(2);
      }
      currentDiff = { targetFile, searchLines: [], addedLines: [] };
      diffs.push(currentDiff);
    } else if (line.startsWith('+') && !line.startsWith('+++') && currentDiff) {
      currentDiff.addedLines.push(line.substring(1));
    } else if (line.startsWith('-') && !line.startsWith('---') && currentDiff) {
      currentDiff.searchLines.push(line.substring(1));
    }
  }

  return diffs;
}
