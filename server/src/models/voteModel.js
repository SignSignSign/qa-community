const db = require('../config/db');

// 查询某用户对某目标的点赞记录
exports.findOne = (userId, targetType, targetId) => {
  return db.prepare(
    'SELECT id FROM votes WHERE user_id = ? AND target_type = ? AND target_id = ?'
  ).get(userId, targetType, targetId) || null;
};

// 写入点赞记录
exports.create = (userId, targetType, targetId) => {
  db.prepare(
    'INSERT INTO votes (user_id, target_type, target_id) VALUES (?, ?, ?)'
  ).run(userId, targetType, targetId);
};

// 删除点赞记录
exports.remove = (id) => {
  db.prepare('DELETE FROM votes WHERE id = ?').run(id);
};

// 批量查询用户对一组目标的点赞情况，返回已点赞的 target_id 数组
exports.findUserVotes = (userId, targetType, targetIds) => {
  if (!targetIds.length) return [];
  const placeholders = targetIds.map(() => '?').join(',');
  const rows = db.prepare(
    `SELECT target_id FROM votes
     WHERE user_id = ? AND target_type = ? AND target_id IN (${placeholders})`
  ).all(userId, targetType, ...targetIds);
  return rows.map((r) => r.target_id);
};
