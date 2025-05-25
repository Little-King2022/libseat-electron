const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

// 数据库名称
const DB_NAME = 'libseat.db';

// 获取用户目录路径
const userDbPath = path.join(app.getPath('userData'), DB_NAME);
console.log('📂 用户数据库路径：', userDbPath);
// 获取模板数据库路径（在 resources/assets 目录下）
if (!app.isPackaged) {
  // 开发模式下直接从项目目录下读取 assets 目录
  templateDbPath = path.join(__dirname, '../assets', DB_NAME);
  console.log('📂 模板数据库路径：', templateDbPath);
} else {
  // 打包后从 app.asar 的 resources 路径中读取
  templateDbPath = path.join(process.resourcesPath, 'assets', DB_NAME);
  console.log('📂 模板数据库路径：', templateDbPath);
}
// 如果用户目录下数据库不存在，则复制模板
if (!fs.existsSync(userDbPath)) {
  try {
    fs.copyFileSync(templateDbPath, userDbPath);
    console.log('📦 首次启动，已复制数据库模板文件至用户目录：', userDbPath);
  } catch (error) {
    console.error('❌ 无法复制数据库模板文件：', error);
    throw error;
  }
}

// 创建数据库连接
const db = new Database(userDbPath, { verbose: console.log });

/**
 * 执行查询并返回所有结果行
 * @param {string} sql - SQL查询语句
 * @param {Array} params - 查询参数
 * @returns {Array} 查询结果行数组
 */
function query(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.all(params);
}

/**
 * 执行SQL语句（如INSERT, UPDATE, DELETE等）
 * @param {string} sql - SQL语句
 * @param {Array} params - SQL参数
 * @returns {Object} 包含lastInsertRowid和changes属性的对象
 */
function run(sql, params = []) {
  const stmt = db.prepare(sql);
  const result = stmt.run(params);
  return result;
}

module.exports = {
  query,
  run
};
