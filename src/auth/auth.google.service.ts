import { Injectable } from '@nestjs/common';
import { UserGoogleDto } from './types/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthGoogleService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async googleLogin(userGoogle: UserGoogleDto) {
    const user = await this.prismaService.user.findFirst({
      where: { email: userGoogle.email, password: null },
    });

    if (!user) {
      const userCreated = await this.prismaService.user.create({
        data: { email: userGoogle.email },
      });

      const { id, email } = userCreated;
      const tokens = this.tokenService.generateTokens(id, email);

      await this.prismaService.userAuth.create({
        data: { userId: id, email, pincode: null, isValid: true },
      });

      await this.prismaService.authToken.create({
        data: { userId: id, ...tokens },
      });

      return tokens;
    } else {
      const tokens = this.tokenService.generateTokens(user.id, user.email);

      await this.prismaService.authToken.update({
        where: { userId: user.id },
        data: { ...tokens },
      });

      return tokens;
    }
  }
}
