const Joi = require('joi');

const commentSchema = Joi.object({
  feedback_id: Joi.number().required(),
  user_id: Joi.number().required(),
  content: Joi.string().required(),
});

const validateComment = (data) => {
  return commentSchema.validate(data);
};

module.exports = validateComment;