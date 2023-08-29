import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JoiValidationPipe } from './pipes/joiValidationPipe';
import {
  LoginUserDto,
  PincodeUserDto,
  RefreshTokensDto,
  RegisterUserDto,
  loginUserSchema,
  pincodeUserSchema,
  refreshTokensSchema,
  registerUserSchema,
} from './types/auth.dto';
import { GoogleOauthGuard } from './guards/google.oauth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new JoiValidationPipe(registerUserSchema))
  async create(@Body() registerUserDto: RegisterUserDto) {
    const user = await this.authService.registerUser(registerUserDto);

    return user;
  }

  @Post('pincode')
  @UsePipes(new JoiValidationPipe(pincodeUserSchema))
  async pincodeRegister(@Body() pincoderUserDto: PincodeUserDto) {
    const tokens = await this.authService.registerPincodeUser(pincoderUserDto);

    return tokens;
  }

  @Post('refresh')
  @UsePipes(new JoiValidationPipe(refreshTokensSchema))
  async refreshToken(@Body() refreshTokens: RefreshTokensDto) {
    const tokens = await this.authService.refreshToken(refreshTokens);

    return tokens;
  }

  @Post('login')
  @UsePipes(new JoiValidationPipe(loginUserSchema))
  async login(@Body() loginUser: LoginUserDto) {
    const tokens = await this.authService.login(loginUser);

    return tokens;
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async auth() {}

  @Get('google-callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req) {
    const tokens = await this.authService.googleSignIn(req.user);

    return tokens;
  }
}
