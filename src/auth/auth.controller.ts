import { AuthenticateUserDto } from './../dto/user/authenticate.user.dto';
import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
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
import { AdminUpdateUserDto } from 'src/dto/user/admin.update.user.dto';

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

  @UseGuards(JwtAuthGuard)
  @Put('user/role')
  async updateUserRole(@Body() info: AdminUpdateUserDto, @Request() req) {
    return await this.authService.adminUpdateUserRole(
      req.user?.phoneNumber,
      info,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Put('user/type')
  async updateUserType(@Body() info: AdminUpdateUserDto, @Request() req) {
    return await this.authService.adminUpdateUserType(
      req.user?.phoneNumber,
      info,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async getUsers(@Request() req) {
    const user = await this.middleWareService.checkUser(req?.user.phoneNumber);
    await this.middleWareService.isAdmin(user.phoneNumber);
    const data = await this.authService.getUsers(user.userId);
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('patient/profile/:id')
  async getPatientProfile(@Param() { id }: any) {
    return await this.authService.getPatientProfileInfo(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/all')
  async getAllUsers(@Request() req) {
    const data = await this.authService.getUsers('');
    return data;
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
    const data = await this.authService.patientLogin(info);
    this._logger.log(data);
    return data;
  }

  @Post('patient/authenticate')
  async authenticatePatient(@Body() info: PatientAuthenticationDto) {
    return await this.authService.authenticatePatient(info);
  }
}
