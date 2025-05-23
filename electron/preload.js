const { ipcRenderer, contextBridge } = require('electron');
// const service = require('./services/dbService.js');
// const loginManager = require('./services/loginManager.js');

// 统一暴露一个 window.api
contextBridge.exposeInMainWorld('api', {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  // 本地数据库调用
  // getAllAutoAppointments: service.getAllAutoAppointments,
  // getResvByStuId: service.getResvByStuId,
  // searchSeatByName: service.searchSeatByName,
  // getSystemSetting: service.getSystemSetting,
  // updateSystemSetting: service.updateSystemSetting,

  // 登录调用
  // login: loginManager.doLogin,
  // startAutoRefresh: loginManager.startAutoRefresh,
  // stopAutoRefresh: loginManager.stopAutoRefresh,
  
  // 可选封装的请求方式（如使用主进程做转发）
  // async request(method, url, data) {
  //   try {
  //     const response = await ipcRenderer.invoke('api-request', {
  //       method,
  //       url,
  //       data,
  //     });
  //     return response;
  //   } catch (error) {
  //     console.error('API请求错误:', error);
  //     throw error;
  //   }
  // },
  
  // 添加专门的请求方法
  // async sendRequest(options) {
  //   return await ipcRenderer.invoke('send-request', options);
  // },

  // 添加getAppPath方法
  getAppPath: () => ipcRenderer.invoke('get-app-path'),

  // 添加openPDF方法
  openPDF: (pdfName) => ipcRenderer.invoke('open-pdf', pdfName)
});

// 单独暴露 ipcRenderer（可选）
// contextBridge.exposeInMainWorld('ipcRenderer', {
//   on(channel, listener) {
//     return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
//   },
//   off(channel, ...omit) {
//     return ipcRenderer.off(channel, ...omit);
//   },
//   send(channel, ...omit) {
//     return ipcRenderer.send(channel, ...omit);
//   },
//   invoke(channel, ...omit) {
//     return ipcRenderer.invoke(channel, ...omit);
//   }
// });