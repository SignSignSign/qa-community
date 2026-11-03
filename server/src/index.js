require('dotenv').config();
const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 3001;

// SQLite 是本地文件型数据库，加载即连接成功；执行一个简单查询验证表结构
try {
  db.prepare('SELECT 1 FROM users LIMIT 1').get();
  console.log('✔ SQLite 数据库连接成功（文件：server/data/qa_community.db）');
} catch (err) {
  console.error('✘ 数据库未初始化，请先运行：npm run init-db');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`✔ 问答社区后端服务已启动：http://localhost:${PORT}`);
});
