import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './types/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hashPassword } from 'src/helpers/hashPassword';
import { generatePincode } from 'src/helpers/generatePincode';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {}

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

    const generatedPincode = generatePincode();

    await this.prismaService.userAuth.create({
      data: {
        userId: createdUser.id,
        email: createdUser.email,
        pincode: Number(generatedPincode),
      },
    });

    await this.mailService.sendEmail(createdUser.email, generatedPincode);

    delete createdUser.password;

    return createdUser;
  }
}
