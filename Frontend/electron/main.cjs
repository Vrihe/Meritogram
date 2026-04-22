const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;
const devServerArg = process.argv.find((arg) => arg.startsWith('--url='));
const devServerUrl = devServerArg ? devServerArg.slice('--url='.length) : 'http://localhost:5173';
app.setPath('userData', path.join(app.getPath('temp'), 'student-learning-dashboard'));

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
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
