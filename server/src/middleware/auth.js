const jwt = require('jsonwebtoken');

const parseToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
};

// JWT 鉴权中间件：未登录直接 401
exports.auth = (req, res, next) => {
  const token = parseToken(req);
  if (!token) {
    return res.status(401).json({ message: '未登录或 token 缺失，请先登录' });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, username }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'token 无效或已过期，请重新登录' });
  }
};

// 可选鉴权中间件：有 token 则解析出用户，无 token 也放行（用于列表/详情返回 isVoted）
exports.optionalAuth = (req, res, next) => {
  const token = parseToken(req);
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      req.user = null; // token 无效按游客处理，不阻断请求
    }
  }
  next();
};
