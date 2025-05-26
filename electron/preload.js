const { ipcRenderer, contextBridge } = require('electron');
// const service = require('./services/dbService.js');
// const loginManager = require('./services/loginManager.js');

// 统一暴露一个 window.api
contextBridge.exposeInMainWorld('api', {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
});