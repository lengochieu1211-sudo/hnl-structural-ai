# HNL Structural AI Workstation v1.3.2 — GitHub Build Fix

## Root cause from GitHub Actions
The v1.3.1 build reached Electron/NSIS successfully, then failed with:

`cannot find specified resource "build/icon.ico"`

The ZIP contained `build/icon.ico`, but `.gitignore` also ignored the entire `build/` directory. When the project was committed with Git/GitHub Desktop, the icon directory was not added to the repository. GitHub Actions therefore had no `build/icon.ico`.

## Fixes
- Moved tracked icon resources to `assets/hnl-app.ico` and `assets/hnl-app.png`.
- Removed runtime dependency on the ignored `build/` folder.
- Added explicit Windows app icon and NSIS installer/uninstaller/header icon.
- Added a GitHub Actions preflight step that fails immediately with a clear message if desktop resources are missing.
- Preserved `--publish never`, Setup/Portable separate names, ESM server build and TypeScript check.
- Version synchronized to 1.3.2.

## Expected outputs
- `HNL-Structural-AI-Setup-1.3.2-x64.exe`
- `HNL-Structural-AI-Portable-1.3.2-x64.exe`
- GitHub artifact: `HNL-Structural-AI-Windows-v1.3.2`
