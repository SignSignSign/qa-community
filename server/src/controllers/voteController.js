const db = require('../config/db');
const { POINTS } = require('../config/constants');

// 目标类型 → 数据表 / 作者积分奖励 映射
const TARGET_CONFIG = {
  question: { table: 'questions', points: POINTS.QUESTION_UPVOTE },
  answer: { table: 'answers', points: POINTS.ANSWER_UPVOTE }
};

// POST /api/votes 点赞 / 取消点赞（toggle，事务保证数据一致性）
exports.toggle = (req, res, next) => {
  try {
    const { target_type, target_id } = req.body;
    const targetId = Number(target_id);
    const userId = req.user.id;
    const { table, points } = TARGET_CONFIG[target_type];

    const result = db.transaction(() => {
      // 查询目标是否存在
      const target = db.prepare(`SELECT id, author_id, votes FROM ${table} WHERE id = ?`).get(targetId);
      if (!target) {
        const err = new Error(target_type === 'question' ? '问题不存在' : '回答不存在');
        err.status = 404;
        throw err;
      }
      if (target.author_id === userId) {
        const err = new Error('不能给自己的内容点赞');
        err.status = 400;
        throw err;
      }

      // 查询是否已点赞
      const existingVote = db.prepare(
        'SELECT id FROM votes WHERE user_id = ? AND target_type = ? AND target_id = ?'
      ).get(userId, target_type, targetId);

      let voted;
      if (existingVote) {
        // 已点赞 → 取消点赞：删记录、计数 -1、作者积分回退
        db.prepare('DELETE FROM votes WHERE id = ?').run(existingVote.id);
        db.prepare(`UPDATE ${table} SET votes = votes - 1 WHERE id = ?`).run(targetId);
        db.prepare('UPDATE users SET points = points - ? WHERE id = ?').run(points, target.author_id);
        voted = false;
      } else {
        // 未点赞 → 点赞：写记录、计数 +1、作者积分奖励
        db.prepare('INSERT INTO votes (user_id, target_type, target_id) VALUES (?, ?, ?)')
          .run(userId, target_type, targetId);
        db.prepare(`UPDATE ${table} SET votes = votes + 1 WHERE id = ?`).run(targetId);
        db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(points, target.author_id);
        voted = true;
      }

      const newVotes = db.prepare(`SELECT votes FROM ${table} WHERE id = ?`).get(targetId).votes;
      return { voted, votes: newVotes };
    })();

    res.json(result);
  } catch (err) {
    next(err);
  }
};
