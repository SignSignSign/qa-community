const router = require('express').Router();
const voteController = require('../controllers/voteController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');

// POST /api/votes 点赞 / 取消点赞（事务处理）
router.post('/', auth, validate.vote, voteController.toggle);

module.exports = router;
