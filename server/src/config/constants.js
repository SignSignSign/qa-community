// 积分规则常量（严格遵循 PRD，所有积分变动仅在后端执行）
module.exports = {
  POINTS: {
    INITIAL: 100, // 注册初始积分
    ASK: 5, // 发布问题扣除
    ANSWER: 10, // 回答问题奖励
    ACCEPTED: 30, // 回答被采纳为最佳答案奖励
    QUESTION_UPVOTE: 5, // 问题被点赞，问题作者奖励
    ANSWER_UPVOTE: 10 // 回答被点赞，回答作者奖励
  }
};
