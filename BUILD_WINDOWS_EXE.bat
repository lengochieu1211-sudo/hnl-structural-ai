@echo off
setlocal
cd /d "%~dp0"
where powershell >nul 2>&1 || (echo Khong tim thay PowerShell & pause & exit /b 1)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0BUILD_WINDOWS_EXE.ps1"
if errorlevel 1 (
  echo.
  echo BUILD THAT BAI. Xem loi phia tren.
  pause
  exit /b 1
)
echo.
pause
