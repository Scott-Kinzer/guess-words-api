import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JoiValidationPipe } from './pipes/joiValidationPipe';
import {
  PincodeUserDto,
  RegisterUserDto,
  pincodeUserSchema,
  registerUserSchema,
} from './types/auth.dto';

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
    await this.authService.registerPincodeUser(pincoderUserDto);

    return { authToken: '', refreshToken: '' };
  }
}
