import { randomUUID } from 'crypto';
import { GenerateDate, GenerateId, GenerateRecordId } from 'src/utils';
import { CreateRecordDto } from './../dto/record/create.record.dto';
import { Injectable, HttpException } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponseModel } from 'src/model/api.response.model';
import { Repository } from 'typeorm';
import { Record } from './record.entity';
import { UserInfoModel } from 'src/model/user.info.model';
import { PatientService } from 'src/patient/patient.service';

@Injectable()
export class RecordService {
  constructor(
    @InjectRepository(Record)
    private readonly recordRepository: Repository<Record>,
    private readonly patientService: PatientService,
  ) {}

  //get patient records by patientId
  async getPatientRecords(
    patientId: string,
  ): Promise<ApiResponseModel<Record[]>> {
    const data = await this.recordRepository.findBy({ patientId });
    return {
      data,
      message: '',
      code: HttpStatus.OK,
    };
  }

  //delete patient medical record
  async deleteRecord(recordId: string): Promise<ApiResponseModel<string>> {
    const record = await this.recordRepository.findOneBy({ recordId });
    if (record) {
      await this.recordRepository.remove(record);
      return {
        data: '',
        message: 'Medical Record Deleted Successfully',
        code: HttpStatus.OK,
      };
    }
    throw new HttpException('Record Not Found', HttpStatus.NOT_FOUND);
  }

  //get patient record by user
  async getRecord(
    user: UserInfoModel,
    patientId: string,
  ): Promise<ApiResponseModel<Record[]>> {
    const patient = await this.patientService.getPatient(patientId);
    if (patient) {
      const userPermission =
        patient.recordPermissions &&
        patient.recordPermissions.find((p) => p.userId === user.userId) !==
          undefined &&
        patient.recordPermissions.find((p) => p.userId === user.userId).status;

      if (userPermission) {
        const permission = patient.recordPermissions.find(
          (p) => p.userId === user.userId,
        );
        const record =
          permission?.permissionType === 'single'
            ? await this.recordRepository.findBy({
                patientId: patient.patientId,
                recordId: permission?.documentId,
              })
            : await this.recordRepository.findBy({
                patientId: patient.patientId,
              });

        return {
          data: record,
          message: '',
          code: HttpStatus.OK,
        };
      }
      throw new HttpException('Access Denied', HttpStatus.UNAUTHORIZED);
    }
    throw new HttpException(
      'Patient Not Found, Access Not Allowed',
      HttpStatus.NOT_FOUND,
    );
  }

  //get all patien records
  async getRecords(): Promise<ApiResponseModel<Record[]>> {
    return {
      data: await this.recordRepository.find({}),
      message: '',
      code: HttpStatus.OK,
    };
  }

  //create patient medical record
  async createRecord(info: CreateRecordDto): Promise<ApiResponseModel<Record>> {
    const record = await this.recordRepository.create(info);
    record.createdAt = GenerateDate();
    record.recordId = GenerateRecordId();

    await this.recordRepository.save(record);
    return {
      data: record,
      message: 'Patient Medical Record Added Successfully',
      code: HttpStatus.OK,
    };
  }

  //update medical record
  async updatePatientRecord(
    info: CreateRecordDto,
    id: string,
  ): Promise<ApiResponseModel<Record>> {
    const record = await this.recordRepository.findOneBy({ recordId: id });
    if (record) {
      await this.recordRepository.update(record._id, { ...info });
      return {
        data: await this.recordRepository.findOneBy({ recordId: id }),
        message: 'Record Updated Successfully',
        code: HttpStatus.OK,
      };
    }
    throw new HttpException(
      'Record Not Found, Operation Failed',
      HttpStatus.NOT_FOUND,
    );
  }
}
