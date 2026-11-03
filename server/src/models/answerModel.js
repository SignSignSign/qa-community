const db = require('../config/db');

// 创建回答
exports.create = ({ content, authorId, questionId }) => {
  const stmt = db.prepare('INSERT INTO answers (content, author_id, question_id) VALUES (?, ?, ?)');
  const info = stmt.run(content, authorId, questionId);
  return info.lastInsertRowid;
};

// 单个回答（含作者信息）
exports.findById = (id) => {
  return db.prepare(
    `SELECT a.*, u.username AS author_name, u.avatar AS author_avatar
     FROM answers a
     JOIN users u ON u.id = a.author_id
     WHERE a.id = ?`
  ).get(id) || null;
};

// 某问题的全部回答：已采纳置顶，其余按点赞数倒序、时间正序
exports.listByQuestion = (questionId) => {
  return db.prepare(
    `SELECT a.*, u.username AS author_name, u.avatar AS author_avatar
     FROM answers a
     JOIN users u ON u.id = a.author_id
     WHERE a.question_id = ?
     ORDER BY a.is_accepted DESC, a.votes DESC, a.created_at ASC`
  ).all(questionId);
};

// 更新回答内容
exports.update = (id, content) => {
  db.prepare('UPDATE answers SET content = ?, updated_at = datetime(\'now\') WHERE id = ?').run(content, id);
};

// 删除回答
exports.remove = (id) => {
  db.prepare('DELETE FROM answers WHERE id = ?').run(id);
};

// 我的回答（分页，附问题标题）
exports.listByAuthor = (authorId, page, pageSize) => {
  const offset = (page - 1) * pageSize;
  const rows = db.prepare(
    `SELECT a.*, q.title AS question_title
     FROM answers a
     JOIN questions q ON q.id = a.question_id
     WHERE a.author_id = ?
     ORDER BY a.created_at DESC
     LIMIT ${pageSize} OFFSET ${offset}`
  ).all(authorId);
  const countRow = db.prepare('SELECT COUNT(*) AS total FROM answers WHERE author_id = ?').get(authorId);
  return { list: rows, total: countRow.total };
};
