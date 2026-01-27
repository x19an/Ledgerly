
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { startServer } from './server/index';
import { autoUpdater } from 'electron-updater';

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  await startServer();

  const isDev = !app.isPackaged;

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    show: false,
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: isDev
    },
    backgroundColor: '#0a0a0a',
    title: 'Ledgerly'
  });

  const startURL = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(app.getAppPath(), 'dist/index.html')}`;

  mainWindow.loadURL(startURL);

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // --- Auto Updater Logic ---
  
  autoUpdater.on('update-available', (info) => {
    mainWindow?.webContents.send('update_available', info);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow?.webContents.send('download_progress', progressObj.percent);
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow?.webContents.send('update_downloaded');
  });

  ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
  });

  ipcMain.on('check_for_updates', () => {
    autoUpdater.checkForUpdates();
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if ((process as any).platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
