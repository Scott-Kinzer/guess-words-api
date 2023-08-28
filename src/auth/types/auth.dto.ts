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

export type PincodeUserDto = {
  email: string;
  pincode: string;
};

export const pincodeUserSchema = Joi.object({
  email: Joi.string().email().required(),
  pincode: Joi.string().required().length(5),
});

export type RefreshTokensDto = {
  refreshToken: string;
  accessToken: string;
};

export const refreshTokensSchema = Joi.object({
  refreshToken: Joi.string().required(),
  accessToken: Joi.string().required(),
});

export type LoginUserDto = {
  email: string;
  password: string;
};

export const loginUserSchema = registerUserSchema;
