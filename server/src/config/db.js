const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// SQLite 文件型数据库：无需安装任何数据库服务，开箱即用
const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'qa_community.db'));

// 开启外键约束（SQLite 默认关闭）
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = db;
