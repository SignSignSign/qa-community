# 问答社区 - 数据库设计文档

## 一、数据库概述

| 项目 | 说明 |
| --- | --- |
| 数据库名 | `qa_community` |
| 字符集 | `utf8mb4` / `utf8mb4_unicode_ci`（完整支持中文与 emoji） |
| 存储引擎 | InnoDB（支持事务、外键，保障点赞等操作的数据一致性） |
| 表数量 | 4 张：`users`、`questions`、`answers`、`votes` |

## 二、表关系说明（E-R）

```
users (1) ──── (n) questions        一个用户可发布多个问题
users (1) ──── (n) answers          一个用户可发布多个回答
questions (1) ──── (n) answers      一个问题可有多个回答
votes 多态关联：通过 (target_type, target_id) 指向 questions 或 answers
```

- 外键均设置 `ON DELETE CASCADE`：删除用户时其问题/回答/点赞记录一并删除；删除问题时其回答级联删除。
- `votes` 表为多态关联（target 可能是问题或回答），`target_id` 无法建立单一外键，由应用层保证数据一致性。
- `votes` 表设置 `(user_id, target_type, target_id)` 唯一索引，从数据库层面保证**同一用户对同一目标只能点赞一次**。

## 三、表结构详细设计

### 3.1 users 用户表

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | 用户 ID |
| username | VARCHAR(20) | NOT NULL, UNIQUE | 用户名（3-20 字符，唯一） |
| email | VARCHAR(100) | NOT NULL, UNIQUE | 邮箱（唯一） |
| password | VARCHAR(255) | NOT NULL | 密码（bcrypt 加密存储，不存明文） |
| avatar | VARCHAR(255) | DEFAULT NULL | 头像 URL |
| points | INT | NOT NULL, DEFAULT 100 | 用户积分（注册初始赠送 100 分） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 注册时间 |

> 说明：注册初始积分设为 100，否则新用户 0 积分无法支付发布问题的 5 积分成本。

### 3.2 questions 问题表

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | 问题 ID |
| title | VARCHAR(200) | NOT NULL | 问题标题 |
| content | TEXT | NOT NULL | 问题描述（Markdown 格式） |
| tags | JSON | NOT NULL | 标签（JSON 数组，如 `["React","MySQL"]`） |
| author_id | INT UNSIGNED | NOT NULL, FOREIGN KEY → users(id) | 提问者 ID |
| views | INT UNSIGNED | NOT NULL, DEFAULT 0 | 浏览次数 |
| answers_count | INT UNSIGNED | NOT NULL, DEFAULT 0 | 回答数量（冗余计数，避免每次 COUNT） |
| votes | INT | NOT NULL, DEFAULT 0 | 点赞数（冗余计数） |
| is_solved | TINYINT(1) | NOT NULL, DEFAULT 0 | 是否已解决：0 未解决 / 1 已解决 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

索引：`author_id`（查我的提问）、`is_solved`（未解决筛选）、`created_at`（最新排序）。

### 3.3 answers 回答表

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | 回答 ID |
| content | TEXT | NOT NULL | 回答内容（Markdown 格式） |
| author_id | INT UNSIGNED | NOT NULL, FOREIGN KEY → users(id) | 回答者 ID |
| question_id | INT UNSIGNED | NOT NULL, FOREIGN KEY → questions(id) | 所属问题 ID |
| votes | INT | NOT NULL, DEFAULT 0 | 点赞数 |
| is_accepted | TINYINT(1) | NOT NULL, DEFAULT 0 | 是否被采纳为最佳答案：0 否 / 1 是 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

索引：`question_id`（查某问题的全部回答）、`author_id`（查我的回答）。

### 3.4 votes 点赞中间表

| 字段 | 类型 | 约束 | 说明 |
| --- | --- | --- | --- |
| id | INT UNSIGNED | PRIMARY KEY, AUTO_INCREMENT | 点赞记录 ID |
| user_id | INT UNSIGNED | NOT NULL, FOREIGN KEY → users(id) | 点赞用户 ID |
| target_type | ENUM('question','answer') | NOT NULL | 点赞目标类型 |
| target_id | INT UNSIGNED | NOT NULL | 点赞目标 ID（问题或回答的 id） |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 点赞时间 |

