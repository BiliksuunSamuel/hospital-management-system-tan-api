import { IsString } from 'class-validator';

export class PatientRecordPermissionGrantDto {
  @IsString()
  userId: string;
  status: boolean;
  @IsString()
  permissionType: 'single' | 'all';
  documentId?: string; //only available if the permission type is single
}
