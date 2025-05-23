import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./libseat.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS seat_list (
      id INTEGER PRIMARY KEY,
      seat_id TEXT,
      seat_name TEXT,
      room_id TEXT,
      room_name TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS resv_list (
      id INTEGER PRIMARY KEY,
      resv_id TEXT,
      seat_id TEXT,
      seat_name TEXT,
      stu_id TEXT,
      stu_name TEXT,
      resv_begin_time TEXT,
      resv_end_time TEXT,
      resv_check_time TEXT,
      resv_status INTEGER
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS auto_appo_list (
      id INTEGER PRIMARY KEY,
      resv_begin_time TEXT,
      resv_end_time TEXT,
      seat_list TEXT,
      is_enabled INTEGER,
      created_at TEXT,
      resv_status TEXT
    );
  `);
});

db.close();
