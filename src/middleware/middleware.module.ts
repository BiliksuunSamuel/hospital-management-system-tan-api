import { UserModule } from 'src/user/user.module';
import { Module } from '@nestjs/common';
import { MiddlewareService } from './middleware.service';

@Module({
  providers: [MiddlewareService],
  imports: [UserModule],
  exports: [MiddlewareService],
})
export class MiddlewareModule {}
