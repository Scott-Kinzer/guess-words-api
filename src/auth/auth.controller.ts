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
  PasswordRecoveryDto,
  PasswordRefreshDto,
  PincodeUserDto,
  PincodeValidateDto,
  RefreshTokensDto,
  RegisterUserDto,
} from './types/auth.dto';
import { GoogleOauthGuard } from './guards/google.oauth.guard';
import { AuthGoogleService } from './auth.google.service';
import { TokenService } from './token.service';
import {
  loginUserSchema,
  passwordRecoveryScheme,
  passwordRefreshSchema,
  pincodeUserSchema,
  pincodeValidateScheme,
  refreshTokensSchema,
  registerUserSchema,
} from './validation/auth.validation';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authGoogleService: AuthGoogleService,
    private readonly tokenService: TokenService,
  ) {}

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
    const tokens = await this.tokenService.refreshToken(refreshTokens);

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
  async googleAuth() {}

  @Get('google-callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req) {
    const tokens = await this.authGoogleService.googleLogin(req.user);

    return tokens;
  }

  @Post('forgot-password')
  @UsePipes(new JoiValidationPipe(passwordRefreshSchema))
  async forgotPassword(@Body() userData: PasswordRefreshDto) {
    await this.authService.forgotPassword(userData.email);

    return { message: `Pincode mailed to ${userData.email}` };
  }

  @Post('pincode-validate')
  @UsePipes(new JoiValidationPipe(pincodeValidateScheme))
  async validatePincode(@Body() pincodeData: PincodeValidateDto) {
    await this.authService.validateRecoveryPincode(pincodeData);

    return { message: `Pincode valid` };
  }

  @Post('password-recovery')
  @UsePipes(new JoiValidationPipe(passwordRecoveryScheme))
  async recoveryPassword(@Body() passwordRecoveryData: PasswordRecoveryDto) {
    await this.authService.passwordRecovery(passwordRecoveryData);

    return { message: `Password updated` };
  }
}
