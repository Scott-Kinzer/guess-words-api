import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './types/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hashPassword } from 'src/helpers/hashPassword';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    const isUserExists = await this.prismaService.user.findUnique({
      where: {
        email: registerUserDto.email,
      },
    });

    if (isUserExists && isUserExists.password) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await hashPassword(registerUserDto.password);

    const createdUser = await this.prismaService.user.create({
      data: { email: registerUserDto.email, password: hashedPassword },
    });

    delete createdUser.password;

    return createdUser;
  }
}
