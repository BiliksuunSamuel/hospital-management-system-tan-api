import { DoctorStatement, PatientStatment } from 'src/record/record.entity';

export class CreateRecordDto {
  patientStatment: PatientStatment;
  doctorStatement: DoctorStatement[];
  status: string;
  duration: number;
  patientId: string;
}