约束：`UNIQUE KEY (user_id, target_type, target_id)` 防止重复点赞；`INDEX (target_type, target_id)` 加速按目标查询。

## 四、完整建表 SQL（一键初始化脚本）

脚本文件位置：`server/sql/init.sql`，可直接在 MySQL 客户端执行，或运行 `npm run init-db` 一键创建。

```sql
-- =============================================
-- 问答社区数据库初始化脚本
-- 数据库：qa_community  字符集：utf8mb4
-- 执行方式 1：mysql -u root -p < server/sql/init.sql
-- 执行方式 2：cd server && npm run init-db
-- =============================================

CREATE DATABASE IF NOT EXISTS qa_community
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE qa_community;

-- 按外键依赖顺序删除旧表（可重复执行）
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS answers;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS users;

-- =============================================
-- 1. 用户表
-- =============================================
CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  username VARCHAR(20) NOT NULL COMMENT '用户名（唯一）',
  email VARCHAR(100) NOT NULL COMMENT '邮箱（唯一）',
  password VARCHAR(255) NOT NULL COMMENT '密码（bcrypt加密存储）',
  avatar VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  points INT NOT NULL DEFAULT 100 COMMENT '用户积分（注册初始100分）',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_username (username),
  UNIQUE KEY uk_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- =============================================
-- 2. 问题表
-- =============================================
CREATE TABLE questions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '问题ID',
  title VARCHAR(200) NOT NULL COMMENT '问题标题',
  content TEXT NOT NULL COMMENT '问题描述（Markdown格式）',
  tags JSON NOT NULL COMMENT '标签（JSON数组）',
  author_id INT UNSIGNED NOT NULL COMMENT '提问者ID',
  views INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览次数',
  answers_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '回答数量',
  votes INT NOT NULL DEFAULT 0 COMMENT '点赞数',
  is_solved TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已解决：0未解决 1已解决',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  KEY idx_author_id (author_id),
  KEY idx_is_solved (is_solved),
  KEY idx_created_at (created_at),
  CONSTRAINT fk_questions_author FOREIGN KEY (author_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问题表';

-- =============================================
-- 3. 回答表
-- =============================================
CREATE TABLE answers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '回答ID',
  content TEXT NOT NULL COMMENT '回答内容（Markdown格式）',
  author_id INT UNSIGNED NOT NULL COMMENT '回答者ID',
  question_id INT UNSIGNED NOT NULL COMMENT '所属问题ID',
  votes INT NOT NULL DEFAULT 0 COMMENT '点赞数',
  is_accepted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否被采纳：0否 1是',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  KEY idx_question_id (question_id),
  KEY idx_author_id (author_id),
  CONSTRAINT fk_answers_author FOREIGN KEY (author_id)
    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_answers_question FOREIGN KEY (question_id)
    REFERENCES questions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='回答表';

-- =============================================
-- 4. 点赞中间表
-- =============================================
CREATE TABLE votes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '点赞记录ID',
  user_id INT UNSIGNED NOT NULL COMMENT '点赞用户ID',
  target_type ENUM('question','answer') NOT NULL COMMENT '目标类型：question问题 / answer回答',
  target_id INT UNSIGNED NOT NULL COMMENT '目标ID（问题或回答的id）',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_target (user_id, target_type, target_id),
  KEY idx_target (target_type, target_id),
  CONSTRAINT fk_votes_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='点赞中间表';
```

## 五、设计要点说明

1. **冗余计数字段**：`questions.answers_count`、`questions.votes`、`answers.votes` 为冗余计数，由后端在事务中同步更新，列表查询无需 COUNT 子查询，保证性能。
2. **点赞唯一性**：数据库唯一索引 + 后端事务双重保障，杜绝重复点赞。
3. **JSON 标签**：`tags` 使用 MySQL 原生 JSON 类型，支持 `JSON_CONTAINS` 标签筛选查询。
4. **级联删除**：删除问题自动删除其全部回答；删除用户自动删除其全部内容，避免脏数据。
5. **积分变动全部在后端事务内完成**，前端不参与积分计算，保证安全。
