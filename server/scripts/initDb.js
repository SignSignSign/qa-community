/**
 * 数据库一键初始化脚本（SQLite）
 * 读取 sql/init.sql 并执行，创建全部数据表
 * 数据库文件自动生成于 server/data/qa_community.db
 * 使用：npm run init-db
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../src/config/db');

try {
  const sql = fs.readFileSync(path.join(__dirname, '../sql/init.sql'), 'utf8');
  db.exec(sql);
  console.log('✔ 数据库初始化完成：4 张数据表已创建');
  console.log('  数据库文件位置：server/data/qa_community.db');
} catch (err) {
  console.error('✘ 数据库初始化失败：', err.message);
  process.exit(1);
}
