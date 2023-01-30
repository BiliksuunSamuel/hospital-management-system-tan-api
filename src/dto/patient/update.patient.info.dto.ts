import { IsString } from 'class-validator';

export class UpdatePatientInfoDto {
  @IsString()
  readonly firstName: string;
  @IsString()
  readonly lastName: string;
  readonly email: string;
  @IsString()
  readonly contact: string;
  @IsString()
  readonly dateOfBirth: string;

  readonly address?: string;
}
