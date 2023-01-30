import { IsString } from 'class-validator';
import { RecordPermissionType } from 'src/enums/record.permissions.type';

export class PatientRecordPermissionGrantDto {
  @IsString()
  userId: string;
  status: boolean;
  @IsString()
  permissionType: RecordPermissionType;
  documentId?: string; //only available if the permission type is single
  note: string;
  id: string;
}
