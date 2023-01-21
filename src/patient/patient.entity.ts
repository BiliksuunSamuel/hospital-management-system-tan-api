import { Entity, Column, ObjectIdColumn } from 'typeorm';

export class PatientRecordPermission {
  userId: string;
  permissionType: 'single' | 'all';
  documentId?: string;
  status: boolean;
}

@Entity()
export class Patient {
  @ObjectIdColumn()
  _id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  dateOfBirth: string;

  @Column()
  email: string;

  @Column()
  contact: string;

  @Column()
  createdAt: string;

  @Column()
  updatedAt: string;

  @Column()
  authenticated: boolean;

  @Column()
  authenticationCode: string;

  @Column()
  patientId: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  address: string;

  @Column()
  createdBy: string;

  @Column()
  gender: string;

  @Column()
  recordPermissions: PatientRecordPermission[];
}
