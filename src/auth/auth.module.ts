import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from './strategies/google.strategy';
import { AuthGoogleService } from './auth.google.service';
import { TokenService } from './token.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    MailService,
    GoogleStrategy,
    AuthGoogleService,
    TokenService,
  ],
})
export class AuthModule {}
