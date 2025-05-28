const db = require('../database/sqlite.js');

// 获取所有自动预约任务（auto_appo_list）
async function getAllAutoAppointments() {
  const sql = 'SELECT * FROM auto_appo_list ORDER BY created_at DESC';
  return await db.query(sql);
}

// 根据学号获取预约记录（resv_list）
async function getResvByStuId(stuId) {
  const sql = 'SELECT * FROM resv_list WHERE stu_id = ? ORDER BY resv_begin_time DESC';
  return await db.query(sql, [stuId]);
}

// 根据座位名模糊搜索（seat_list）
async function searchSeatByName(name) {
  const clean = name.replace(/[^a-zA-Z0-9-]/g, '');
  const sql = 'SELECT * FROM seat_list WHERE seat_name LIKE ? ORDER BY seat_name LIMIT 10';
  return await db.query(sql, [`%${clean}%`]);
}


// 获取当前系统设置（system）
async function getSystemSetting() {
  try {
    const sql = 'SELECT * FROM system LIMIT 1';
    const result = await db.query(sql);

    // 返回第一个结果，如果没有结果，则插入一条记录到数据库中
    if (result.length === 0) {
      const defaultSettings = {
        stu_id: null,
        stu_pwd: null,
        token: null,
        host_url: 'https://libseat.njfu.edu.cn',
        has_init: '0',
        notify_type: '0',
        id: 1,
        user_data: null,
      };

      const init_sql = 'INSERT INTO system (stu_id, stu_pwd, token, host_url, has_init, notify_type, id, user_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      await db.run(init_sql, Object.values(defaultSettings));

      // 递归调用获取新插入的设置
      return await getSystemSetting();
    }

    // 并返回插入后的结果
    return result[0] || null;
  } catch (error) {
    // 添加错误处理
    console.error('获取系统设置失败:', error);
    throw error;
  }
}

// 更新system表,只更新传入的字段
async function updateSystemSetting(setting) {
  try {
    // 检查参数是否为空
    if (!setting || typeof setting !== 'object') {
      throw new Error('参数错误: setting必须是一个对象');
    }

    // 构建动态SQL语句和参数数组
    const updateFields = [];
    const values = [];

    // 遍历setting对象的所有属性
    for (const [key, value] of Object.entries(setting)) {
      if (key !== 'id' && value !== undefined) { // 排除id字段,因为它是WHERE条件
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }

    // 如果没有要更新的字段,直接返回true
    if (updateFields.length === 0) {
      return true;
    }

    // 构建完整的SQL语句
    const sql = `UPDATE system SET ${updateFields.join(', ')} WHERE id = 1`;

    await db.run(sql, values);
    return true;
  }
  catch (error) {
    console.error('更新系统设置失败:', error);
    throw error; // 向上抛出错误,让调用者处理
  }
}

async function execSQL(sql) {
  const result = db.query(sql);
  return result;
}

module.exports = {
  getAllAutoAppointments,
  getResvByStuId,
  searchSeatByName,
  getSystemSetting,
  updateSystemSetting,
  execSQL
};
