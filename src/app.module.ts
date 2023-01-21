import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PatientModule } from './patient/patient.module';
import { RecordModule } from './record/record.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormConfiguration } from './typeorm.config';
import { AutomapperModule } from '@automapper/nestjs';
import { MiddlewareModule } from './middleware/middleware.module';
import { FunctionsService } from './functions/functions.service';
import { FunctionsModule } from './functions/functions.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    PatientModule,
    RecordModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      ...TypeormConfiguration,
      autoLoadEntities: true,
    }),
    MiddlewareModule,
    FunctionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
