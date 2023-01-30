import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { Patient } from './patient.entity';
import { MiddlewareModule } from 'src/middleware/middleware.module';
import { FunctionsModule } from 'src/functions/functions.module';
import { RecordModule } from 'src/record/record.module';

@Module({
  providers: [PatientService],
  controllers: [PatientController],
  imports: [
    TypeOrmModule.forFeature([Patient]),
    MiddlewareModule,
    FunctionsModule,
    UserModule,
  ],
  exports: [PatientService],
})
export class PatientModule {}
