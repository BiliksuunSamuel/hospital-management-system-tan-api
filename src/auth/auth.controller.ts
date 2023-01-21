import { AuthenticateUserDto } from './../dto/user/authenticate.user.dto';
import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from 'src/dto/user/create.user.dto';
import { MiddlewareService } from 'src/middleware/middleware.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { PatientLoginDto } from 'src/dto/patient/login.dto';
import { PatientAuthenticationDto } from 'src/dto/patient/authenticate.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly middleWareService: MiddlewareService,
  ) {}
  private readonly _logger = new Logger(AuthController.name);

  //
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return await this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return await this.authService.getProfileInfo(req.user);
  }

  @Post('register')
  async register(@Body() info: CreateUserDto) {
    return await this.authService.register(info);
  }

  @Post('authenticate')
  @UseGuards(JwtAuthGuard)
  async authenticateUser(@Request() req, @Body() info: AuthenticateUserDto) {
    return await this.authService.authenticateUserAccount(req.user, info);
  }

  @Post('patient/login')
  async patientLogin(@Body() info: PatientLoginDto) {
    return await this.authService.patientLogin(info);
  }

  @Post('patient/authenticate')
  async authenticatePatient(@Body() info: PatientAuthenticationDto) {
    return await this.authService.authenticatePatient(info);
  }
}
