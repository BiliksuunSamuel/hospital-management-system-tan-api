import { GenerateDate } from 'src/utils';
import {
  Column,
  Entity,
  ObjectIdColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @ObjectIdColumn()
  _id: string;

  @Column()
  userType: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  role: string;

  @Column()
  password: string;

  @Column()
  createdAt: string;

  @Column()
  updatedAt: string;

  @Column()
  phoneNumber: string;

  @Column()
  email: string;

  @Column()
  isLoggedIn: boolean;

  @Column()
  lastLogin: string;

  @Column()
  authenticated: boolean;

  @Column()
  userId: string;

  @Column()
  authenticationCode: string;
}
