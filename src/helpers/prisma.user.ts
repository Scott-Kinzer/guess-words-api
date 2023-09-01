import { PrismaService } from 'src/prisma/prisma.service';

export const findUser = async (prismaService: PrismaService, email: string) => {
  const user = await prismaService.user.findFirst({
    where: {
      email,
      password: {
        not: null,
      },
      AND: {
        password: {
          not: '',
        },
      },
    },
  });

  return user;
};
