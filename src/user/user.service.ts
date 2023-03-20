import { randomUUID } from 'crypto';
import {
  GenerateDate,
  GenerateOtp,
  HashPassword,
  GenerateId,
  formatUserInfo,
} from 'src/utils';
import { HttpStatus } from '@nestjs/common/enums';
import { ApiResponseModel } from './../model/api.response.model';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/dto/user/create.user.dto';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { FunctionsService } from 'src/functions/functions.service';
import { AuthenticateUserDto } from 'src/dto/user/authenticate.user.dto';
import { UserInfoModel } from 'src/model/user.info.model';
import { Role } from 'src/enums/roles.enum';
import { AdminUpdateUserDto } from 'src/dto/user/admin.update.user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly functionsService: FunctionsService,
  ) {}

  async createUser(info: CreateUserDto): Promise<User> {
    const user = await this.userRepository.create(info);
    user.createdAt = GenerateDate();
    user.updatedAt = null;
    user.isLoggedIn = false;
    user.authenticated = false;
    user.lastLogin = GenerateDate();
    user.password = HashPassword(info.password);
    user.userId = GenerateId();
    user.role = Role.User;
    user.authenticationCode = GenerateOtp();
    const phoneUser = await this.userRepository.findOneBy({
      phoneNumber: info.phoneNumber,
    });
    if (phoneUser != null) {
      throw new HttpException(
        `${info.phoneNumber} Is Already Registered`,
        HttpStatus.CONFLICT,
      );
    }

    const emailUser = await this.userRepository.findOneBy({
      email: info.email,
    });
    if (info.email && emailUser !== null) {
      throw new HttpException(
        `${info.email} is already registered`,
        HttpStatus.CONFLICT,
      );
    }

    await this.functionsService.sendMessage({
      reciepient: info.phoneNumber,
      message: `Your Account Verification Code is ${user.authenticationCode}, Do not share this code with anyone`,
    });
    await this.userRepository.save(user);
    return user;
  }

  async adminUpdateUserRole(
    info: AdminUpdateUserDto,
  ): Promise<UserInfoModel[]> {
    const user = await this.userRepository.findOneBy({ userId: info.userId });
    if (user) {
      await this.userRepository.update(user._id, { role: info.value });
      const users = await this.userRepository.find({});
      return users.map(formatUserInfo);
    }
    throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
  }

  async adminUpdateUserType(
    info: AdminUpdateUserDto,
  ): Promise<UserInfoModel[]> {
    const user = await this.userRepository.findOneBy({ userId: info.userId });
    if (user) {
      await this.userRepository.update(user._id, { userType: info.value });
      const users = await this.userRepository.find({});
      return users.map(formatUserInfo);
    }
    throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
  }

  async verifyOtp(user: any): Promise<User> {
    const userInfo = await this.userRepository.findOneBy({
      phoneNumber: user.phoneNumber,
    });
    if (userInfo) {
      return userInfo;
    }

    throw new HttpException('Authorization Failed', HttpStatus.NOT_FOUND);
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return (await this.userRepository.findOneBy({ phoneNumber })) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return (await this.userRepository.findOneBy({ email })) || null;
  }

  async getUsers(): Promise<UserInfoModel[]> {
    const users = await this.userRepository.find({});
    return users.map(formatUserInfo);
  }

  async getUserById(id: string): Promise<User | null> {
    return (await this.userRepository.findOneBy({ userId: id })) || null;
  }

  async updateUserInfo(user: User) {
    const { _id, ...others } = user;
    await this.userRepository.update(_id, {
      ...others,
      updatedAt: GenerateDate(),
    });
  }
}
