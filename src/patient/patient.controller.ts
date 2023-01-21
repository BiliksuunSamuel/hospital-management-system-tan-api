import { PatientRecordPermissionGrantDto } from './../dto/patient/patient.record.permisions.grant.dto';
import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Put,
  Delete,
} from '@nestjs/common';
import { Param } from '@nestjs/common/decorators/http/route-params.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreatePatientDto } from 'src/dto/patient/create.patient.dto';
import { UpdatePatientInfoDto } from 'src/dto/patient/update.patient.info.dto';
import { MiddlewareService } from 'src/middleware/middleware.service';
import { PatientService } from './patient.service';
import { SwaggerModule } from '@nestjs/swagger';

@Controller('patient')
export class PatientController {
  constructor(
    private readonly patientService: PatientService,
    private readonly middlewareService: MiddlewareService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() info: CreatePatientDto) {
    const user = await this.middlewareService.checkUser(req?.user?.phoneNumber);
    return await this.patientService.create(user._id, info);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async get(@Request() req) {
    await this.middlewareService.checkUser(req?.user?.phoneNumber);
    return await this.patientService.get();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getPatientbyId(@Param() { id }: any) {
    return await this.patientService.getPatientById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateInfo(@Param() { id }: any, @Body() info: UpdatePatientInfoDto) {
    const res = await this.patientService.updatePatientInfo(id, info);
    return res;
  }

  @Put('record/permission/grant/:id')
  @UseGuards(JwtAuthGuard)
  async recordPermissionGrant(
    @Param() { id }: any,
    @Body() info: PatientRecordPermissionGrantDto,
  ) {
    const res = await this.patientService.updateRecordAccessPermission(
      id,
      info,
    );
    return res;
  }

  @Put('record/permission/update/:id')
  @UseGuards(JwtAuthGuard)
  async updateRecordAccessPermission(
    @Param() { id }: any,
    @Body() info: PatientRecordPermissionGrantDto,
  ) {
    const res = await this.patientService.updateAccessPermission(id, info);
    return res;
  }

  @Put('record/permission/remove/:id')
  @UseGuards(JwtAuthGuard)
  async removeRecordAccessPermission(
    @Param() { id }: any,
    @Body() info: PatientRecordPermissionGrantDto,
  ) {
    const res = await this.patientService.removeAccessPermission(id, info);
    return res;
  }

  //
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deletePatient(@Param() { id }: any, @Request() req) {
    await this.middlewareService.isAdmin(req?.user?.phoneNumber);
    const res = await this.patientService.deletePatient(id);
    return res;
  }
}
