const { ipcMain } = require('electron');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const {
  getAllAutoAppointments,
  getResvByStuId,
  searchSeatByName,
  getSystemSetting,
  updateSystemSetting
} = require('./services/dbService.js');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// 图书馆座位数据模拟
const libraryData = {
  currentCount: 30,
  remainingCount: 20,
  resvCount: 40,
  freeCount: 60,
  floorData: {
    '2': { freeNum: 20, freeRate: 40 },
    '3': { freeNum: 25, freeRate: 50 },
    '4': { freeNum: 30, freeRate: 60 },
    '5': { freeNum: 15, freeRate: 30 },
    '6': { freeNum: 35, freeRate: 70 },
    '7': { freeNum: 40, freeRate: 80 },
  }
};

// 启动本地API服务
function startApiServer() {
  // 获取在馆人数
  app.get('/api/get_inlibnum', (req, res) => {
    res.json({
      result: 'success',
      current_count: libraryData.currentCount,
      remaining_count: libraryData.remainingCount
    });
  });

  // 获取预约统计
  app.get('/api/get_all_resv', (req, res) => {
    res.json({
      result: 'success',
      resvnum: libraryData.resvCount,
      freenum: libraryData.freeCount,
      freerate: (libraryData.freeCount / (libraryData.resvCount + libraryData.freeCount) * 100).toFixed(2)
    });
  });

  // 获取各楼层预约情况
  app.get('/api/get_room_resv/:floor', (req, res) => {
    const floor = req.params.floor;
    const floorInfo = libraryData.floorData[floor];
    if (floorInfo) {
      res.json({
        result: 'success',
        freenum: floorInfo.freeNum,
        freerate: floorInfo.freeRate
      });
    } else {
      res.json({ result: 'error', message: '楼层数据不存在' });
    }
  });

  // 座位搜索
  app.post('/api/search_seat_by_name', (req, res) => {
    const query = req.body.query;
    // 模拟座位搜索结果
    const results = [
      { id: 1, name: `${query}区域-A1`, status: '空闲' },
      { id: 2, name: `${query}区域-A2`, status: '已预约' },
      { id: 3, name: `${query}区域-A3`, status: '空闲' },
    ];
    res.json({ results });
  });

  // 学生搜索
  app.post('/api/search_stu', (req, res) => {
    const query = req.body.query;
    // 模拟学生搜索结果
    const stu_list = [
      { id: 1, name: '张三', stuId: '2021' + query },
      { id: 2, name: '李四', stuId: '2022' + query },
    ];
    res.json({ stu_list });
  });



  // 获取历史预约记录
  app.get('/api/get_resv_list', async (req, res) => {
    const system = await getSystemSetting(); 

    const two_month_ago = new Date();
    two_month_ago.setMonth(two_month_ago.getMonth() - 2);
    const three_days_later = new Date();
    three_days_later.setDate(three_days_later.getDate() + 3);
    const formatted_two_month_ago = two_month_ago.toISOString().substring(0, 10);
    const formatted_three_days_later = three_days_later.toISOString().substring(0, 10);

    var config = {
      method: 'get',
      url: 'https://libseat.njfu.edu.cn/ic-web/reserve/resvInfo',
      headers: {
        'Pragma': 'no-cache',
        'lan': '1',
        'Cookie': system.token,
      },
      params: {
        beginDate: formatted_two_month_ago,
        endDate: formatted_three_days_later,
        needStatus: 1024,
        page: 1,
        pageNum: 100,
        orderKey: 'gmt_create',
        orderModel: 'desc'
      }
    };
    axios(config).then(function (response) {
      if (response.status === 200 && response.data.code === 0) {
        const resv_list = response.data.data;
        res.json({
          resv_list,
          success: true
        });
      } else {
        res.json({
          message: response.data.message,
          success: false
        });
      }
    })
    .catch(function (error) {
      if (error.response) {
        // 服务器错误
        res.json({
          message: error.response.data.message,
          success: false
        });
      } else if (error.request) {
        // 网络错误
        res.json({
          message: '网络错误，请检查您的网络连接。',
          success: false
        });
      } else {
        // 其他错误
        res.json({
          message: error.message,
          success: false
        });
      }
    });
  });

  // 获取预约详细信息
  app.get('/api/get_resv_detail', async (req, res) => {
    const system = await getSystemSetting(); 

    const resvId = req.query.resvId;

    var config = {
      method: 'get',
      url: 'https://libseat.njfu.edu.cn/ic-web/reserve/operate/rec',
      headers: {
        'Pragma': 'no-cache',
        'lan': '1',
        'Cookie': system.token,
      },
      params: {
        resvId: resvId
      }
    };
    axios(config).then(function (response) {
      if (response.status === 200 && response.data.code === 0) {
        const resv_detail = response.data.data;
        res.json({
          resv_detail,
          success: true
        });
      } else {
        res.json({
          message: response.data.message,
          success: false
        });
      }
    })
    .catch(function (error) {
      if (error.response) {
        // 服务器错误
        res.json({
          message: error.response.data.message,
          success: false
        });
      } else if (error.request) {
        // 网络错误
        res.json({
          message: '网络错误，请检查您的网络连接。',
          success: false
        });
      } else {
        // 其他错误
        res.json({
          message: error.message,
          success: false
        });
      }
    });
  });




  // 启动服务器
  const port = 3000;
  app.listen(port, () => {
    console.log(`运行在 http://localhost:${port}`);
  });

  // 设置IPC通信
  setupIpcHandlers();
}

// 设置IPC通信处理程序
function setupIpcHandlers() {
  // 处理渲染进程的API请求
  ipcMain.handle('api-request', async (event, { method, url, data }) => {
    try {
      const response = await fetch(`http://localhost:3000${url}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      return await response.json();
    } catch (error) {
      console.error('API请求错误:', error);
      return { result: 'error', message: '请求失败' };
    }
  });
}
module.exports = {
  startApiServer,
  setupIpcHandlers
};
