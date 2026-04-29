# PromptSensei

**Analyze AI chat sessions for wasted tokens and get instant coaching advice — directly in VS Code.**

PromptSensei is an MCP (Model Context Protocol) server that hooks into your AI assistant (GitHub Copilot, Cline, Roo Code, etc.) and gives you a session waste report every time you finish a coding session.

## Features

-   📊 **Token Wastage Analysis**: Counts exactly how many tokens you wasted on code that never made it to your final files.
-   💰 **Money Wasted**: Converts wasted tokens to an estimated dollar cost.
-   🎓 **Coaching Advice**: The AI automatically generates personalized tips to help you write better prompts next time.
-   🔗 **Git-Aware**: Uses your local `git` working tree to intelligently detect which AI-generated code was actually kept.

## Usage

Once installed, the `review_session` MCP tool is automatically available to your AI assistant.

**Just ask:**
> "Use the `review_session` tool to analyze my current chat log."

## Requirements

-   VS Code `v1.90.0` or higher
-   Node.js `v18+` installed on your system

## Extension Settings

No settings required. The MCP server starts automatically when VS Code launches.

## License

ISC
