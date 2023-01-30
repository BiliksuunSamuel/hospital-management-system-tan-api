import { CreateRecordDto } from './../dto/record/create.record.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MiddlewareService } from 'src/middleware/middleware.service';
import { RecordService } from './record.service';

@Controller('record')
export class RecordController {
  constructor(
    private readonly recordService: RecordService,
    private readonly middlewareService: MiddlewareService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createRecord(@Body() info: CreateRecordDto) {
    const res = await this.recordService.createRecord(info);
    return res;
  }

  //recordId
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteRecord(@Param() { id }: any, @Request() req) {
    await this.middlewareService.isAdmin(req?.user?.phoneNumber);
    return await this.recordService.deleteRecord(id);
  }

  //recordId
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateRecord(@Body() info: CreateRecordDto, @Param() { id }: any) {
    return await this.recordService.updatePatientRecord(info, id);
  }

  @Get('request/:id')
  @UseGuards(JwtAuthGuard)
  async getRequestRecordData(@Param() { id }: any) {
    return await this.recordService.getPatientRequestRecords(id);
  }

  @Get('user/accessible/:id')
  @UseGuards(JwtAuthGuard)
  async getUserAccessibleRecords(@Param() { id }: any) {
    return await this.recordService.getUserAccessibleRecords(id);
  }
  @Get()
  @UseGuards(JwtAuthGuard)
  async getRecords(@Request() req) {
    await this.middlewareService.isAdmin(req?.user?.phoneNumber);
    return await this.recordService.getRecords();
  }

  //get patient records by user
  @Get('user/:id')
  @UseGuards(JwtAuthGuard)
  async getPatientRecordsByUser(@Param() { id }: any, @Request() req) {
    const user = await this.middlewareService.checkUser(req?.user?.phoneNumber);
    return await this.recordService.getRecord({ ...user, token: '' }, id);
  }

  //get patient records by user
  @Get('patient/:id')
  @UseGuards(JwtAuthGuard)
  async getPatientRecordsByPatient(@Param() { id }: any, @Request() req) {
    const user = await this.middlewareService.checkUser(req?.user?.phoneNumber);
    return await this.recordService.getRecordsByPatient(id);
  }

  @Get('/active/:id')
  @UseGuards(JwtAuthGuard)
  async getActiveRecord(@Param() { id }: any, @Request() req) {
    return await this.recordService.getActivePatientRecord(id);
  }
}
