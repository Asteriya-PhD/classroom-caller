const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: false, // 开发时不用全屏，生产时改为 true
    frame: true, // 开发时显示边框，生产时改为 false
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // 开发时打开 DevTools
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 通信：接收配置
ipcMain.handle('get-config', () => {
  return {
    supabaseUrl: store.get('supabaseUrl', ''),
    supabaseKey: store.get('supabaseKey', ''),
    fullscreen: store.get('fullscreen', false)
  };
});

ipcMain.handle('save-config', (event, config) => {
  store.set('supabaseUrl', config.supabaseUrl);
  store.set('supabaseKey', config.supabaseKey);
  store.set('fullscreen', config.fullscreen);
  
  if (config.fullscreen && mainWindow) {
    mainWindow.setFullScreen(true);
    mainWindow.setMenuBarVisibility(false);
  }
  
  return true;
});
