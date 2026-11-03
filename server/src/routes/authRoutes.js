const router = require('express').Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');

// POST /api/auth/register 用户注册
router.post('/register', validate.register, authController.register);

// POST /api/auth/login 用户登录
router.post('/login', validate.login, authController.login);

module.exports = router;
