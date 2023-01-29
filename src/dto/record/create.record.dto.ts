import { MedicalStatement } from './../../model/medical.statement.model';

export class CreateRecordDto {
  statements: MedicalStatement[];
  status: string;
  duration: number;
  patientId: string;
}
