# Releasing New Versions

This guide explains how to manually release a new version of PromptSensei to NPM and the VS Code Marketplace.

## 1. Prerequisites
- Logged into NPM: `npm login`
- Azure DevOps PAT (Personal Access Token) for VS Code Marketplace
- All changes committed to git

## 2. Step-by-Step Release

### Step A: Version Bump
From the root directory, choose a bump type (`patch`, `minor`, or `major`):

```powershell
# 1. Bump version in root package.json
$VERSION = npm version patch --no-git-tag-version

# 2. Sync version to VS Code extension
cd vscode-extension
npm version $VERSION --no-git-tag-version
cd ..

# 3. Commit the bump
git add package.json vscode-extension/package.json
git commit -m "chore: release $VERSION"
git tag $VERSION
```

### Step B: Build & Package
```powershell
# 1. Build the MCP Server
npm run build

# 2. Build and Package the Extension
cd vscode-extension
npm run build
npx @vscode/vsce package --no-dependencies
cd ..
```

### Step C: Publish to NPM
```powershell
# From the root directory
npm publish
```

### Step D: Publish to VS Code Marketplace
```powershell
# From the vscode-extension directory
cd vscode-extension
npx @vscode/vsce publish -p YOUR_PAT_HERE
cd ..
```

### Step E: Push to GitHub
```powershell
git push origin master
git push origin --tags
```

---

## 🛠 Troubleshooting

### NPM 404 Error
If `npm publish` fails with a 404, check:
1. **Login**: Run `npm whoami` to verify you are logged in.
2. **Permissions**: Ensure you have owner access to the package.
3. **Availability**: If the name is taken, you may need to use a scope like `@your-username/promptsensei-mcp`.

### VS Code WASM Error
If the extension fails with `Missing tiktoken_bg.wasm`, ensure you are using `gpt-tokenizer` instead of `tiktoken`. The build script `npm run build` in the extension folder uses `esbuild` which handles `gpt-tokenizer` (pure JS) perfectly.
