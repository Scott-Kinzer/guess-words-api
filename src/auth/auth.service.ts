import { BadRequestException, Injectable } from '@nestjs/common';
import {
  LoginUserDto,
  PincodeUserDto,
  RefreshTokensDto,
  RegisterUserDto,
  UserGoogleDto,
} from './types/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { comparePasswords, hashPassword } from 'src/helpers/hashPassword';
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
    const isUserExists = await this.prismaService.user.findFirst({
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
    const user = await this.prismaService.user.findFirst({
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

  async login(loginUser: LoginUserDto) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: loginUser.email,
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

    const userValid = await this.prismaService.userAuth.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!userValid.isValid) {
      throw new BadRequestException('User not valid');
    }

    if (!user) {
      throw new BadRequestException('User not exists');
    }

    const isValidPassword = await comparePasswords(
      loginUser.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new BadRequestException('Wrong password');
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
  }

  async googleLogin(userGoogle: UserGoogleDto) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: userGoogle.email,
        password: null,
      },
    });

    if (!user) {
      const userCreated = await this.prismaService.user.create({
        data: {
          email: userGoogle.email,
        },
      });

      const tokens = this.generateTokens({
        id: userCreated.id,
        email: userCreated.email,
      });

      await this.prismaService.userAuth.create({
        data: {
          userId: userCreated.id,
          email: userCreated.email,
          pincode: null,
          isValid: true,
        },
      });

      await this.prismaService.authToken.create({
        data: {
          userId: userCreated.id,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });

      return tokens;
    } else {
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
    }
  }

  async forgotPassword(email: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: email,
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

    const userValid = await this.prismaService.userAuth.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!userValid.isValid) {
      throw new BadRequestException('User not valid');
    }

    const generatedPincode = generatePincode();

    const isAlreadyRecovered =
      await this.prismaService.userPasswordRecoveryAuth.findUnique({
        where: {
          userId: user.id,
          email: email,
        },
      });

    if (isAlreadyRecovered) {
      await this.prismaService.userPasswordRecoveryAuth.update({
        where: {
          userId: user.id,
          email: email,
        },
        data: {
          pincodeCreatedAt: new Date(),
          pincode: generatedPincode,
        },
      });
    } else {
      await this.prismaService.userPasswordRecoveryAuth.create({
        data: {
          userId: user.id,
          email: email,
          pincodeCreatedAt: new Date(),
          pincode: generatedPincode,
        },
      });
    }

    await this.mailService.sendRecoveryPasswordEmail(email, generatedPincode);
  }
}
