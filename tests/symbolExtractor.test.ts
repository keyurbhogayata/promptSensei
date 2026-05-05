import { extractSymbol } from '../src/utils/symbolExtractor';
import * as fs from 'fs';

jest.mock('fs');

describe('extractSymbol', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns empty string if file does not exist', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    expect(extractSymbol('dummy.ts', 'L1')).toBe('');
  });

  it('returns empty string if line range format is invalid', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue('line 1\nline 2');
    expect(extractSymbol('dummy.ts', 'invalid')).toBe('');
  });

  it('extracts lines starting from the given line number up to 50 lines', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    // Create 100 lines
    const lines = Array.from({ length: 100 }, (_, i) => `line ${i + 1}`);
    (fs.readFileSync as jest.Mock).mockReturnValue(lines.join('\n'));
    
    // Extract starting from L10
    const result = extractSymbol('dummy.ts', 'L10');
    const resultLines = result.split('\n');
    
    expect(resultLines.length).toBe(50);
    expect(resultLines[0]).toBe('line 10');
    expect(resultLines[49]).toBe('line 59');
  });

  it('extracts lines starting from the given line number until the end of file if less than 50 lines', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    // Create 20 lines
    const lines = Array.from({ length: 20 }, (_, i) => `line ${i + 1}`);
    (fs.readFileSync as jest.Mock).mockReturnValue(lines.join('\n'));
    
    // Extract starting from L10
    const result = extractSymbol('dummy.ts', 'L10');
    const resultLines = result.split('\n');
    
    expect(resultLines.length).toBe(11); // line 10 to line 20
    expect(resultLines[0]).toBe('line 10');
    expect(resultLines[10]).toBe('line 20');
  });
});