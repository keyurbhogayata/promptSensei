import * as vscode from 'vscode';
import * as path from 'path';
import { parseLog } from '../../src/parser';
import { calculateWaste } from '../../src/calculator';
import { readGitWorkingTree } from '../../src/git-reader';

// VS Code MCP types
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

const vscodeLm = (vscode as any).lm;

export function activate(context: vscode.ExtensionContext): void {
  const mcpServerPath = context.asAbsolutePath(path.join('dist', 'mcp-server.js'));

  // 1. Register MCP Server Provider
  const provider: McpServerDefinitionProvider = {
    provideMcpServerDefinitions: async () => {
      return [
        {
          id: 'promptsensei',
          label: 'PromptSensei',
          command: 'node',
          args: [mcpServerPath],
          env: {
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
  }

  // 2. Register Manual Audit Command
  const auditCommand = vscode.commands.registerCommand('promptsensei.auditChat', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('PromptSensei: No active editor found.');
      return;
    }

    const logContent = editor.document.getText();
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

    if (!workspaceRoot) {
      vscode.window.showErrorMessage('PromptSensei: Please open a workspace to run the audit.');
      return;
    }

    const modelSelection = await vscode.window.showQuickPick([
      { label: 'GPT-5.5 (Agentic Frontier)', id: 'gpt-5-5' },
      { label: 'Claude 4.7 Opus', id: 'claude-4-7-opus' },
      { label: 'Claude 4.7 Sonnet', id: 'claude-4-7-sonnet' },
      { label: 'Claude 4.7 Haiku', id: 'claude-4-7-haiku' },
      { label: 'Gemini 3.1 Pro', id: 'gemini-3-1-pro' },
      { label: 'Gemini 3.1 Flash', id: 'gemini-3-1-flash' },
      { label: 'Generic Frontier Model', id: 'generic' }
    ], { placeHolder: 'Select the AI model used in this session' });

    if (!modelSelection) return;

    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Analyzing Chat Session...",
      cancellable: false
    }, async () => {
      try {
        const finalFileContent = await readGitWorkingTree(workspaceRoot);
        const turns = parseLog(logContent);
        const report = await calculateWaste(turns, finalFileContent, modelSelection.id as any);

        showReportWebview(context, report, turns.length, modelSelection.label);
      } catch (error: any) {
        vscode.window.showErrorMessage(`PromptSensei: Audit failed: ${error.message}`);
      }
    });
  });

  context.subscriptions.push(auditCommand);
}

function showReportWebview(context: vscode.ExtensionContext, report: any, turnCount: number, modelName: string) {
  const panel = vscode.window.createWebviewPanel(
    'promptSenseiReport',
    'PromptSensei: Efficiency Report',
    vscode.ViewColumn.Two,
    { enableScripts: true }
  );

  const wastedPct = report.totalTokens > 0 
    ? Math.round((report.wastedTokens / report.totalTokens) * 100) 
    : 0;
  
  const color = wastedPct > 50 ? '#ff4d4f' : wastedPct > 20 ? '#faad14' : '#52c41a';

  panel.webview.html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: sans-serif; padding: 20px; line-height: 1.6; color: var(--vscode-editor-foreground); background-color: var(--vscode-editor-background); }
        .card { background: var(--vscode-editor-inactiveSelectionBackground); padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 5px solid ${color}; }
        .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px; }
        .stat-item { background: var(--vscode-sideBar-background); padding: 15px; border-radius: 4px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; display: block; color: ${color}; }
        .stat-label { font-size: 12px; opacity: 0.8; text-transform: uppercase; }
        .wasted-list { margin-top: 20px; }
        .wasted-item { padding: 5px 0; border-bottom: 1px solid var(--vscode-panel-border); }
        h1 { margin-top: 0; }
        .model-badge { font-size: 10px; background: var(--vscode-badge-background); padding: 2px 6px; border-radius: 4px; vertical-align: middle; }
      </style>
    </head>
    <body>
      <h1>📊 Session Efficiency Report <span class="model-badge">${modelName}</span></h1>
      <div class="card">
        <div class="stat-label">Efficiency Score</div>
        <div class="stat-value" style="font-size: 48px;">${100 - wastedPct}%</div>
        <p>This session used <strong>${report.totalTokens.toLocaleString()}</strong> tokens.</p>
      </div>

      <div class="stat-grid">
        <div class="stat-item">
          <span class="stat-value">${report.wastedTokens.toLocaleString()}</span>
          <span class="stat-label">Wasted Tokens</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">$${report.moneyWasted.toFixed(4)}</span>
          <span class="stat-label">Estimated Waste (USD)</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${turnCount}</span>
          <span class="stat-label">Total Turns</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${report.wastedTurns.length}</span>
          <span class="stat-label">Wasted Turns</span>
        </div>
      </div>

      ${report.wastedTurns.length > 0 ? `
        <div class="wasted-list">
          <h3>Wasted Turn Indices</h3>
          <p>The following turns contributed to the waste:</p>
          <div>${report.wastedTurns.map((t: number) => `<span style="background: var(--vscode-badge-background); padding: 2px 8px; border-radius: 10px; margin-right: 5px;">Turn ${t}</span>`).join('')}</div>
        </div>
      ` : '<p>🎉 No significant waste detected in this session!</p>'}
      
      <p style="margin-top: 30px; font-size: 11px; opacity: 0.6;">
        Tip: To reduce waste, try breaking down complex tasks into smaller prompts and providing more specific context.
      </p>
    </body>
    </html>
  `;
}

export function deactivate(): void {}
