import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Role } from 'src/enums/roles.enum';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class MiddlewareService {
  constructor(private readonly userService: UserService) {}

  async checkUser(phoneNumber: string): Promise<User> {
    const user = await this.userService.getUserByPhoneNumber(phoneNumber);
    if (user) {
      return user;
    }
    throw new HttpException('Access Denied', HttpStatus.NOT_FOUND);
  }

  async isAdmin(phoneNumber: string): Promise<User> {
    const user = await this.userService.getUserByPhoneNumber(phoneNumber);
    if (user && user.role === Role.Admin) {
      return user;
    }
    throw new HttpException(
      'Operation Failed, UnAuthorized Access',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
