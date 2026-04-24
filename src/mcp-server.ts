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

const server = new Server(
  { name: 'ai-coach', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'review_session',
        description:
          'Review a chat session log and calculate wasted tokens and money. Returns a structured report with total tokens, wasted tokens, money wasted (USD), and which turns were wasteful.',
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
          },
          required: ['logContent', 'finalFileContent'],
        },
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
    const report: WasteReport = await calculateWaste(turns, finalFileContent);

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

    return {
      content: [
        {
          type: 'text' as const,
          text: summary,
        },
        {
          type: 'text' as const,
          text: JSON.stringify(report, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

export async function startMcpServer(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AI Coach MCP Server running on stdio');
}

// Start if run directly
if (require.main === module) {
  startMcpServer().catch((err) => {
    console.error('Fatal error starting MCP server:', err);
    process.exit(1);
  });
}
