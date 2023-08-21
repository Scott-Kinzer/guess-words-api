import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;

export const hashPassword = async (password: string) =>
  bcrypt.hash(password, saltOrRounds);

export const comparePasswords = async (
  password: string,
  dbHasshedPassword: string,
) => {
  const hashedPassword = await hashPassword(password);

  return bcrypt.compare(hashedPassword, dbHasshedPassword);
};
