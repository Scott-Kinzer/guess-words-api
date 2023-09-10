import * as Joi from 'joi';

const userObjCreds = {
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
};

export const registerUserSchema = Joi.object(userObjCreds);

export const pincodeUserSchema = Joi.object({
  email: Joi.string().email().required(),
  pincode: Joi.string().required().length(5),
});

export const refreshTokensSchema = Joi.object({
  refreshToken: Joi.string().required(),
  accessToken: Joi.string().required(),
});

export const loginUserSchema = registerUserSchema;

export const userGoogleSchema = Joi.object({
  email: Joi.string().required(),
  firstName: Joi.string().required(),
});

export const passwordRefreshSchema = Joi.object({
  email: Joi.string().required(),
});

export const pincodeValidateScheme = Joi.object({
  email: Joi.string().required(),
  pincode: Joi.string().required().length(5),
});

export const passwordRecoveryScheme = Joi.object({
  ...userObjCreds,
  pincode: Joi.string().required().length(5),
});
