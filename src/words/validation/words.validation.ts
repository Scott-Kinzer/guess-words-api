import * as Joi from 'joi';

export const guessWordShchema = Joi.object({
  word: Joi.string().required(),
});
