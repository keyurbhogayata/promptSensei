import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';

// VS Code MCP types (API is not yet in stable @types/vscode, so we type it manually)
interface McpServerDefinition {
  id: string;
  label: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

interface McpServerDefinitionProvider {
  provideMcpServerDefinitions(): Promise<McpServerDefinition[]>;
}

// We cast vscode.lm to any because the mcpServerDefinitionProviders API
// is newly introduced and may not be in the stable typings yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vscodeLm = (vscode as any).lm;

export function activate(context: vscode.ExtensionContext): void {
  // Path to the bundled MCP server inside the extension package
  const mcpServerPath = context.asAbsolutePath(path.join('dist', 'mcp-server.js'));

  const provider: McpServerDefinitionProvider = {
    provideMcpServerDefinitions: async () => {
      return [
        {
          id: 'promptsensei',
          label: 'PromptSensei — Token Auditor',
          command: 'node',
          args: [mcpServerPath],
          env: {
            // Pass through any GEMINI_API_KEY from the user's environment
            // so the coaching advice feature works automatically.
            GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? '',
          },
        },
      ];
    },
  };

  if (vscodeLm && typeof vscodeLm.registerMcpServerDefinitionProvider === 'function') {
    context.subscriptions.push(
      vscodeLm.registerMcpServerDefinitionProvider('promptsensei.server', provider)
    );
    console.log('PromptSensei: MCP server registered successfully.');
  } else {
    // Graceful degradation: the API may not be available in older VS Code versions
    vscode.window.showWarningMessage(
      'PromptSensei: Your VS Code version does not support the MCP server API. ' +
        'Please update VS Code to v1.90+ and try again.'
    );
  }
}

export function deactivate(): void {
  // Nothing to clean up — VS Code manages the MCP server lifecycle automatically
}
