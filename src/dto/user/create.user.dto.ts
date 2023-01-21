import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  readonly firstName: string;

  @IsString()
  readonly lastName: string;

  @IsString()
  readonly phoneNumber: string;

  readonly email: string;

  @IsString()
  readonly password: string;
}
