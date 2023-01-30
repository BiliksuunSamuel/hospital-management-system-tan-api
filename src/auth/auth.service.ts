import { MapPipe } from '@automapper/nestjs';
import { Injectable, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PatientAuthenticationDto } from 'src/dto/patient/authenticate.dto';
import { PatientLoginDto } from 'src/dto/patient/login.dto';
import { AdminUpdateUserDto } from 'src/dto/user/admin.update.user.dto';
import { AuthenticateUserDto } from 'src/dto/user/authenticate.user.dto';
import { CreateUserDto } from 'src/dto/user/create.user.dto';
import { ApiResponseModel } from 'src/model/api.response.model';
import { PatientInfoModel } from 'src/model/patient.info.model';
import { UserInfoModel } from 'src/model/user.info.model';
import { PatientService } from 'src/patient/patient.service';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { ComparePassword, formatPatientInfo, HashPassword } from 'src/utils';

@Injectable()
export class AuthService {
  private readonly _logger = new Logger(AuthService.name);
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private readonly patientService: PatientService,
  ) {}

  async getUsers(userId: string): Promise<ApiResponseModel<UserInfoModel[]>> {
    const users = await this.usersService.getUsers();
    return {
      data: users.filter((u) => u.userId !== userId),
      message: '',
      code: HttpStatus.OK,
    };
  }

  async adminUpdateUserRole(
    phone: string,
    info: AdminUpdateUserDto,
  ): Promise<ApiResponseModel<UserInfoModel[]>> {
    const users = await this.usersService.adminUpdateUserRole(info);
    return {
      data: users.filter((u) => u.phoneNumber !== phone),
      code: HttpStatus.OK,
      message: '',
    };
  }

  async adminUpdateUserType(
    phone: string,
    info: AdminUpdateUserDto,
  ): Promise<ApiResponseModel<UserInfoModel[]>> {
    const users = await this.usersService.adminUpdateUserType(info);
    return {
      data: users.filter((u) => u.phoneNumber !== phone),
      code: HttpStatus.OK,
      message: '',
    };
  }

  async validateUser(
    phoneNumber: string,
    password: string,
  ): Promise<ApiResponseModel<UserInfoModel>> {
    const user = await this.usersService.getUserByPhoneNumber(phoneNumber);
    if (user && (await ComparePassword(password, user.password))) {
      const { password, ...result } = user;
      const payload = { phoneNumber: user.phoneNumber, sub: user._id };
      const userInfoModel: UserInfoModel = {
        ...result,
        token: await this.jwtService.signAsync(payload),
      };

      return {
        data: userInfoModel,
        message: '',
        code: HttpStatus.OK,
      };
    }

    throw new HttpException(
      'Incorrect Login PhoneNumber or Password',
      HttpStatus.NOT_FOUND,
    );
  }

  async login(user: any) {
    return user;
  }

  async register(
    info: CreateUserDto,
  ): Promise<ApiResponseModel<UserInfoModel>> {
    const user = await this.usersService.createUser(info);
    const { password, ...others } = user;

    const payload = { phoneNumber: user.phoneNumber, id: user._id };
    const userInfoModel: UserInfoModel = {
      ...others,
      lastName: user.lastName,
      token: await this.jwtService.signAsync(payload),
    };
    return {
      data: userInfoModel,
      message: 'Acount Created Successfully',
      code: HttpStatus.CREATED,
    };
  }

  async getProfileInfo(info: any): Promise<ApiResponseModel<UserInfoModel>> {
    const phoneNumber = info.phoneNumber;
    const user = await this.usersService.getUserByPhoneNumber(`${phoneNumber}`);
    if (user) {
      const { password, ...others } = user;
      const payload = { sub: user._id, phoneNumber: user.phoneNumber };
      return {
        data: { ...others, token: await this.jwtService.signAsync(payload) },
        message: '',
        code: HttpStatus.OK,
      };
    }
    throw new HttpException('Account Not Found', HttpStatus.NOT_FOUND);
  }

  async getPatientProfileInfo(
    patientId: string,
  ): Promise<ApiResponseModel<PatientInfoModel>> {
    const patient = await this.patientService.getPatient(patientId);
    const payload = { phoneNumber: patient.contact, id: patient.patientId };
    return {
      data: {
        ...formatPatientInfo(patient),
        token: await this.jwtService.signAsync(payload),
      },
      message: '',
      code: HttpStatus.OK,
    };
  }

  async authenticateUserAccount(
    user: any,
    info: AuthenticateUserDto,
  ): Promise<ApiResponseModel<UserInfoModel>> {
    const userInfo = await this.usersService.verifyOtp(user);
    if (userInfo.authenticationCode === info.code) {
      await this.usersService.updateUserInfo({
        ...userInfo,
        authenticated: true,
        isLoggedIn: true,
      });
      const { password, authenticationCode, ...others } =
        await this.usersService.getUserByPhoneNumber(userInfo.phoneNumber);
      const payload = { phoneNumber: userInfo.phoneNumber, id: userInfo._id };
      return {
        data: { ...others, token: await this.jwtService.signAsync(payload) },
        code: HttpStatus.OK,
        message: '',
      };
    }
    throw new HttpException(
      'Invalid Authentication Code',
      HttpStatus.UNAUTHORIZED,
    );
  }

  async patientLogin(
    info: PatientLoginDto,
  ): Promise<ApiResponseModel<PatientInfoModel>> {
    const patient = await this.patientService.getPatient(info.patientId);
    if (patient && ComparePassword(info.password, patient.password)) {
      const { password, authenticationCode, ...others } = patient;

      const payload = { phoneNumber: patient.contact, id: patient.patientId };
      return {
        data: {
          ...others,
          token: await this.jwtService.signAsync(payload),
        },
        code: HttpStatus.OK,
        message: patient.authenticated ? '' : 'please secure your account',
      };
    }
    throw new HttpException(
      'Invalid Patient Id or Password',
      HttpStatus.UNAUTHORIZED,
    );
  }

  //authenticate patient account
  async authenticatePatient(
    info: PatientAuthenticationDto,
  ): Promise<ApiResponseModel<PatientInfoModel>> {
    const patientInfo = await this.patientService.getPatient(info.patientId);
    if (patientInfo && patientInfo.authenticationCode === info.code) {
      await this.patientService.updatePatient({
        ...patientInfo,
        authenticated: true,
        password: HashPassword(info.password),
      });
      const { password, authenticationCode, ...pInfo } =
        await this.patientService.getPatient(patientInfo.patientId);
      const payload = { phoneNumber: pInfo.contact, id: pInfo.patientId };
      return {
        data: {
          ...pInfo,
          token: await this.jwtService.signAsync(payload),
        },
        message: '',
        code: HttpStatus.OK,
      };
    }
    throw new HttpException(
      'Operation Failed, Account Not Found, or Invalid Authentication Code',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
