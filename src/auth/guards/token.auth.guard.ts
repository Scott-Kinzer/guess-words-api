import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const { authorization }: any = request.headers;

      if (!authorization || authorization.trim() === '')
        throw new UnauthorizedException('Please provide token');

      const authToken = authorization.replace(/bearer/gim, '').trim();

      const dbTokens = await this.prismaService.authToken.findFirst({
        where: {
          accessToken: authToken,
        },
      });

      if (!dbTokens) throw new Error('Not valid token');

      const resp = await this.jwtService.verify(authToken);
      request.user = resp;
      return true;
    } catch (error) {
      console.log('auth error - ', error.message);
      throw new ForbiddenException(
        error.message || 'session expired! Please sign In',
      );
    }
  }
}
