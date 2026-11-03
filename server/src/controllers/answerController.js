const db = require('../config/db');
const questionModel = require('../models/questionModel');
const answerModel = require('../models/answerModel');
const voteModel = require('../models/voteModel');
const { POINTS } = require('../config/constants');

// POST /api/questions/:id/answers 提交回答（回答者 +10 积分，事务）
exports.create = (req, res, next) => {
  try {
    const questionId = Number(req.params.id);
    const { content } = req.body;
    const userId = req.user.id;

    const question = questionModel.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: '问题不存在' });
    }

    const answerId = db.transaction(() => {
      const id = answerModel.create({ content, authorId: userId, questionId });
      db.prepare('UPDATE questions SET answers_count = answers_count + 1 WHERE id = ?').run(questionId);
      db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(POINTS.ANSWER, userId);
      return id;
    })();

    res.status(201).json(answerModel.findById(answerId));
  } catch (err) {
    next(err);
  }
};

// GET /api/questions/:id/answers 某问题全部回答（登录用户附 isVoted）
exports.list = (req, res, next) => {
  try {
    const questionId = Number(req.params.id);
    const question = questionModel.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: '问题不存在' });
    }

    const list = answerModel.listByQuestion(questionId);
    if (req.user && list.length) {
      const votedIds = voteModel.findUserVotes(req.user.id, 'answer', list.map((a) => a.id));
      list.forEach((a) => {
        a.isVoted = votedIds.includes(a.id);
      });
    } else {
      list.forEach((a) => {
        a.isVoted = false;
      });
    }

    res.json({ list, total: list.length });
  } catch (err) {
    next(err);
  }
};

// PUT /api/questions/:id/answers/:answerId 修改回答（仅作者）
exports.update = (req, res, next) => {
  try {
    const questionId = Number(req.params.id);
    const answerId = Number(req.params.answerId);
    const answer = answerModel.findById(answerId);
    if (!answer || answer.question_id !== questionId) {
      return res.status(404).json({ message: '回答不存在' });
    }
    if (answer.author_id !== req.user.id) {
      return res.status(403).json({ message: '只能编辑自己的回答' });
    }
    answerModel.update(answerId, req.body.content);
    res.json(answerModel.findById(answerId));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/questions/:id/answers/:answerId 删除回答（仅作者，事务）
exports.remove = (req, res, next) => {
  try {
    const questionId = Number(req.params.id);
    const answerId = Number(req.params.answerId);
    const answer = answerModel.findById(answerId);
    if (!answer || answer.question_id !== questionId) {
      return res.status(404).json({ message: '回答不存在' });
    }
    if (answer.author_id !== req.user.id) {
      return res.status(403).json({ message: '只能删除自己的回答' });
    }

    db.transaction(() => {
      // 清理该回答的点赞记录
      db.prepare("DELETE FROM votes WHERE target_type = 'answer' AND target_id = ?").run(answerId);
      // 若删除的是已采纳回答，问题恢复未解决状态
      if (answer.is_accepted) {
        db.prepare('UPDATE questions SET is_solved = 0 WHERE id = ?').run(questionId);
      }
      db.prepare('UPDATE questions SET answers_count = MAX(answers_count - 1, 0) WHERE id = ?').run(questionId);
      answerModel.remove(answerId);
    })();

    res.json({ message: '删除成功' });
  } catch (err) {
    next(err);
  }
};

// POST /api/questions/:id/answers/:answerId/accept 采纳最佳答案（仅提问者，事务）
exports.accept = (req, res, next) => {
  try {
    const questionId = Number(req.params.id);
    const answerId = Number(req.params.answerId);

    const question = questionModel.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: '问题不存在' });
    }
    if (question.author_id !== req.user.id) {
      return res.status(403).json({ message: '只有提问者本人可以采纳答案' });
    }
    if (question.is_solved) {
      return res.status(400).json({ message: '该问题已采纳过最佳答案，不可重复采纳' });
    }
    const answer = answerModel.findById(answerId);
    if (!answer || answer.question_id !== questionId) {
      return res.status(404).json({ message: '回答不存在' });
    }
    if (answer.author_id === req.user.id) {
      return res.status(400).json({ message: '不能采纳自己的回答' });
    }

    db.transaction(() => {
      db.prepare('UPDATE answers SET is_accepted = 1 WHERE id = ?').run(answerId);
      db.prepare('UPDATE questions SET is_solved = 1 WHERE id = ?').run(questionId);
      db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(POINTS.ACCEPTED, answer.author_id);
    })();

    res.json({ message: '采纳成功，该回答已被标记为最佳答案' });
  } catch (err) {
    next(err);
  }
};
