// src/git-reader.ts
import * as fs from 'fs';
import * as path from 'path';
import simpleGit, { SimpleGit } from 'simple-git';

// File extensions we want to read content from
const READABLE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.go', '.rs', '.java', '.c', '.cpp', '.h',
  '.json', '.yaml', '.yml', '.toml', '.env',
  '.md', '.txt', '.sh', '.bash',
  '.html', '.css', '.scss', '.sql',
]);

function isReadable(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return READABLE_EXTENSIONS.has(ext);
}

/**
 * Detects if a directory is inside a git repository.
 */
async function isGitRepo(dir: string): Promise<boolean> {
  try {
    const git: SimpleGit = simpleGit(dir);
    await git.revparse(['--is-inside-work-tree']);
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns the content of all files that are currently modified or untracked
 * in the working tree compared to HEAD. This captures everything an AI session
 * may have touched.
 *
 * @param dir - The directory to check (defaults to process.cwd())
 * @returns A single string containing the concatenated content of all changed files.
 *          Returns empty string if not a git repo or no changes found.
 */
export async function readGitWorkingTree(dir: string = process.cwd()): Promise<string> {
  if (!(await isGitRepo(dir))) {
    return '';
  }

  const git: SimpleGit = simpleGit(dir);

  // Get the git root so all relative paths resolve correctly
  const rootRaw = await git.revparse(['--show-toplevel']);
  const repoRoot = rootRaw.trim();

  // Get all tracked and untracked files (excluding ignored)
  const trackedFilesRaw = await git.raw(['ls-files']);
  const untrackedFilesRaw = await git.raw(['ls-files', '--others', '--exclude-standard']);
  
  const allFiles = [...trackedFilesRaw.split('\n'), ...untrackedFilesRaw.split('\n')]
    .map(f => f.trim())
    .filter(f => f.length > 0);

  if (allFiles.length === 0) {
    return '';
  }

  const contentParts: string[] = [];

  for (const relativePath of allFiles) {
    if (!isReadable(relativePath)) continue;

    const absolutePath = path.join(repoRoot, relativePath);

    try {
      if (fs.existsSync(absolutePath)) {
        const content = fs.readFileSync(absolutePath, 'utf-8');
        contentParts.push(`// FILE: ${relativePath}\n${content}`);
      }
    } catch {
      // Skip files we can't read (binary, permissions, etc.)
    }
  }

  return contentParts.join('\n\n');
}
