#!/usr/bin/env node
// src/mcp-server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { parseLog } from './parser';
import { calculateWaste, WasteReport } from './calculator';
import { readGitWorkingTree } from './git-reader';
import { generateCoachingPrompt } from './advisor';
import * as path from 'path';
import { GraphClient } from './graphClient';
import { OptimizerEngine } from './optimizer';

const server = new Server(
  { name: 'mcp-token-audit', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'review_session',
        description:
          'Review a chat session log and calculate wasted tokens and money. Returns a structured report. If "coachingContext" is provided in the JSON output, YOU MUST use it to generate a brief "Coaching Advice" tip for the user in your response.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            logContent: {
              type: 'string',
              description:
                'The markdown content of the chat log. Expected format: "## User" / "## Assistant" headers.',
            },
            finalFileContent: {
              type: 'string',
              description:
                'The current content of the files modified during the session. Used to detect which AI-generated code survived. If git_dir is provided, this is ignored.',
            },
            git_dir: {
              type: 'string',
              description:
                'Optional. Absolute path to the git project directory. When provided, the tool automatically reads the working tree instead of using finalFileContent.',
            },
            modelProvider: {
              type: 'string',
              enum: ['gpt-5-5', 'claude-4-7-opus', 'claude-4-7-sonnet', 'claude-4-7-haiku', 'gemini-3-1-pro', 'gemini-3-1-flash', 'generic'],
              description: 'Optional. The AI model used in the session. Affects token counting accuracy and price estimates.',
            },
          },
          required: ['logContent', 'finalFileContent'],
        },
      },
      {
        name: 'get_optimized_context',
        description: 'Returns a pruned list of files relevant to the user prompt.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            prompt: { type: 'string' }
          },
          required: ['prompt']
        }
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'review_session') {
    const args = request.params.arguments as Record<string, unknown>;
    const logContent = args['logContent'] as string;
    const gitDir = args['git_dir'] as string | undefined;
    const callerFileContent = (args['finalFileContent'] as string) ?? '';

    if (!logContent || typeof logContent !== 'string') {
      throw new Error('logContent is required and must be a string');
    }

    // Prefer live git working tree if git_dir is provided
    const finalFileContent: string = gitDir
      ? await readGitWorkingTree(gitDir)
      : callerFileContent;

    const turns = parseLog(logContent);
    const modelProvider = (args['modelProvider'] as any) || 'generic';
    const report: WasteReport = await calculateWaste(turns, finalFileContent, modelProvider);

    const wastedPct =
      report.totalTokens > 0
        ? Math.round((report.wastedTokens / report.totalTokens) * 100)
        : 0;

    const summary = [
      `📊 Session Review`,
      `  Total Turns Analyzed : ${turns.length}`,
      `  Total Tokens Used    : ${report.totalTokens.toLocaleString()}`,
      `  Wasted Tokens        : ${report.wastedTokens.toLocaleString()} (${wastedPct}%)`,
      `  Money Wasted         : $${report.moneyWasted.toFixed(6)}`,
      report.wastedTurns.length > 0
        ? `  Wasted Turn Indices  : ${report.wastedTurns.join(', ')}`
        : `  No significant waste detected.`,
    ].join('\n');

    const coachingContext = generateCoachingPrompt(turns, report.wastedTurns);
    const finalReport = coachingContext ? { ...report, coachingContext } : report;

    return {
      content: [
        {
          type: 'text' as const,
          text: summary,
        },
        {
          type: 'text' as const,
          text: JSON.stringify(finalReport, null, 2),
        },
      ],
    };
  }

  if (request.params.name === 'get_optimized_context') {
    const args = request.params.arguments as Record<string, unknown>;
    const prompt = args['prompt'] as string;
    
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('prompt is required and must be a string');
    }

    const client = new GraphClient(path.join(process.cwd(), 'graphify-out', 'graph.json'));
    const engine = new OptimizerEngine(client);
    const files = await engine.optimize(prompt);
    
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({ optimizedFiles: files }, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

export async function startMcpServer(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('PromptSensei MCP Server running on stdio');
}

// Start if run directly
if (require.main === module) {
  startMcpServer().catch((err) => {
    console.error('Fatal error starting MCP server:', err);
    process.exit(1);
  });
}
