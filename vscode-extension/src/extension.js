"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
// We cast vscode.lm to any because the mcpServerDefinitionProviders API
// is newly introduced and may not be in the stable typings yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vscodeLm = vscode.lm;
function activate(context) {
    // Path to the bundled MCP server inside the extension package
    const mcpServerPath = context.asAbsolutePath(path.join('dist', 'mcp-server.js'));
    const provider = {
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
        context.subscriptions.push(vscodeLm.registerMcpServerDefinitionProvider('promptsensei.server', provider));
        console.log('PromptSensei: MCP server registered successfully.');
    }
    else {
        // Graceful degradation: the API may not be available in older VS Code versions
        vscode.window.showWarningMessage('PromptSensei: Your VS Code version does not support the MCP server API. ' +
            'Please update VS Code to v1.90+ and try again.');
    }
}
function deactivate() {
    // Nothing to clean up — VS Code manages the MCP server lifecycle automatically
}
