import { PatientRecordPermission } from 'src/patient/patient.entity';

export class PatientInfoModel {
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  dateOfBirth: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  gender: string;
  patientId: string;
  token?: string;
  recordPermissions: PatientRecordPermission[];
}
