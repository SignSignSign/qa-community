const router = require('express').Router();
const answerController = require('../controllers/answerController');
const { auth, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

// POST /api/questions/:id/answers 提交回答（鉴权，加积分）
router.post('/:id/answers', auth, validate.answer, answerController.create);

// GET /api/questions/:id/answers 获取某问题全部回答
router.get('/:id/answers', optionalAuth, answerController.list);

// PUT /api/questions/:id/answers/:answerId 修改自己的回答
router.put('/:id/answers/:answerId', auth, validate.answer, answerController.update);

// DELETE /api/questions/:id/answers/:answerId 删除自己的回答
router.delete('/:id/answers/:answerId', auth, answerController.remove);

// POST /api/questions/:id/answers/:answerId/accept 采纳最佳答案（仅提问者）
router.post('/:id/answers/:answerId/accept', auth, answerController.accept);

module.exports = router;
