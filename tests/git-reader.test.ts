// tests/git-reader.test.ts
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
import { readGitWorkingTree } from '../src/git-reader';

// Creates a minimal real git repo in a temp dir for testing
function makeTestRepo(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'promptSensei-test-'));
  execSync('git init', { cwd: dir });
  execSync('git config user.email "test@test.com"', { cwd: dir });
  execSync('git config user.name "Test"', { cwd: dir });
  return dir;
}

describe('readGitWorkingTree', () => {
  it('should return content of modified tracked files', async () => {
    const repoDir = makeTestRepo();

    // Commit an initial version of the file
    const filePath = path.join(repoDir, 'hello.ts');
    fs.writeFileSync(filePath, 'export const a = 1;');
    execSync('git add .', { cwd: repoDir });
    execSync('git commit -m "initial"', { cwd: repoDir });

    // Modify it (simulate AI changes)
    fs.writeFileSync(filePath, 'export const a = 1;\nexport const b = 2;');

    const content = await readGitWorkingTree(repoDir);
    expect(content).toContain('export const b = 2;');
  });

  it('should return content of untracked new files', async () => {
    const repoDir = makeTestRepo();

    // Initial commit so git repo is valid
    fs.writeFileSync(path.join(repoDir, 'init.ts'), 'const x = 1;');
    execSync('git add .', { cwd: repoDir });
    execSync('git commit -m "initial"', { cwd: repoDir });

    // Add a new untracked file (AI-generated, not yet committed)
    fs.writeFileSync(path.join(repoDir, 'new-file.ts'), 'export const newFunc = () => {};');

    const content = await readGitWorkingTree(repoDir);
    expect(content).toContain('export const newFunc = () => {};');
  });

  it('should return content of committed files even if there are no uncommitted changes', async () => {
    const repoDir = makeTestRepo();

    fs.writeFileSync(path.join(repoDir, 'init.ts'), 'const x = 1;');
    execSync('git add .', { cwd: repoDir });
    execSync('git commit -m "initial"', { cwd: repoDir });

    const content = await readGitWorkingTree(repoDir);
    expect(content).toContain('const x = 1;');
  });

  it('should return empty string for non-git directory', async () => {
    const nonGitDir = fs.mkdtempSync(path.join(os.tmpdir(), 'promptSensei-nogit-'));
    const content = await readGitWorkingTree(nonGitDir);
    expect(content).toBe('');
  });
});
