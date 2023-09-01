import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RefreshTokensDto } from './types/auth.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(
    private readonly prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  generateTokens(id: string, email: string) {
    const data = { id, email };
    const accessToken = this.jwtService.sign(data, { expiresIn: '10h' });
    const refreshToken = this.jwtService.sign(data, { expiresIn: '7d' });

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
        where: { id: tokenData.id, email: tokenData.email },
      });

      if (!user) throw new BadRequestException('Not valid tokens');

      const isTokensExist = await this.prismaService.authToken.findUnique({
        where: {
          userId: user.id,
          accessToken: refreshTokens.accessToken,
          refreshToken: refreshTokens.refreshToken,
        },
      });

      if (!isTokensExist) throw new BadRequestException('Not valid tokens');

      const tokens = this.generateTokens(user.id, user.email);

      await this.prismaService.authToken.update({
        where: { userId: user.id },
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
