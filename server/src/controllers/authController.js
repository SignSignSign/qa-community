const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// 生成 7 天有效期 JWT
const signToken = (user) =>
  jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const username = req.body.username.trim();
    const email = req.body.email.trim().toLowerCase();
    const { password } = req.body;

    if (userModel.findByUsername(username)) {
      return res.status(400).json({ message: '用户名已被占用' });
    }
    if (userModel.findByEmail(email)) {
      return res.status(400).json({ message: '邮箱已被注册' });
    }

    const hash = await bcrypt.hash(password, 10);
    const id = userModel.create({ username, email, password: hash });
    const user = userModel.findById(id);

    res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const account = userModel.findByUsername(username.trim());
    if (!account) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }
    const match = await bcrypt.compare(password, account.password);
    if (!match) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }
    const user = userModel.findById(account.id);
    res.json({ token: signToken(user), user });
  } catch (err) {
    next(err);
  }
};
