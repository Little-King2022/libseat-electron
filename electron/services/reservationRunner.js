const fs = require('fs');
const path = require('path');
const axios = require('axios');

const dataPath = process.env.USER_DATA_PATH || process.cwd();
const TASK_FILE = path.join(dataPath, 'reservation-task.json');
const LOG_FILE = path.join(dataPath, 'reservation.log');
const PID_FILE = path.join(dataPath, 'reservation.pid');
const START_TIME = path.join(dataPath, 'start.time');

function writePidFile() {
  fs.writeFileSync(PID_FILE, String(process.pid), 'utf-8');
}

function cleanPidFile() {
  if (fs.existsSync(PID_FILE)) {
    fs.unlinkSync(PID_FILE);
  }
}

function appendLog(message) {
  const time = new Date().toLocaleString('zh-CN', { hour12: false });
  fs.appendFileSync(LOG_FILE, `[${time}] ${message}\n`, 'utf-8');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function postReservation(startTime, devId, endTime, user) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Cookie': user.cookie,
    'Content-Type': 'application/json',
  };

  const data = {
    appAccNo: user.accNo,
    captcha: "",
    memberKind: 1,
    memo: "",
    resvBeginTime: startTime,
    resvDev: [devId],
    resvEndTime: endTime,
    resvMember: [parseInt(user.accNo)],
    resvProperty: 0,
    sysKind: 8,
    testName: ""
  };

  const url = "https://libseat.njfu.edu.cn/ic-web/reserve";

  try {
    const sendTime = Date.now();
    const response = await axios.post(url, data, { headers, timeout: 10000 });
    const receiveTime = Date.now();
    appendLog(`HTTP 请求成功，用时 ${(receiveTime - sendTime) / 1000}s，学号: ${user.stuId}, 姓名: ${user.stuName}, 座位: ${devId}`);
    return response.data.message || "未知错误";
  } catch (err) {
    appendLog(`HTTP 请求失败: ${err.message}`);
    return "error";
  }
}

async function startReservation(startTime, devIdList, endTime, user) {
  appendLog(`等待预约开始时间...`);

  // 等待到 06:59:59.7 以后再开始抢座
  while (true) {
    const now = new Date();
    if (
      now.getHours() === 6 &&
      now.getMinutes() === 59 &&
      now.getSeconds() === 59 &&
      now.getMilliseconds() >= 700
    ) {
      appendLog(`达到抢座时间，开始抢座: ${user.stuId}, ${user.stuName}`);
      break;
    }
    await sleep(100);
  }

  let attempts = 0;
  let index = 0;

  while (true) {
    if (attempts >= 20) {
      appendLog(`尝试次数过多，终止抢座: ${user.stuId}`);
      // 更新TASK_FILE中的result字段
      const task = JSON.parse(fs.readFileSync(TASK_FILE, 'utf-8'));
      task.result = `尝试次数过多，终止抢座: ${user.stuId}, ${user.stuName}`;
      fs.writeFileSync(TASK_FILE, JSON.stringify(task, null, 2), 'utf-8');
      return;
    }

    const devId = devIdList[index].id;
    const result = await postReservation(startTime, devId, endTime, user);
    attempts++;

    if (result === "新增成功") {
      appendLog(`预约成功: ${user.stuId}, ${user.stuName}, 座位: ${devId}`);
      // 更新TASK_FILE中的result字段
      const task = JSON.parse(fs.readFileSync(TASK_FILE, 'utf-8'));
      task.result = `预约成功: ${user.stuId}, ${user.stuName}, 座位: ${devId}`;
      fs.writeFileSync(TASK_FILE, JSON.stringify(task, null, 2), 'utf-8');
      return;
    } else if (result.includes("设备在该时间段内已被预约") || result.includes("当前设备正在被预约")) {
      appendLog(`设备已被预约，尝试下一个: ${devId}`);
      if (index < devIdList.length - 1) {
        index++;
        continue;
      }
    } else if (result.includes("用户未登录") || result.includes("处罚期") || result.includes("有预约")) {
      appendLog(`用户不可预约: ${result}`);
      // 更新TASK_FILE中的result字段
      const task = JSON.parse(fs.readFileSync(TASK_FILE, 'utf-8'));
      task.result = `用户不可预约: ${user.stuId}, ${user.stuName}, 原因: ${result}`;
      fs.writeFileSync(TASK_FILE, JSON.stringify(task, null, 2), 'utf-8');
      return;
    } else {
      appendLog(`其他错误: ${result}`);
    }
  }
}

async function keepCookieAlive(cookie) {
  try {
    const res = await axios.get('https://libseat.njfu.edu.cn/ic-web/creditPunishRec/surPlus', {
      headers: {
        Cookie: cookie,
        Pragma: 'no-cache',
        lan: '1',
      },
      timeout: 10000,
    });
    if (res.status === 200 && res.data.code === 0) {
      appendLog('cookie 保活成功');
    } else {
      appendLog('cookie 保活失败');
    }
  } catch (err) {
    appendLog(`cookie 保活异常: ${err.message}`);
  }
}

function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function computeReservationTime() {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dateStr = formatDate(tomorrow);  // 本地时间，格式为 YYYY-MM-DD

  // 读取start.time文件，如果存在则使用该时间，否则使用8:00
  const startTimeSetting = fs.existsSync(START_TIME) ? fs.readFileSync(START_TIME, 'utf-8') : '08:00';
  // 使用正则表达式检查startTimeSetting是否为HH:MM格式
  const startTimeRegex = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
  var startTime = startTimeRegex.test(startTimeSetting) ? startTimeSetting : '08:00';
  startTime = `${dateStr} ${startTime}:00`;

  const isThursday = now.getDay() === 4;
  const endTime = `${dateStr} ${isThursday ? '20:00:00' : '22:00:00'}`;

  appendLog(`预约时间: ${startTime} - ${endTime}`);
  return { startTime, endTime };
}


async function main() {
  try {
    writePidFile();
    if (!fs.existsSync(TASK_FILE)) {
      appendLog('配置文件不存在，退出任务');
      return;
    }

    const task = JSON.parse(fs.readFileSync(TASK_FILE, 'utf-8'));
    const user = {
      stuId: task.stuId,
      stuName: task.stuName,
      stuPwd: task.stuPwd,
      cookie: task.cookie,
      accNo: JSON.parse(task.userData).accNo
    };

    const { startTime, endTime } = computeReservationTime();
    appendLog(`任务启动，准备预约: ${user.stuId}, ${user.stuName}`);
    await keepCookieAlive(user.cookie);
    const timer = setInterval(() => keepCookieAlive(user.cookie), 10 * 60 * 1000);

    await startReservation(startTime, task.seatList, endTime, user);

    clearInterval(timer);
    appendLog(`预约任务完成: ${user.stuId}, ${user.stuName}`);
    cleanPidFile();
  } catch (err) {
    appendLog(`任务异常: ${err.message}`);
    cleanPidFile();
  }
}

main();
