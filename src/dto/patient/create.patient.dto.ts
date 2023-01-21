import { IsString, IsEmail, IsPhoneNumber, IsEnum } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  readonly firstName: string;

  @IsString()
  readonly lastName: string;

  readonly email: string;

  @IsPhoneNumber('GH')
  readonly contact: string;

  @IsString()
  readonly dateOfBirth: string;

  address?: string;

  @IsString()
  gender: string;
}
