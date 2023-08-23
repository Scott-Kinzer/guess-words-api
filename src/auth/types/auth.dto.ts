import * as Joi from 'joi';

export type RegisterUserDto = {
  email: string;
  password: string;
};

export const registerUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .required()
    .min(8)
    .pattern(
      new RegExp(/[a-zA-Z]/),
      'Password must contain at least one letter',
    )
    .pattern(new RegExp(/[0-9]/), 'Password must contain at least one number')
    .pattern(
      new RegExp(/[!@#$%^&*(),.?":{}|<>]/),
      'Password must contain at least one special character',
    ),
});