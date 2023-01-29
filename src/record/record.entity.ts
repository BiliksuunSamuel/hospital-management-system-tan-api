import { MedicalStatement } from './../model/medical.statement.model';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity()
export class Record {
  @ObjectIdColumn()
  _id: string;

  @Column({ type: 'array' })
  statements: MedicalStatement[];

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
