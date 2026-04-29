# 🚀 Publishing & Integration Guide: PromptSensei MCP

This guide covers how to distribute and integrate your **PromptSensei** MCP server into popular AI assistants like **Claude Desktop** and **VS Code**.

---

## 🏗️ 1. Preparing for Distribution

Before others can use your MCP server, you should ensure it is properly built and packaged.

### A. Add a Dedicated Bin Command
Currently, your `package.json` only has a bin for the CLI. Add one for the MCP server to make it easier to run via `npx`:

```json
"bin": {
  "promptsensei": "./dist/cli.js",
  "promptsensei-mcp": "./dist/mcp-server.js"
}
```

### B. Build the Project
Always ensure the latest TypeScript is compiled:
```bash
npm run build
```

---

## 🤖 2. Integrating with Anthropic (Claude Desktop)

Claude Desktop (MacOS/Windows) can use local MCP servers via a configuration file.

### Configuration Steps:
1.  Open your Claude Desktop configuration file:
    - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
    - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
2.  Add **PromptSensei** to the `mcpServers` object:

```json
{
  "mcpServers": {
    "promptsensei": {
      "command": "node",
      "args": ["C:/path/to/promptSensei/dist/mcp-server.js"],
      "env": {}
    }
  }
}
```

### Pro Tip: Using `npx` (No Local Path Required)
If you publish your package to NPM, users can run it without even cloning the repo:
```json
{
  "mcpServers": {
    "promptsensei": {
      "command": "npx",
      "args": ["-y", "promptsensei-mcp"],
      "env": {}
    }
  }
}
```

---

## 💻 3. Integrating with VS Code

Most VS Code AI extensions (like **Cline**, **Roo Code**, **Continue**, or **Claude Dev**) support MCP servers natively.

### A. For Cline / Roo Code:
1.  Open the **MCP Settings** in the extension (usually a settings icon in the sidebar).
2.  Add a new server with:
    - **Type**: `command`
    - **Command**: `node`
    - **Args**: `["C:/absolute/path/to/promptSensei/dist/mcp-server.js"]`
3.  Restart the extension or click "Refresh Servers".

### B. Using the Docker Toolkit (Universal)
If the user doesn't have Node.js, they can use your Docker image:
```json
{
  "mcpServers": {
    "promptsensei": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-v",
        "${workspaceFolder}:/workspace",
        "bhogayatakeyur/mcp-token-audit"
      ]
    }
  }
}
```

---

## 🌍 4. Public Publishing

To make your tool available to the world:

### Option 1: NPM (Recommended)
Publishing to NPM allows anyone to run your server via `npx`.
1.  Login to NPM: `npm login`
2.  Update version: `npm version patch`
3.  Publish: `npm publish`

### Option 2: GitHub + Docker
Your current `Dockerfile` is already great for the **Docker MCP Toolkit**. 
1.  Push your code to a GitHub repository.
2.  Set up a GitHub Action to automatically build and push the Docker image to **GitHub Container Registry (ghcr.io)** or **Docker Hub**.
3.  Users can then reference it as `ghcr.io/yourusername/promptsensei`.

---

## 🏪 5. Publishing to the VS Code Marketplace

For the ultimate "quick and easy" experience, you can bundle your MCP server into a standalone VS Code extension. This allows users to simply click "Install" and have the tools automatically available to their AI assistant.

### A. Create the Extension Project
Use the VS Code extension generator to create a new project:
```bash
npx -y yo code
# Choose "New Extension (TypeScript)"
```

### B. Configure `package.json`
Add the MCP contribution point to your extension's `package.json`:

```json
"contributes": {
  "mcpServerDefinitionProviders": [
    {
      "id": "promptsensei.server"
    }
  ]
}
```

### C. Implement the Provider
In your extension's `src/extension.ts`, register the provider that tells VS Code where to find your bundled MCP server:

```typescript
import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  // Register the provider for your MCP server
  context.subscriptions.push(
    (vscode as any).lm.registerMcpServerDefinitionProvider('promptsensei.server', {
      provideMcpServerDefinitions: async () => {
        return [{
          id: 'promptsensei',
          label: 'PromptSensei Auditor',
          command: 'node',
          args: [context.asAbsolutePath('dist/mcp-server.js')]
        }];
      }
    })
  );
}
```

### D. Bundle & Publish
1.  **Bundle**: Copy your `dist/mcp-server.js` and dependencies into the extension's folder.
2.  **Package**: Run `npx vsce package`.
3.  **Publish**: Upload the `.vsix` to the [VS Code Marketplace Publisher Dashboard](https://marketplace.visualstudio.com/manage) or use `npx vsce publish`.

---

## 📝 6. User Instructions for the AI
When using your MCP server, the AI needs to know how to call it. Your current implementation provides a `review_session` tool. 

**Tell your users to prompt like this:**
> *"Use the `review_session` tool to analyze my current chat log and give me coaching advice."*

**AI Behavior Note:**
In your `src/mcp-server.ts`, you've added a system hint in the description: 
> *"If 'coachingContext' is provided... YOU MUST use it to generate a brief 'Coaching Advice' tip..."*
This is excellent practice as it ensures the LLM interprets your metrics correctly for the user!
