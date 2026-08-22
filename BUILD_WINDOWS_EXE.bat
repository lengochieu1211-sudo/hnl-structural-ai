@echo off
setlocal
cd /d "%~dp0"
echo ============================================
echo   HNL Structural AI - Build Windows EXE
echo ============================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0BUILD_WINDOWS_EXE.ps1"
if errorlevel 1 (
  echo.
  echo BUILD FAILED.
  pause
  exit /b 1
)
echo.
echo BUILD SUCCESS. Check the release folder.
pause
