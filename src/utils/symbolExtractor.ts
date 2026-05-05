import * as fs from 'fs';

export function extractSymbol(filePath: string, lineRange: string): string {
  if (!fs.existsSync(filePath)) return '';
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  const startMatch = lineRange.match(/L(\d+)/);
  if (!startMatch) return '';
  
  const startLine = parseInt(startMatch[1]) - 1;
  // Naive extraction: get 50 lines or until next symbol (refined later)
  return lines.slice(startLine, startLine + 50).join('\n');
}