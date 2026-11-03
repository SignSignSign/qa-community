const db = require('../config/db');
const questionModel = require('../models/questionModel');
const voteModel = require('../models/voteModel');
const { POINTS } = require('../config/constants');

// POST /api/questions 发布问题（扣 5 积分，事务）
exports.create = (req, res, next) => {
  try {
    const { content, tags = [] } = req.body;
    const title = req.body.title.trim();
    const userId = req.user.id;

    // better-sqlite3 事务：多步写操作同时成功/失败
    const result = db.transaction(() => {
      const user = db.prepare('SELECT points FROM users WHERE id = ?').get(userId);
      if (!user) {
        const err = new Error('用户不存在');
        err.status = 404;
        throw err;
      }
      if (user.points < POINTS.ASK) {
        const err = new Error(`积分不足，发布问题需要 ${POINTS.ASK} 积分`);
        err.status = 400;
        throw err;
      }
      db.prepare('UPDATE users SET points = points - ? WHERE id = ?').run(POINTS.ASK, userId);
      return questionModel.create({ title, content, tags, authorId: userId });
    })();

    res.status(201).json(questionModel.findById(result));
  } catch (err) {
    next(err);
  }
};

// GET /api/questions 问题列表（排序 / 标签筛选 / 搜索 / 分页，登录用户附 isVoted）
exports.list = (req, res, next) => {
  try {
    const { sort = 'latest', tag, keyword } = req.query;
    if (!['latest', 'hot', 'unsolved'].includes(sort)) {
      return res.status(400).json({ message: 'sort 参数仅支持 latest / hot / unsolved' });
    }
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || 10, 1), 50);

    const { list, total } = questionModel.list({ sort, tag, keyword, page, pageSize });

    if (req.user && list.length) {
      const votedIds = voteModel.findUserVotes(req.user.id, 'question', list.map((q) => q.id));
      list.forEach((q) => {
        q.isVoted = votedIds.includes(q.id);
      });
    } else {
      list.forEach((q) => {
        q.isVoted = false;
      });
    }

    res.json({ list, total, page, pageSize });
  } catch (err) {
    next(err);
  }
};

// GET /api/questions/:id 问题详情（浏览数 +1）
exports.detail = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const question = questionModel.findById(id);
    if (!question) {
      return res.status(404).json({ message: '问题不存在' });
    }
    questionModel.incrementViews(id);
    question.views += 1;

    let isVoted = false;
    if (req.user) {
      isVoted = !!voteModel.findOne(req.user.id, 'question', id);
    }
    res.json({ ...question, isVoted });
  } catch (err) {
    next(err);
  }
};

// PUT /api/questions/:id 更新问题（仅作者）
exports.update = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const question = questionModel.findById(id);
    if (!question) {
      return res.status(404).json({ message: '问题不存在' });
    }
    if (question.author_id !== req.user.id) {
      return res.status(403).json({ message: '只能编辑自己发布的问题' });
    }
    const { content, tags = [] } = req.body;
    questionModel.update(id, { title: req.body.title.trim(), content, tags });
    res.json(questionModel.findById(id));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/questions/:id 删除问题（仅作者，事务清理相关点赞记录）
exports.remove = (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const question = questionModel.findById(id);
    if (!question) {
      return res.status(404).json({ message: '问题不存在' });
    }
    if (question.author_id !== req.user.id) {
      return res.status(403).json({ message: '只能删除自己发布的问题' });
    }

    db.transaction(() => {
      // 清理问题本身及其全部回答的点赞记录（answers 由外键级联删除）
      db.prepare(
        `DELETE FROM votes
         WHERE (target_type = 'question' AND target_id = ?)
            OR (target_type = 'answer' AND target_id IN (SELECT id FROM answers WHERE question_id = ?))`
      ).run(id, id);
      questionModel.remove(id);
    })();

    res.json({ message: '删除成功' });
  } catch (err) {
    next(err);
  }
};
