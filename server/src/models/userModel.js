const db = require('../config/db');

// 对外暴露的用户字段（绝不返回密码）
const PUBLIC_FIELDS = 'id, username, email, avatar, points, created_at';

// 创建用户，返回 lastID
exports.create = ({ username, email, password }) => {
  const stmt = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
  const info = stmt.run(username, email, password);
  return info.lastInsertRowid;
};

// 登录/查重用：包含 password 字段
exports.findByUsername = (username) => {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username) || null;
};

exports.findByEmail = (email) => {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) || null;
};

// 公开信息查询：不含密码
exports.findById = (id) => {
  return db.prepare(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`).get(id) || null;
};

// 积分增减（delta 可为负数）
exports.updatePoints = (id, delta) => {
  db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(delta, id);
};

// 编辑个人信息（邮箱 / 头像）
exports.updateProfile = (id, { email, avatar }) => {
  const fields = [];
  const values = [];
  if (email !== undefined) { fields.push('email = ?'); values.push(email); }
  if (avatar !== undefined) { fields.push('avatar = ?'); values.push(avatar); }
  if (!fields.length) return;
  values.push(id);
  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
};
