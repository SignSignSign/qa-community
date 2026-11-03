const router = require('express').Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// GET /api/users/me 当前登录用户信息、积分
router.get('/me', auth, userController.me);

// PUT /api/users/me 编辑个人信息
router.put('/me', auth, userController.updateMe);

// GET /api/users/me/questions 我的全部提问
router.get('/me/questions', auth, userController.myQuestions);

// GET /api/users/me/answers 我的全部回答
router.get('/me/answers', auth, userController.myAnswers);

module.exports = router;
