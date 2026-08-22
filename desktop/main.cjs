const { app, BrowserWindow, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const PORT = 17841;
let mainWindow;

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();
app.on('second-instance', () => {
  if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus(); }
});

function startLocalService() {
  process.env.NODE_ENV = 'production';
  process.env.PORT = String(PORT);
  require(path.join(__dirname, '..', 'dist', 'server.cjs'));
}

async function waitForService(url, timeoutMs = 15000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try { const r = await fetch(url); if (r.ok) return true; } catch (_) {}
    await new Promise(r => setTimeout(r, 250));
  }
  return false;
}

function registerDesktopIpc() {
  ipcMain.handle('hnl:save-project', async (_event, payload) => {
    const defaultName = `${(payload?.projectCode || payload?.name || 'HNL_Project').replace(/[^a-zA-Z0-9_-]+/g, '_')}.hnl.json`;
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Lưu dự án HNL', defaultPath: defaultName,
      filters: [{ name: 'HNL Structural Project', extensions: ['json'] }]
    });
    if (result.canceled || !result.filePath) return { canceled: true };
    fs.writeFileSync(result.filePath, JSON.stringify(payload, null, 2), 'utf8');
    return { canceled: false, filePath: result.filePath };
  });

  ipcMain.handle('hnl:open-project', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Mở dự án HNL', properties: ['openFile'],
      filters: [{ name: 'HNL Structural Project', extensions: ['json'] }]
    });
    if (result.canceled || !result.filePaths[0]) return { canceled: true };
    const filePath = result.filePaths[0];
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return { canceled: false, filePath, data };
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1540, height: 960, minWidth: 1120, minHeight: 720,
    show: false, backgroundColor: '#f1f5f9',
    icon: path.join(__dirname, '..', 'build', 'icon.ico'),
    autoHideMenuBar: true,
    title: 'HNL Structural AI Workstation',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true, nodeIntegration: false, sandbox: true,
      devTools: !app.isPackaged
    }
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(`http://127.0.0.1:${PORT}`)) { event.preventDefault(); if (/^https?:/i.test(url)) shell.openExternal(url); }
  });

  const ok = await waitForService(`http://127.0.0.1:${PORT}/api/health`);
  if (!ok) {
    dialog.showErrorBox('HNL Structural AI', 'Không khởi động được dịch vụ xử lý nội bộ. Hãy chạy lại ứng dụng.');
    app.quit(); return;
  }
  await mainWindow.loadURL(`http://127.0.0.1:${PORT}`);
  mainWindow.once('ready-to-show', () => mainWindow.show());
}

app.whenReady().then(async () => { registerDesktopIpc(); startLocalService(); await createWindow(); });
app.on('window-all-closed', () => app.quit());
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
