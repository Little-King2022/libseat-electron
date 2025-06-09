const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const dataPath = app.getPath('userData');
const TASK_FILE = path.join(dataPath, 'reservation-task.json');
const LOG_FILE = path.join(dataPath, 'reservation.log');

function saveTask(task) {
  fs.writeFileSync(TASK_FILE, JSON.stringify(task, null, 2), 'utf-8');
}

function loadTask() {
  if (fs.existsSync(TASK_FILE)) {
    return JSON.parse(fs.readFileSync(TASK_FILE, 'utf-8'));
  }
  return null;
}

function deleteTask() {
  if (fs.existsSync(TASK_FILE)) {
    fs.unlinkSync(TASK_FILE);
  }
}

function appendLog(content) {
  const line = `[${new Date().toISOString()}] ${content}\n`;
  fs.appendFileSync(LOG_FILE, line, 'utf-8');
}

function readLog() {
  if (fs.existsSync(LOG_FILE)) {
    return fs.readFileSync(LOG_FILE, 'utf-8');
  }
  return '';
}

module.exports = {
  saveTask,
  loadTask,
  deleteTask,
  appendLog,
  readLog,
};
