# AI Coach 🧠🤖

AI Coach is a developer tool that analyzes your AI coding sessions to quantify wasted effort, track token costs, and provide qualitative prompt engineering coaching. 

Have you ever spent 10 turns arguing with an AI, only to throw away all the code it generated? **AI Coach** analyzes your chat logs, cross-references them against your git repository, and tells you exactly how many tokens (and dollars) you wasted, while teaching you how to prompt better next time.

## 🌟 Features

- **Precise Token Math:** Uses `tiktoken` BPE encoding (`cl100k_base`) to calculate exact token usage and cost for every turn.
- **Git Survival Detection:** Automatically scans your git working tree. If the AI generated code but it doesn't exist in your final project files, the turn is flagged as wasted.
- **Negative Feedback Detection:** Identifies turns where you had to correct the AI (e.g., *"Wait, that's wrong"*, *"It's still throwing an error"*).
- **Dual Environments:** Run it standalone in your terminal, or integrate it natively into your IDE via MCP.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Git

### Installation
```bash
git clone https://github.com/keyurbhogayata/ai-coach.git
cd ai-coach
npm install
npm run build
```

---

## 💻 1. Standalone CLI Mode

Use AI Coach directly from your terminal to analyze exported markdown chat logs.

```bash
# Basic usage
node dist/cli.js review path/to/chat-log.md

# Disable git cross-referencing
node dist/cli.js review path/to/chat-log.md --no-git
```

### Enable AI Coaching Advice in the CLI
If you want the CLI to generate a custom prompt engineering tip based on your wasted turns, you need to provide an API key for the Gemini model fallback:
```bash
export GEMINI_API_KEY="your-api-key"
node dist/cli.js review log.md
```

---

## 🔌 2. MCP Server Mode (VS Code / AI Assistants)

AI Coach shines when integrated directly into your IDE using the **Model Context Protocol (MCP)**. This allows your current AI assistant (like Roo Code, Cline, or Claude Code) to seamlessly review its own past sessions.

1. Add the server to your MCP configuration file (e.g., `mcp_settings.json`):
```json
{
  "mcpServers": {
    "ai-coach": {
      "command": "node",
      "args": ["/absolute/path/to/ai-coach/dist/mcp-server.js"],
      "env": {}
    }
  }
}
```
2. Restart your AI extension.
3. In your chat, prompt: *"Please use the `review_session` tool to analyze my chat log."*

Because the host LLM already has the context of your conversation, it natively interprets the token wastage metrics and generates **Coaching Advice** directly in your chat window without needing any extra API keys!

---

## 🐳 3. Docker MCP Toolkit

AI Coach is fully containerized and can be run securely inside Docker, making it perfectly compatible with the **Docker MCP Toolkit**. This means you don't even need Node.js installed on your host machine to use it as an MCP server!

### Build the Image
```bash
docker build -t keyurbhogayata/ai-coach-mcp .
```

### Add to Docker MCP Toolkit
If you are using the MCP Toolkit interface in Docker Desktop:
1. Open the MCP Toolkit dashboard.
2. Add a new server using the image `keyurbhogayata/ai-coach-mcp`.
3. **Important:** Because AI Coach needs to read your local git repository to calculate waste, you MUST configure the container to map a volume to your local workspace.

### Run via standard Docker
To run the server via Docker manually (and pass it to your IDE), use:
```json
{
  "mcpServers": {
    "ai-coach": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-v",
        "${workspaceFolder}:/workspace",
        "keyurbhogayata/ai-coach-mcp"
      ],
      "env": {}
    }
  }
}
```
*(Note: When using Docker, ensure the `git_dir` argument passed to the tool matches the internal container path, e.g., `/workspace`)*

---

## 🛠️ Tech Stack
- **TypeScript** & **Node.js**
- **Commander.js** (CLI interface)
- **@modelcontextprotocol/sdk** (MCP integration)
- **simple-git** (Git working tree analysis)
- **tiktoken** (Token counting)

## 📄 License
MIT
