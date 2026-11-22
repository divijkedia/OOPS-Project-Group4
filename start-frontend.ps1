$ErrorActionPreference = "Stop"
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting Resolvo Web Portal (Port 5173)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

$BundledNode = Join-Path $ScriptDir ".tools\node"
if (Test-Path (Join-Path $BundledNode "node.exe")) {
    $env:PATH = "$BundledNode;$env:PATH"
    $NpmCmd = Join-Path $BundledNode "npm.cmd"
    Write-Host "[OK] Using Bundled Node: $BundledNode" -ForegroundColor Green
} elseif (Get-Command npm -ErrorAction SilentlyContinue) {
    $NpmCmd = "npm"
    Write-Host "[OK] Using System PATH Node/npm" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Node.js 18+ is required but was not found." -ForegroundColor Red
    Write-Host "Please install Node.js 18+ and ensure npm is in PATH." -ForegroundColor Yellow
    exit 1
}

Set-Location (Join-Path $ScriptDir "resolvo-frontend")

Write-Host "[OK] Starting Vite development server..." -ForegroundColor Green
& $NpmCmd run dev
