$ErrorActionPreference = 'Stop'
Write-Host '============================================' -ForegroundColor Cyan
Write-Host ' HNL STRUCTURAL AI v1.2 - WINDOWS EXE BUILD' -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw 'Chua cai Node.js 22 LTS. Cai Node.js roi chay lai script.'
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw 'Khong tim thay npm.'
}

$nodeMajor = [int]((node -v).TrimStart('v').Split('.')[0])
if ($nodeMajor -lt 20) { throw 'Can Node.js 20 tro len; khuyen nghi Node.js 22 LTS.' }

Write-Host '[1/4] Cai dependencies...'
if (Test-Path package-lock.json) { npm ci --no-audit --no-fund } else { npm install --no-audit --no-fund }

Write-Host '[2/4] Kiem tra TypeScript...'
npm run lint

Write-Host '[3/4] Build web + server...'
npm run build

Write-Host '[4/4] Tao Setup EXE + Portable EXE...'
npm run dist:win

Write-Host ''
Write-Host 'BUILD HOAN TAT. File nam trong thu muc release\' -ForegroundColor Green
Get-ChildItem .\release\*.exe | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
