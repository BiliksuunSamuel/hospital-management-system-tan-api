import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { UserModule } from 'src/user/user.module';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { MiddlewareModule } from 'src/middleware/middleware.module';
import { FunctionsModule } from 'src/functions/functions.module';
import { PatientModule } from 'src/patient/patient.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '8hrs' },
    }),
    UserModule,
    MiddlewareModule,
    FunctionsModule,
    PatientModule,
  ],
})
export class AuthModule {}
