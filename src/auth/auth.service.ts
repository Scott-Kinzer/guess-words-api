import { BadRequestException, Injectable } from '@nestjs/common';
import {
  PincodeUserDto,
  RefreshTokensDto,
  RegisterUserDto,
} from './types/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hashPassword } from 'src/helpers/hashPassword';
import { generatePincode } from 'src/helpers/generatePincode';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
    private jwtService: JwtService,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    const isUserExists = await this.prismaService.user.findUnique({
      where: {
        email: registerUserDto.email,
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

    let validUser = null;

    if (isUserExists) {
      validUser = await this.prismaService.userAuth.findUnique({
        where: {
          userId: isUserExists.id,
        },
      });
    }

    if (validUser && validUser?.isValid) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await hashPassword(registerUserDto.password);

    const generatedPincode = generatePincode();

    if (!validUser && !isUserExists) {
      const createdUser = await this.prismaService.user.create({
        data: { email: registerUserDto.email, password: hashedPassword },
      });

      await this.prismaService.userAuth.create({
        data: {
          userId: createdUser.id,
          email: createdUser.email,
          pincode: generatedPincode,
        },
      });

      await this.mailService.sendEmail(createdUser.email, generatedPincode);

      delete createdUser.password;

      return createdUser;
    } else {
      const updatedUser = await this.prismaService.user.update({
        where: {
          id: isUserExists.id,
          email: isUserExists.email,
        },
        data: { email: registerUserDto.email, password: hashedPassword },
      });

      await this.prismaService.userAuth.update({
        where: {
          userId: updatedUser.id,
        },
        data: {
          email: updatedUser.email,
          pincode: generatedPincode,
        },
      });

      await this.mailService.sendEmail(updatedUser.email, generatedPincode);

      delete updatedUser.password;

      return updatedUser;
    }
  }

  async registerPincodeUser(pincodeUserDto: PincodeUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: pincodeUserDto.email,
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

    if (!user) {
      throw new BadRequestException('User not exists');
    }

    const validUser = await this.prismaService.userAuth.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!validUser) {
      throw new BadRequestException('User not exists');
    }

    if (validUser.isValid) {
      throw new BadRequestException('User already registered');
    }

    if (pincodeUserDto.pincode !== validUser.pincode) {
      throw new BadRequestException('Wrong code');
    }

    await this.prismaService.userAuth.update({
      where: {
        userId: user.id,
      },
      data: {
        isValid: true,
      },
    });

    const tokens = this.generateTokens({ id: user.id, email: user.email });

    await this.prismaService.authToken.create({
      data: {
        userId: user.id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });

    return tokens;
  }

  generateTokens(user: { id: string; email: string }) {
    const accessToken = this.jwtService.sign(user, { expiresIn: '10h' });
    const refreshToken = this.jwtService.sign(user, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshTokens: RefreshTokensDto) {
    try {
      this.jwtService.verify(refreshTokens.refreshToken);

      const tokenData = this.jwtService.decode(refreshTokens.refreshToken) as {
        id: string;
        email: string;
      };

      const user = await this.prismaService.user.findUnique({
        where: {
          id: tokenData.id,
          email: tokenData.email,
        },
      });

      if (!user) {
        throw new BadRequestException('Not valid tokens');
      }

      const isTokensExist = await this.prismaService.authToken.findUnique({
        where: {
          userId: user.id,
          accessToken: refreshTokens.accessToken,
          refreshToken: refreshTokens.refreshToken,
        },
      });

      if (!isTokensExist) {
        throw new BadRequestException('Not valid tokens');
      }

      const tokens = this.generateTokens({ id: user.id, email: user.email });

      await this.prismaService.authToken.update({
        where: {
          userId: user.id,
        },
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });

      return tokens;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
