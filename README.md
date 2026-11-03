# 蓝天问答 · 清爽问答社区 ☁️

一个蓝天白云清爽风格的简易问答社区，支持注册登录、发布/回答问题、点赞、采纳最佳答案、积分系统。

## 技术栈

| 端 | 技术 |
| --- | --- |
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS + react-markdown |
| 后端 | Node.js + Express |
| 数据库 | SQLite（better-sqlite3，文件型数据库，**无需安装任何服务**） |
| 鉴权 | JWT（7 天有效期）+ bcrypt 密码加密 |

## 项目结构

```
问答社区/
├── database.md                  # 数据库设计文档
├── PRD.md                       # 产品需求文档
├── README.md                    # 本文件
├── server/                      # 后端
│   ├── sql/init.sql             # 建表脚本（SQLite 方言）
│   ├── scripts/initDb.js        # 一键初始化数据库
│   ├── data/qa_community.db     # SQLite 数据库文件（初始化后生成）
│   └── src/
│       ├── config/              # 数据库连接、积分常量
│       ├── middleware/          # JWT 鉴权 / 参数校验 / 错误处理
│       ├── models/              # 数据模型层
│       ├── controllers/         # 业务控制器
│       └── routes/              # 路由
└── client/                      # 前端
    └── src/
        ├── api/                 # axios 封装
        ├── components/          # 组件（云朵装饰/卡片/点赞/编辑器等）
        ├── context/             # AuthContext / ToastContext
        ├── pages/               # 首页/详情/提问/个人中心/登录/注册
        └── types/               # TS 类型定义
```

## 快速启动

### 1. 环境要求

- Node.js ≥ 18（本机 Node 在 `/Users/ykydedongmajiang/.local/node/bin`）

```bash
export PATH="/Users/ykydedongmajiang/.local/node/bin:$PATH"
```

### 2. 初始化数据库

```bash
cd server
npm install --registry=https://registry.npmmirror.com
npm run init-db
```

> SQLite 数据库文件自动创建于 `server/data/qa_community.db`，无需安装 MySQL。

### 3. 启动后端（端口 3001）

```bash
cd server
npm run dev
```

### 4. 启动前端（端口 5178）

```bash
cd client
npm install --registry=https://registry.npmmirror.com
npm run dev
```

访问 **http://localhost:5178** 即可使用。

## 默认端口

| 服务 | 端口 |
| --- | --- |
| 后端 API | http://localhost:3001 |
| 前端页面 | http://localhost:5178 |

## 积分规则

| 行为 | 积分变动 |
| --- | --- |
| 注册 | +100（初始） |
| 发布问题 | -5 |
| 回答问题 | +10 |
| 回答被采纳 | +30 |
| 问题被点赞 | +5 |
| 回答被点赞 | +10 |

## 接口测试

导入 [server/qa-community.postman_collection.json](file:///Users/ykydedongmajiang/Documents/trae_projects/课堂任务/问答社区/server/qa-community.postman_collection.json) 到 Postman，注册/登录后 token 自动携带，可直接测试全部 16 个接口。
