const db = require('../config/db');

// MySQL JSON 列在某些驱动版本返回字符串，统一解析为数组
const parseTags = (row) => {
  if (row && typeof row.tags === 'string') {
    try { row.tags = JSON.parse(row.tags); } catch { row.tags = []; }
  }
  return row;
};

// 创建问题
exports.create = ({ title, content, tags, authorId }) => {
  const stmt = db.prepare('INSERT INTO questions (title, content, tags, author_id) VALUES (?, ?, ?, ?)');
  const info = stmt.run(title, content, JSON.stringify(tags || []), authorId);
  return info.lastInsertRowid;
};

// 列表筛选条件组装
const buildWhere = ({ sort, tag, keyword }) => {
  const where = [];
  const params = [];
  if (sort === 'unsolved') where.push('q.is_solved = 0');
  if (tag) { where.push('q.tags LIKE ?'); params.push(`%"${tag}"%`); }
  if (keyword) { where.push('(q.title LIKE ? OR q.content LIKE ?)'); params.push(`%${keyword}%`, `%${keyword}%`); }
  return { whereSql: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
};

const orderSql = (sort) =>
  sort === 'hot' ? 'ORDER BY q.votes DESC, q.created_at DESC' : 'ORDER BY q.created_at DESC';

// 问题列表
exports.list = ({ sort, tag, keyword, page, pageSize }) => {
  const { whereSql, params } = buildWhere({ sort, tag, keyword });
  const limit = pageSize;
  const offset = (page - 1) * pageSize;
  const rows = db.prepare(
    `SELECT q.*, u.username AS author_name, u.avatar AS author_avatar
     FROM questions q
     JOIN users u ON u.id = q.author_id
     ${whereSql}
     ${orderSql(sort)}
     LIMIT ${limit} OFFSET ${offset}`
  ).all(...params);
  const countRow = db.prepare(`SELECT COUNT(*) AS total FROM questions q ${whereSql}`).get(...params);
  return { list: rows.map(parseTags), total: countRow.total };
};

// 问题详情
exports.findById = (id) => {
  const row = db.prepare(
    `SELECT q.*, u.username AS author_name, u.avatar AS author_avatar
     FROM questions q
     JOIN users u ON u.id = q.author_id
     WHERE q.id = ?`
  ).get(id);
  return row ? parseTags(row) : null;
};

// 浏览数 +1
exports.incrementViews = (id) => {
  db.prepare('UPDATE questions SET views = views + 1 WHERE id = ?').run(id);
};

// 更新问题
exports.update = (id, { title, content, tags }) => {
  db.prepare('UPDATE questions SET title = ?, content = ?, tags = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run(title, content, JSON.stringify(tags || []), id);
};

// 删除问题
exports.remove = (id) => {
  db.prepare('DELETE FROM questions WHERE id = ?').run(id);
};

// 我的提问（分页）
exports.listByAuthor = (authorId, page, pageSize) => {
  const offset = (page - 1) * pageSize;
  const rows = db.prepare(
    `SELECT q.*, u.username AS author_name, u.avatar AS author_avatar
     FROM questions q
     JOIN users u ON u.id = q.author_id
     WHERE q.author_id = ?
     ORDER BY q.created_at DESC
     LIMIT ${pageSize} OFFSET ${offset}`
  ).all(authorId);
  const countRow = db.prepare('SELECT COUNT(*) AS total FROM questions WHERE author_id = ?').get(authorId);
  return { list: rows.map(parseTags), total: countRow.total };
};
