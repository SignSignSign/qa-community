// 请求参数校验中间件
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const badRequest = (res, message) => res.status(400).json({ message });

// 注册：用户名 3-20 字符、邮箱格式、密码 >= 6 位
exports.register = (req, res, next) => {
  const { username, email, password } = req.body || {};
  if (typeof username !== 'string' || username.trim().length < 3 || username.trim().length > 20) {
    return badRequest(res, '用户名需为 3-20 个字符');
  }
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return badRequest(res, '邮箱格式不正确');
  }
  if (typeof password !== 'string' || password.length < 6) {
    return badRequest(res, '密码长度不能少于 6 位');
  }
  next();
};

// 登录
exports.login = (req, res, next) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return badRequest(res, '用户名和密码不能为空');
  }
  next();
};

// 发布 / 更新问题
exports.question = (req, res, next) => {
  const { title, content, tags } = req.body || {};
  if (typeof title !== 'string' || !title.trim()) {
    return badRequest(res, '问题标题不能为空');
  }
  if (title.trim().length > 200) {
    return badRequest(res, '问题标题不能超过 200 个字符');
  }
  if (typeof content !== 'string' || !content.trim()) {
    return badRequest(res, '问题描述不能为空');
  }
  if (tags !== undefined) {
    if (!Array.isArray(tags) || tags.length > 5 || tags.some((t) => typeof t !== 'string' || !t.trim())) {
      return badRequest(res, '标签需为非空字符串数组，最多 5 个');
    }
  }
  next();
};

// 提交 / 更新回答
exports.answer = (req, res, next) => {
  const { content } = req.body || {};
  if (typeof content !== 'string' || !content.trim()) {
    return badRequest(res, '回答内容不能为空');
  }
  next();
};

// 点赞
exports.vote = (req, res, next) => {
  const { target_type, target_id } = req.body || {};
  if (!['question', 'answer'].includes(target_type)) {
    return badRequest(res, "target_type 必须为 'question' 或 'answer'");
  }
  if (!Number.isInteger(Number(target_id)) || Number(target_id) <= 0) {
    return badRequest(res, 'target_id 必须为正整数');
  }
  next();
};
