import { Column, Entity, ObjectIdColumn } from 'typeorm';

export class PatientStatment {
  description: string;
  recommendation: string;
}

export class DoctorStatement {
  doctorId: string;
  description: string;
  recommendation: string;
  date: string;
}

@Entity()
export class Record {
  @ObjectIdColumn()
  _id: string;

  @Column()
  patientStatment: PatientStatment;

  @Column({ type: 'array' })
  doctorStatement: DoctorStatement[];

  @Column()
  createdAt: string;

  @Column()
  updatedAt: string;

  @Column({ type: 'enum', default: 'open' })
  status: string;

  @Column({ type: 'int' })
  duration: number;

  @Column()
  patientId: string;

  @Column()
  recordId: string;
}
