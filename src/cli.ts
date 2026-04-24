#!/usr/bin/env node
// src/cli.ts
import { Command } from 'commander';
import * as fs from 'fs';
import * as readline from 'readline';
import { parseLog } from './parser';
import { calculateWaste } from './calculator';

const program = new Command();

program
  .name('ai-coach')
  .description('Analyze AI coding sessions for wasted tokens and money')
  .version('1.0.0');

program
  .command('review <logPath>')
  .description('Review a chat log file and print a session waste report')
  .action(async (logPath: string) => {
    try {
      if (!fs.existsSync(logPath)) {
        console.error(`Error: File not found: ${logPath}`);
        process.exit(1);
      }

      const logContent = fs.readFileSync(logPath, 'utf-8');
      const turns = parseLog(logContent);

      if (turns.length === 0) {
        console.log('No conversation turns detected in the provided log. Is the format correct?');
        console.log('Expected format: "## User" / "## Assistant" headers.');
        return;
      }

      // For MVP: pass empty string as finalTreeContent.
      // A future enhancement (Task 5+) will read from git working tree.
      const report = await calculateWaste(turns, '');

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

      if (report.wastedTurns.length > 0) {
        console.log(`\n⚠️  Wasted turns (0-indexed): ${report.wastedTurns.join(', ')}`);
        console.log('   These turns produced code or context that was not present in the final result.');
      } else {
        console.log('\n✅ No significant waste detected in this session.');
      }
    } catch (err) {
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
      '\n[AI Coach] Session ended. Would you like a token & prompt review? (Y/n): ',
      (answer) => {
        rl.close();
        if (answer.trim().toLowerCase() !== 'n') {
          console.log('\nRun: ai-coach review <path-to-your-log-file>');
        } else {
          console.log('Review skipped.');
        }
      }
    );
  });

program.parse();
