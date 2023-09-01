import { BadRequestException, Injectable } from '@nestjs/common';
import {
  LoginUserDto,
  PincodeUserDto,
  RegisterUserDto,
} from './types/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { comparePasswords, hashPassword } from 'src/helpers/hashPassword';
import { generatePincode } from 'src/helpers/generatePincode';
import { MailService } from 'src/mail/mail.service';
import { TokenService } from './token.service';
import { findUser } from 'src/helpers/prisma.user';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    const user = await findUser(this.prismaService, registerUserDto.email);
    let validUser = null;

    if (user) {
      validUser = await this.prismaService.userAuth.findUnique({
        where: { userId: user.id },
      });
    }

    if (validUser && validUser?.isValid)
      throw new BadRequestException('User already exists');

    const hashedPassword = await hashPassword(registerUserDto.password);
    const generatedPincode = generatePincode();

    let userToOperate: null | User = null;

    if (!validUser && !user) {
      userToOperate = await this.prismaService.user.create({
        data: { email: registerUserDto.email, password: hashedPassword },
      });

      const { email, id: userId } = userToOperate;

      await this.prismaService.userAuth.create({
        data: { userId, email, pincode: generatedPincode },
      });
    } else {
      userToOperate = await this.prismaService.user.update({
        where: { id: user.id, email: user.email },
        data: { password: hashedPassword },
      });

      await this.prismaService.userAuth.update({
        where: { userId: userToOperate.id },
        data: { pincode: generatedPincode },
      });
    }

    await this.mailService.sendEmail(userToOperate.email, generatedPincode);

    delete userToOperate.password;

    return userToOperate;
  }

  async registerPincodeUser(pincodeUserDto: PincodeUserDto) {
    const user = await findUser(this.prismaService, pincodeUserDto.email);
    if (!user) throw new BadRequestException('User not exists');

    const validUser = await this.prismaService.userAuth.findUnique({
      where: { userId: user.id },
    });
    if (!validUser) throw new BadRequestException('User not exists');

    if (validUser.isValid)
      throw new BadRequestException('User already registered');

    if (pincodeUserDto.pincode !== validUser.pincode)
      throw new BadRequestException('Wrong code');

    await this.prismaService.userAuth.update({
      where: { userId: user.id },
      data: { isValid: true },
    });

    const tokens = this.tokenService.generateTokens(user.id, user.email);

    await this.prismaService.authToken.create({
      data: { userId: user.id, ...tokens },
    });

    return tokens;
  }

  async login(loginUser: LoginUserDto) {
    const user = await findUser(this.prismaService, loginUser.email);
    const userValid = await this.prismaService.userAuth.findUnique({
      where: { userId: user.id },
    });

    if (!userValid.isValid) throw new BadRequestException('User not valid');
    if (!user) throw new BadRequestException('User not exists');

    const isValidPassword = await comparePasswords(
      loginUser.password,
      user.password,
    );
    if (!isValidPassword) throw new BadRequestException('Wrong password');

    const tokens = this.tokenService.generateTokens(user.id, user.email);

    await this.prismaService.authToken.update({
      where: { userId: user.id },
      data: { ...tokens },
    });

    return tokens;
  }

  async forgotPassword(email: string) {
    const user = await findUser(this.prismaService, email);
    if (!user) throw new BadRequestException('User not exists');

    const userValid = await this.prismaService.userAuth.findUnique({
      where: { userId: user.id },
    });
    if (!userValid.isValid) throw new BadRequestException('User not valid');

    const generatedPincode = generatePincode();

    const isAlreadyRecovered =
      await this.prismaService.userPasswordRecoveryAuth.findUnique({
        where: { userId: user.id, email },
      });

    const pincodeData = {
      pincodeCreatedAt: new Date(),
      pincode: generatedPincode,
    };

    if (isAlreadyRecovered) {
      await this.prismaService.userPasswordRecoveryAuth.update({
        where: { userId: user.id, email },
        data: { ...pincodeData },
      });
    } else {
      await this.prismaService.userPasswordRecoveryAuth.create({
        data: { userId: user.id, email, ...pincodeData },
      });
    }

    await this.mailService.sendRecoveryPasswordEmail(email, generatedPincode);
  }
}
