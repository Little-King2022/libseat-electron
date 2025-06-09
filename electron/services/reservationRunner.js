const fs = require('fs');
const path = require('path');
const axios = require('axios');

const dataPath = process.env.USER_DATA_PATH || process.cwd();
const TASK_FILE = path.join(dataPath, 'reservation-task.json');
const LOG_FILE = path.join(dataPath, 'reservation.log');

function appendLog(content) {
  const line = `[${new Date().toLocaleString('zh-CN', { hour12: false })}] ${content}\n`;
  fs.appendFileSync(LOG_FILE, line, 'utf-8');
}

async function reserveSeat(task) {
  // TODO: implement seat reservation logic here
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
      process.exit(1);
    }
  } catch (err) {
    appendLog(`cookie 保活异常: ${err.message}`);
    process.exit(1);
  }
}

async function main() {
  try {
    if (!fs.existsSync(TASK_FILE)) {
      appendLog('任务配置文件不存在');
      return;
    }
    const task = JSON.parse(fs.readFileSync(TASK_FILE, 'utf-8'));
    appendLog('开始执行预约任务');
    await keepCookieAlive(task.cookie);
    const timer = setInterval(() => keepCookieAlive(task.cookie), 10 * 60 * 1000);
    await reserveSeat(task);
    clearInterval(timer);
    appendLog('预约任务结束');
  } catch (err) {
    appendLog(`预约任务异常: ${err.message}`);
  }
}

main();
