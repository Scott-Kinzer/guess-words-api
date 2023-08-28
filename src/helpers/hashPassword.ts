import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;

export const hashPassword = async (password: string) =>
  bcrypt.hash(password, saltOrRounds);

export const comparePasswords = async (
  password: string,
  dbHashedPassword: string,
) => {
  return bcrypt.compare(password, dbHashedPassword);
};
