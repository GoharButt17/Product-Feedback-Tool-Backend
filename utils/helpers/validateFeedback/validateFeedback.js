const Joi = require('joi');

const feedbackSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().required(),
  user_id: Joi.number().integer().positive().required(),
  rating: Joi.number().integer().required(),
});

const validateFeedback = (data) => {
  return feedbackSchema.validate(data);
};

module.exports = validateFeedback;