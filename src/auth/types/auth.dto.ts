export type RegisterUserDto = {
  email: string;
  password: string;
};

export type PincodeUserDto = {
  email: string;
  pincode: string;
};

export type RefreshTokensDto = {
  refreshToken: string;
  accessToken: string;
};

export type LoginUserDto = {
  email: string;
  password: string;
};

export type UserGoogleDto = {
  email: string;
  firstName: string;
};

export type PasswordRefreshDto = {
  email: string;
};

export type PincodeValidateDto = {
  email: string;
  pincode: string;
};

export type PasswordRecoveryDto = {
  email: string;
  pincode: string;
  password: string;
};
