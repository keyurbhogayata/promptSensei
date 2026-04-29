#!/usr/bin/env pwsh
# =============================================================================
# deploy.ps1 — PromptSensei Interactive Deploy Script
# =============================================================================
# Run this after committing changes to deploy to NPM and/or VS Code Marketplace.
# Usage:  .\deploy.ps1
# =============================================================================

$Root        = $PSScriptRoot
$VsCodeExt   = Join-Path $Root "vscode-extension"
$ErrorActionPreference = "Stop"

function Write-Header($text) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  $text" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function Write-Step($text) {
    Write-Host "`n>> $text" -ForegroundColor Yellow
}

function Write-Success($text) {
    Write-Host "✅ $text" -ForegroundColor Green
}

function Write-Fail($text) {
    Write-Host "❌ $text" -ForegroundColor Red
}

function Prompt-YesNo($question) {
    $answer = Read-Host "$question (Y/n)"
    return ($answer.Trim().ToLower() -ne "n")
}

# -----------------------------------------------------------------------------
# 1. Show recent commits since the last git tag
# -----------------------------------------------------------------------------
Write-Header "PromptSensei Deploy Tool"

Write-Step "Recent commits since last tag:"
$lastTag = git describe --tags --abbrev=0 2>$null
if ($lastTag) {
    git log "$lastTag..HEAD" --oneline
} else {
    git log --oneline -10
    Write-Host "(No tags found — showing last 10 commits)" -ForegroundColor DarkGray
}

# -----------------------------------------------------------------------------
# 2. Choose version bump
# -----------------------------------------------------------------------------
Write-Step "Choose version bump type:"
Write-Host "  [1] patch  (1.0.0 → 1.0.1)  — Bug fixes"
Write-Host "  [2] minor  (1.0.0 → 1.1.0)  — New features"
Write-Host "  [3] major  (1.0.0 → 2.0.0)  — Breaking changes"
Write-Host "  [4] skip   — Keep current version"

$bumpChoice = Read-Host "Enter choice [1/2/3/4]"

$bumpType = switch ($bumpChoice) {
    "1" { "patch" }
    "2" { "minor" }
    "3" { "major" }
    default { $null }
}

if ($bumpType) {
    Write-Step "Bumping $bumpType version..."

    # Bump NPM package version
    Set-Location $Root
    $newVersion = (npm version $bumpType --no-git-tag-version) -replace "^v", ""
    Write-Success "NPM package version → $newVersion"

    # Sync version into vscode-extension/package.json
    Set-Location $VsCodeExt
    npm version $newVersion --no-git-tag-version | Out-Null
    Write-Success "VS Code extension version → $newVersion"

    # Commit the version bump
    Set-Location $Root
    git add package.json vscode-extension/package.json
    git commit -m "chore: bump version to $newVersion"
    git tag "v$newVersion"
    Write-Success "Committed and tagged as v$newVersion"
} else {
    $newVersion = (Get-Content (Join-Path $Root "package.json") | ConvertFrom-Json).version
    Write-Host "Keeping current version: $newVersion" -ForegroundColor DarkGray
}

# -----------------------------------------------------------------------------
# 3. Build everything
# -----------------------------------------------------------------------------
Write-Step "Building NPM package..."
Set-Location $Root
npm run build
Write-Success "NPM build complete"

Write-Step "Building VS Code extension..."
Set-Location $VsCodeExt
npm run build
Write-Success "VS Code extension build complete"

# -----------------------------------------------------------------------------
# 4. Deploy to NPM?
# -----------------------------------------------------------------------------
Set-Location $Root
if (Prompt-YesNo "`nPublish to NPM as 'promptsensei-mcp@$newVersion'?") {
    Write-Step "Publishing to NPM..."
    npm publish
    Write-Success "Published to NPM: https://www.npmjs.com/package/promptsensei-mcp"
} else {
    Write-Host "Skipping NPM publish." -ForegroundColor DarkGray
}

# -----------------------------------------------------------------------------
# 5. Deploy to VS Code Marketplace?
# -----------------------------------------------------------------------------
Set-Location $VsCodeExt
if (Prompt-YesNo "`nPublish to VS Code Marketplace?") {
    $pat = Read-Host "Enter your Azure DevOps Personal Access Token (PAT)" -AsSecureString
    $patPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($pat)
    )

    Write-Step "Packaging extension..."
    npx @vscode/vsce package --no-dependencies
    Write-Success "Packaged: promptsensei-$newVersion.vsix"

    Write-Step "Publishing to VS Code Marketplace..."
    npx @vscode/vsce publish -p $patPlain
    Write-Success "Published! Users can now install: ext install KeyurBhogayata.promptsensei"
} else {
    Write-Host "Skipping VS Code Marketplace publish." -ForegroundColor DarkGray

    # Still offer to package a .vsix for manual install
    if (Prompt-YesNo "Package a .vsix file for local install instead?") {
        Write-Step "Packaging .vsix..."
        npx @vscode/vsce package --no-dependencies
        $vsixPath = Join-Path $VsCodeExt "promptsensei-$newVersion.vsix"
        Write-Success "Created: $vsixPath"
        Write-Host "Install it locally with:" -ForegroundColor DarkGray
        Write-Host "  code --install-extension `"$vsixPath`"" -ForegroundColor DarkGray
    }
}

# -----------------------------------------------------------------------------
# 6. Push to GitHub
# -----------------------------------------------------------------------------
Set-Location $Root
if (Prompt-YesNo "`nPush commits and tags to GitHub?") {
    Write-Step "Pushing to GitHub..."
    git push
    git push --tags
    Write-Success "Pushed to GitHub!"
} else {
    Write-Host "Skipping GitHub push." -ForegroundColor DarkGray
}

Write-Header "Deploy Complete 🚀"
Write-Host "Version: $newVersion" -ForegroundColor White
Set-Location $Root
