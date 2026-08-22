$ErrorActionPreference = "Stop"
Write-Host "=== HNL Structural AI - Windows Build ===" -ForegroundColor Cyan
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js 22+ is required." }
if (-not (Test-Path "assets/hnl-app.ico")) { throw "Missing assets/hnl-app.ico" }
if (-not (Test-Path "assets/hnl-app.png")) { throw "Missing assets/hnl-app.png" }
if (Test-Path package-lock.json) { npm ci --no-audit --no-fund } else { npm install --no-audit --no-fund }
npm run lint
$env:CSC_IDENTITY_AUTO_DISCOVERY="false"
npm run dist:win
$setup = Get-ChildItem release -Filter "HNL-Structural-AI-Setup-*.exe" -ErrorAction SilentlyContinue
$portable = Get-ChildItem release -Filter "HNL-Structural-AI-Portable-*.exe" -ErrorAction SilentlyContinue
if (-not $setup) { throw "Missing Setup EXE" }
if (-not $portable) { throw "Missing Portable EXE" }
Write-Host "Build completed:" -ForegroundColor Green
$setup | Format-Table Name, Length
$portable | Format-Table Name, Length
