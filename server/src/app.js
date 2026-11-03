const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const answerRoutes = require('./routes/answerRoutes');
const voteRoutes = require('./routes/voteRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 全局中间件
app.use(cors());
app.use(express.json());

// 路由挂载（回答路由挂在 /api/questions 下，符合 RESTful 嵌套设计）
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/questions', answerRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/users', userRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({ message: `接口不存在：${req.method} ${req.originalUrl}` });
});

// 全局统一错误处理中间件
app.use(errorHandler);

module.exports = app;
