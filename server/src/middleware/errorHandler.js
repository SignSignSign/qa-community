// 全局统一错误处理中间件
module.exports = (err, req, res, next) => {
  console.error('[Error]', err.message);

  // MySQL 唯一索引冲突
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({ message: '数据重复：违反唯一性约束' });
  }

  res.status(err.status || 500).json({
    message: err.status ? err.message : '服务器内部错误，请稍后重试'
  });
};
