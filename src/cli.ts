#!/usr/bin/env node
// src/cli.ts
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { parseLog } from './parser';
import { calculateWaste } from './calculator';
import { readGitWorkingTree } from './git-reader';

const program = new Command();

program
  .name('promptsensei')
  .description('Analyze AI coding sessions for wasted tokens and money')
  .version('1.1.0');

program
  .command('review <logPath>')
  .description('Review a chat log file and print a session waste report')
  .option('--no-git', 'Disable git integration (treats all AI-generated code as potentially wasted)')
  .option('--git-dir <dir>', 'Path to the git repo to read working tree from (defaults to log file directory)')
  .action(async (logPath: string, options: { git: boolean; gitDir?: string }) => {
    try {
      if(!fs.existsSync(logPath)) {
        console.error(`Error: File not found: ${logPath}`);
        process.exit(1);
      }

      const logContent = fs.readFileSync(logPath, 'utf-8');
      const turns = parseLog(logContent);

      if(turns.length === 0) {
        console.log('No conversation turns detected in the provided log. Is the format correct?');
        console.log('Expected format: "## User" / "## Assistant" headers.');
        return;
      }

      // Resolve the git directory: explicit flag > log file's directory > cwd
      let finalTreeContent = '';
      if(options.git !== false) {
        const gitDir = options.gitDir
          ? path.resolve(options.gitDir)
          : path.dirname(path.resolve(logPath));

        console.log(`\n🔍 Reading git working tree from: ${gitDir}`);
        finalTreeContent = await readGitWorkingTree(gitDir);

        if(!finalTreeContent) {
          console.log('   No modified files found in git working tree.');
          console.log('   Tip: Run this command before committing, or use --git-dir to point at your project.');
        } else {
          const fileCount = (finalTreeContent.match(/\/\/ FILE:/g) || []).length;
          console.log(`   Found ${fileCount} modified file(s) in working tree.`);
        }
      } else {
        console.log('\n⚠️  Git integration disabled (--no-git). All AI-generated code is treated as potentially wasted.');
      }

      const report = await calculateWaste(turns, finalTreeContent);

      const wastedPct =
        report.totalTokens > 0
          ? Math.round((report.wastedTokens / report.totalTokens) * 100)
          : 0;

      console.log('\n📊 Session Review');
      console.log('─────────────────────────────────');
      console.log(`  Total Turns Analyzed : ${turns.length}`);
      console.log(`  Total Tokens Used    : ${report.totalTokens.toLocaleString()}`);
      console.log(`  Wasted Tokens        : ${report.wastedTokens.toLocaleString()} (${wastedPct}%)`);
      console.log(`  Money Wasted         : $${report.moneyWasted.toFixed(6)}`);
      console.log('─────────────────────────────────');

      if(report.wastedTurns.length > 0) {
        console.log(`\n⚠️  Wasted turns (0-indexed): ${report.wastedTurns.join(', ')}`);
        console.log('   These turns produced code or context that was not present in the final result.');

        console.log('\n💡 Tip: You can get automated advice by using our VS Code extension or MCP server tools.');

      } else {
        console.log('\n✅ No significant waste detected in this session.');
      }
    } catch(err) {
      console.error('Error analyzing session:', err);
      process.exit(1);
    }
  });

program
  .command('prompt')
  .description('Prompt the user to review their completed session (interactive)')
  .action(async () => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(
      '\n[PromptSensei] Session ended. Would you like a token & prompt review? (Y/n): ',
      (answer) => {
        rl.close();
        if(answer.trim().toLowerCase() !== 'n') {
          console.log('\nRun: promptsensei review <path-to-your-log-file>');
        } else {
          console.log('Review skipped.');
        }
      }
    );
  });

program.parse();
