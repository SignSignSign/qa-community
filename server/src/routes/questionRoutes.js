const router = require('express').Router();
const questionController = require('../controllers/questionController');
const { auth, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

// POST /api/questions 发布问题（鉴权，扣积分）
router.post('/', auth, validate.question, questionController.create);

// GET /api/questions 问题列表（sort / tag / keyword / page / pageSize）
router.get('/', optionalAuth, questionController.list);

// GET /api/questions/:id 问题详情（浏览数+1）
router.get('/:id', optionalAuth, questionController.detail);

// PUT /api/questions/:id 更新自己的问题
router.put('/:id', auth, validate.question, questionController.update);

// DELETE /api/questions/:id 删除自己的问题
router.delete('/:id', auth, questionController.remove);

module.exports = router;
