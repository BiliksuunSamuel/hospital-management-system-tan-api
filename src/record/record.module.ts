import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { RecordService } from './record.service';
import { RecordController } from './record.controller';
import { Record } from './record.entity';
import { MiddlewareModule } from 'src/middleware/middleware.module';
import { PatientModule } from 'src/patient/patient.module';

@Module({
  providers: [RecordService],
  controllers: [RecordController],
  imports: [
    TypeOrmModule.forFeature([Record]),
    MiddlewareModule,
    PatientModule,
  ],
})
export class RecordModule {}
