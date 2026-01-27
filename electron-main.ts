
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { startServer } from './server/index';

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  // Start the backend server first
  await startServer();

  // Use native Electron property to check for dev environment
  // app.isPackaged is false when running in development
  const isDev = !app.isPackaged;

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    show: false,
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
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
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
