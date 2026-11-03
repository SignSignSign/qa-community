const userModel = require('../models/userModel');
const questionModel = require('../models/questionModel');
const answerModel = require('../models/answerModel');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getPageParams = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(query.pageSize, 10) || 10, 1), 50);
  return { page, pageSize };
};

// GET /api/users/me 当前登录用户信息
exports.me = (req, res, next) => {
  try {
    const user = userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/me 编辑个人信息（邮箱 / 头像）
exports.updateMe = (req, res, next) => {
  try {
    const { email, avatar } = req.body || {};
    if (email === undefined && avatar === undefined) {
      return res.status(400).json({ message: '没有需要更新的字段' });
    }
    if (email !== undefined) {
      if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
        return res.status(400).json({ message: '邮箱格式不正确' });
      }
      const exist = userModel.findByEmail(email.trim().toLowerCase());
      if (exist && exist.id !== req.user.id) {
        return res.status(400).json({ message: '该邮箱已被其他账号使用' });
      }
    }
    if (avatar !== undefined && typeof avatar !== 'string') {
      return res.status(400).json({ message: '头像需为 URL 字符串' });
    }

    userModel.updateProfile(req.user.id, {
      email: email ? email.trim().toLowerCase() : undefined,
      avatar
    });
    res.json(userModel.findById(req.user.id));
  } catch (err) {
    next(err);
  }
};

// GET /api/users/me/questions 我的提问（分页）
exports.myQuestions = (req, res, next) => {
  try {
    const { page, pageSize } = getPageParams(req.query);
    const { list, total } = questionModel.listByAuthor(req.user.id, page, pageSize);
    res.json({ list, total, page, pageSize });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/me/answers 我的回答（分页，附问题标题）
exports.myAnswers = (req, res, next) => {
  try {
    const { page, pageSize } = getPageParams(req.query);
    const { list, total } = answerModel.listByAuthor(req.user.id, page, pageSize);
    res.json({ list, total, page, pageSize });
  } catch (err) {
    next(err);
  }
};
