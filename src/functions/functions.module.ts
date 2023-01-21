import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { FunctionsService } from './functions.service';

@Module({
  providers: [FunctionsService],
  exports: [FunctionsService],
  imports: [HttpModule],
})
export class FunctionsModule {}
