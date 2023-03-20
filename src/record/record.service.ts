import { randomUUID } from 'crypto';
import {
  formatRecordRequestModel,
  GenerateDate,
  GenerateId,
  GenerateRecordId,
} from 'src/utils';
import { CreateRecordDto } from './../dto/record/create.record.dto';
import { Injectable, HttpException } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponseModel } from 'src/model/api.response.model';
import { Repository } from 'typeorm';
import { Record } from './record.entity';
import { UserInfoModel } from 'src/model/user.info.model';
import { PatientService } from 'src/patient/patient.service';
import { PatientInfoModel } from 'src/model/patient.info.model';
import { RecordRequestModel } from 'src/dto/record/record.request.model';
import { RecordPermissionType } from 'src/enums/record.permissions.type';
import { MedicalStatement } from 'src/model/medical.statement.model';

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

  //update patient medical statement
  async updateMedicalStatement(
    patientId: string,
    recordId: string,
    statement: MedicalStatement,
  ): Promise<ApiResponseModel<{ record: Record; patient: PatientInfoModel }>> {
    try {
      var record = await this.recordRepository.findOneBy({
        recordId,
        patientId,
      });
      console.log(statement);
      if (record) {
        await this.recordRepository.update(record._id, {
          statements: record.statements.map((s) => {
            if (s.id === statement.id) {
              return statement;
            } else {
              return s;
            }
          }),
          updatedAt: GenerateDate(),
        });
        const patient = (
          await this.patientService.getPatientById(record.patientId)
        ).data;
        const recordInfo = await this.recordRepository.findOneBy({
          recordId,
          patientId,
        });
        return {
          data: {
            record: recordInfo,
            patient,
          },
          message: 'Medical Statement Updated',
          code: HttpStatus.OK,
        };
      }
      throw new HttpException('Patient record not found', HttpStatus.NOT_FOUND);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'sorry,something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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

  //get patient record by user
  async getRecordsByPatient(
    patientId: string,
  ): Promise<ApiResponseModel<Record[]>> {
    const patient = await this.patientService.getPatient(patientId);
    if (patient) {
      return {
        data: await this.recordRepository.findBy({ patientId }),
        message: '',
        code: HttpStatus.OK,
      };
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
  async createRecord(
    info: CreateRecordDto,
  ): Promise<ApiResponseModel<{ record: Record; patient: PatientInfoModel }>> {
    const record = await this.recordRepository.create(info);
    record.createdAt = GenerateDate();
    record.recordId = GenerateRecordId();
    record.statements = info.statements.map((s) => {
      return { ...s, id: GenerateId() };
    });
    console.log(info);
    await this.recordRepository.save(record);
    return {
      data: {
        record,
        patient: (await this.patientService.getPatientById(record.patientId))
          .data,
      },
      message: 'Patient Medical Record Added Successfully',
      code: HttpStatus.OK,
    };
  }

  //get patient request records
  async getPatientRequestRecords(
    patientId: string,
  ): Promise<ApiResponseModel<RecordRequestModel[]>> {
    const records = await this.recordRepository.findBy({ patientId });
    return {
      data: formatRecordRequestModel(records),
      code: HttpStatus.OK,
      message: '',
    };
  }

  //get user accessible records

  async getUserAccessibleRecords(
    userId: string,
  ): Promise<ApiResponseModel<Record[]>> {
    const patients = await this.patientService.get();
    const list: { patientId: string; recordId: string; all: boolean }[] = [];
    patients.data.map((pi) => {
      {
        pi.recordPermissions.map((p) => {
          if (p.userId === userId && p.status) {
            list.push({
              patientId: pi.patientId,
              recordId: p.documentId,
              all: p.permissionType === RecordPermissionType.All,
            });
          }
        });
      }
    });
    const records = await this.recordRepository.find({});
    let medFiles: Record[] = [];

    list.map((l) => {
      if (l.all) {
        const d = records.filter((r) => r.patientId === l.patientId);
        medFiles = [...medFiles, ...d];
      } else {
        const d = records.filter((r) => r.recordId === l.recordId);
        medFiles = [...medFiles, ...d];
      }
    });

    return {
      data: medFiles,
      message: '',
      code: HttpStatus.OK,
    };
  }

  //get active record
  async getActivePatientRecord(
    patientId: string,
  ): Promise<ApiResponseModel<{ record: Record; patient: PatientInfoModel }>> {
    const records = await this.recordRepository.findBy({
      patientId,
      status: 'open',
    });
    return {
      data:
        records.length > 0
          ? {
              record: records[records.length - 1],
              patient: (await this.patientService.getPatientById(patientId))
                .data,
            }
          : {
              record: null,
              patient: (await this.patientService.getPatientById(patientId))
                .data,
            },
      message: records.length > 0 ? '' : 'No Records Found',
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
      info.statements = info.statements.map((s) => {
        if (s.id === null) {
          console.log(s);
          s.id = GenerateId();
          return s;
        } else {
          return s;
        }
      });
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
