const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { app } = require('electron');

const dataPath = app.getPath('userData');
const TASK_FILE = path.join(dataPath, 'reservation-task.json');
const LOG_FILE = path.join(dataPath, 'reservation.log');
const PID_FILE = path.join(dataPath, 'reservation.pid');

function startTaskProcess() {
  const script = path.join(__dirname, 'reservationRunner.js');
  const child = spawn(process.execPath, [script], {
    detached: true,
    stdio: 'ignore',
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', USER_DATA_PATH: dataPath },
    shell: process.platform === 'win32'
  });
  child.unref();
}

function stopTaskProcess() {
  if (!fs.existsSync(PID_FILE)) return;
  try {
    const pid = parseInt(fs.readFileSync(PID_FILE, 'utf-8'), 10);
    if (!isNaN(pid)) process.kill(pid);
  } catch (e) {
    console.warn('failed to stop reservation process', e);
  }
  fs.unlinkSync(PID_FILE);
}

function isTaskRunning() {
  if (!fs.existsSync(PID_FILE)) return false;
  try {
    const pid = parseInt(fs.readFileSync(PID_FILE, 'utf-8'), 10);
    if (isNaN(pid)) return false;
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

function saveTask(task) {
  fs.writeFileSync(TASK_FILE, JSON.stringify(task, null, 2), 'utf-8');
  startTaskProcess();
}

function loadTask() {
  if (fs.existsSync(TASK_FILE)) {
    return JSON.parse(fs.readFileSync(TASK_FILE, 'utf-8'));
  }
  return null;
}

function deleteTask() {
  stopTaskProcess();
  if (fs.existsSync(TASK_FILE)) {
    fs.unlinkSync(TASK_FILE);
  }
}

function appendLog(content) {
  const line = `[${new Date().toLocaleString('zh-CN', { hour12: false })}] ${content}\n`;
  fs.appendFileSync(LOG_FILE, line, 'utf-8');
}

function readLog() {
  if (fs.existsSync(LOG_FILE)) {
    const logContent = fs.readFileSync(LOG_FILE, 'utf-8');
    const logLines = logContent.split('\n').reverse().slice(1, 50);
    return logLines.join('\n');
  }
  return '';
}

module.exports = {
  saveTask,
  loadTask,
  deleteTask,
  appendLog,
  readLog,
  startTaskProcess,
  stopTaskProcess,
  isTaskRunning,
};
