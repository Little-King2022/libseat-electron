const { app, BrowserWindow, ipcMain, shell } = require('electron');

const path = require('node:path');
const { startApiServer } = require('./api');

const { doLogin, startAutoRefresh, stopAutoRefresh, getUserCredit } = require('./services/loginManager.js');
const {
  getAllAutoAppointments,
  getResvByStuId,
  searchSeatByName,
  getSystemSetting,
  updateSystemSetting,
  execSQL
} = require('./services/dbService.js');

const { updateSeatMenuDatabase, updateSeatCountDatabase, updateSeatListDatabase } = require('./services/updateSeatMenuDatabaseService.js');
const taskService = require('./services/taskService.js');

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

// 注册 ipcMain 处理器
ipcMain.handle('login', async (_event, credentials) => {
  return await doLogin(credentials);
});

ipcMain.handle('start-auto-refresh', () => {
  startAutoRefresh();
});

ipcMain.handle('stop-auto-refresh', () => {
  stopAutoRefresh();
});

ipcMain.handle('db:get-all-auto-appointments', () => {
  return getAllAutoAppointments();
});

ipcMain.handle('db:get-resv-by-stuid', (_event, stuId) => {
  return getResvByStuId(stuId);
});

ipcMain.handle('db:search-seat-by-name', (_event, name) => {
  return searchSeatByName(name);
});

ipcMain.handle('db:get-system-setting', () => {
  return getSystemSetting();
});

ipcMain.handle('db:update-system-setting', (_event, setting) => {
  return updateSystemSetting(setting);
});

ipcMain.handle('get-app-path', () => {
  return app.getAppPath();
});

ipcMain.handle('open-pdf', async (event, pdfName) => {
  try {
    const pdfPath = path.join(path.dirname(app.getAppPath()), 'assets', pdfName);
    console.log('尝试打开PDF:', pdfPath);

    const result = await shell.openPath(pdfPath);
    if (result) {
      // 有错误信息返回
      console.error('打开PDF失败:', result);
      return { success: false, error: result };
    }

    return { success: true };
  } catch (error) {
    console.error('打开PDF异常:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-seat-menu-database', async () => {
  return await updateSeatMenuDatabase();
})

ipcMain.handle('update-seat-count-database', async () => {
  return await updateSeatCountDatabase();
})

ipcMain.handle('update-seat-list-database', async () => {
  return await updateSeatListDatabase();
})

ipcMain.handle('db:exec-sql', async (_event, sql, params) => {
  return await execSQL(sql, params);
});

ipcMain.handle('get-user-credit', async () => {
  return await getUserCredit();
})

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('task:save', (_event, task) => {
  try {
    taskService.saveTask(task)
    taskService.appendLog('创建预约任务')
    return { success: true }
  } catch (err) {
    console.error('save task error:', err)
    return { success: false, message: err.message }
  }
})

ipcMain.handle('task:load', () => {
  try {
    const data = taskService.loadTask()
    const log = taskService.readLog()
    return { success: true, data, log }
  } catch (err) {
    console.error('load task error:', err)
    return { success: false, message: err.message }
  }
})

ipcMain.handle('task:delete', () => {
  try {
    taskService.deleteTask()
    taskService.appendLog('删除预约任务')
    return { success: true }
  } catch (err) {
    console.error('delete task error:', err)
    return { success: false, message: err.message }
  }
})

ipcMain.handle('task:is-running', () => {
  try {
    return taskService.isTaskRunning()
  } catch (err) {
    console.error('check task status error:', err)
    return false
  }
})

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 700,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // preload: path.join(__dirname, '../electron/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      // sandbox: false,
      webSecurity: false, // 关闭同源策略
    },
  });


  if (app.isPackaged) {
    const appPath = app.getAppPath();
    const filePath = path.join(__dirname, '../dist/index.html');
    const alternativePath = path.join(appPath, 'index.html');

    console.log('应用路径:', appPath);
    console.log('__dirname:', __dirname);
    console.log('尝试加载路径1:', filePath);
    console.log('尝试加载路径2:', alternativePath);

    // 检查文件是否存在
    const fs = require('fs');
    console.log('路径1文件存在:', fs.existsSync(filePath));
    console.log('路径2文件存在:', fs.existsSync(alternativePath));

    // 尝试加载存在的文件
    if (fs.existsSync(filePath)) {
      win.loadFile(filePath);
    } else if (fs.existsSync(alternativePath)) {
      win.loadFile(alternativePath);
    } else {
      console.error('找不到index.html文件');
    }
  } else {
    // 开发环境：加载 Vite 本地服务
    win.loadURL('http://localhost:5173');
    // 尝试打开开发工具
    win.webContents.on('did-finish-load', () => {
      win.webContents.openDevTools({ mode: 'detach' });
    });
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  createWindow();
  // 启动本地API服务
  startApiServer();
});