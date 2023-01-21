import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { FunctionsModule } from 'src/functions/functions.module';

@Module({
  providers: [UserService],
  exports: [UserService],
  imports: [TypeOrmModule.forFeature([User]), FunctionsModule],
})
export class UserModule {}
