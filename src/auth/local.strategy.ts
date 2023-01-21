import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly _logger = new Logger(LocalStrategy.name);
  constructor(private authService: AuthService) {
    super();
  }

  async validate(phoneNumber: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(phoneNumber, password);
    if (user) {
      return user;
    }
    throw new HttpException(
      'Incorrect PhoneNumber or Password',
      HttpStatus.NOT_FOUND,
    );
  }
}
