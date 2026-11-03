-- =============================================
-- 问答社区数据库初始化脚本（SQLite 方言）
-- 数据库文件：server/data/qa_community.db（自动创建）
-- 执行方式：cd server && npm run init-db
-- =============================================

PRAGMA foreign_keys = ON;

-- 按外键依赖顺序删除旧表（可重复执行）
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS answers;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS users;

-- =============================================
-- 1. 用户表
-- =============================================
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,              -- 用户ID
  username TEXT NOT NULL UNIQUE,                     -- 用户名（唯一）
  email TEXT NOT NULL UNIQUE,                        -- 邮箱（唯一）
  password TEXT NOT NULL,                            -- 密码（bcrypt加密存储）
  avatar TEXT DEFAULT NULL,                          -- 头像URL
  points INTEGER NOT NULL DEFAULT 100,               -- 用户积分（注册初始100分）
  created_at TEXT NOT NULL DEFAULT (datetime('now')) -- 注册时间
);

-- =============================================
-- 2. 问题表
-- =============================================
CREATE TABLE questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,              -- 问题ID
  title TEXT NOT NULL,                               -- 问题标题
  content TEXT NOT NULL,                             -- 问题描述（Markdown格式）
  tags TEXT NOT NULL DEFAULT '[]',                   -- 标签（JSON数组字符串）
  author_id INTEGER NOT NULL,                        -- 提问者ID
  views INTEGER NOT NULL DEFAULT 0,                  -- 浏览次数
  answers_count INTEGER NOT NULL DEFAULT 0,          -- 回答数量
  votes INTEGER NOT NULL DEFAULT 0,                  -- 点赞数
  is_solved INTEGER NOT NULL DEFAULT 0,              -- 是否已解决：0未解决 1已解决
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE INDEX idx_questions_author_id ON questions (author_id);
CREATE INDEX idx_questions_is_solved ON questions (is_solved);
CREATE INDEX idx_questions_created_at ON questions (created_at);

-- =============================================
-- 3. 回答表
-- =============================================
CREATE TABLE answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,              -- 回答ID
  content TEXT NOT NULL,                             -- 回答内容（Markdown格式）
  author_id INTEGER NOT NULL,                        -- 回答者ID
  question_id INTEGER NOT NULL,                      -- 所属问题ID
  votes INTEGER NOT NULL DEFAULT 0,                  -- 点赞数
  is_accepted INTEGER NOT NULL DEFAULT 0,            -- 是否被采纳：0否 1是
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
);
CREATE INDEX idx_answers_question_id ON answers (question_id);
CREATE INDEX idx_answers_author_id ON answers (author_id);

-- =============================================
-- 4. 点赞中间表
-- =============================================
CREATE TABLE votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,              -- 点赞记录ID
  user_id INTEGER NOT NULL,                          -- 点赞用户ID
  target_type TEXT NOT NULL CHECK (target_type IN ('question', 'answer')), -- 目标类型
  target_id INTEGER NOT NULL,                        -- 目标ID（问题或回答的id）
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, target_type, target_id),          -- 同一用户对同一目标只能点赞一次
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE INDEX idx_votes_target ON votes (target_type, target_id);
