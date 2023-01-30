import { PatientRecordPermissionGrantDto } from './../dto/patient/patient.record.permisions.grant.dto';
import { Patient } from './patient.entity';
import { Injectable, HttpStatus, Logger, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectID, Repository } from 'typeorm';
import { CreatePatientDto } from 'src/dto/patient/create.patient.dto';
import { ApiResponseModel } from 'src/model/api.response.model';
import {
  formatPatientInfo,
  GenerateDate,
  GenerateId,
  GenerateOtp,
  GeneratePatientId,
  HashPassword,
} from 'src/utils';
import { PatientInfoModel } from 'src/model/patient.info.model';
import { ObjectId } from 'mongoose';
import { getuid } from 'process';
import { randomUUID } from 'crypto';
import { UpdatePatientInfoDto } from 'src/dto/patient/update.patient.info.dto';
import { FunctionsService } from 'src/functions/functions.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class PatientService {
  private readonly _logger = new Logger(PatientService.name);
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly functionsService: FunctionsService,
    private readonly userService: UserService,
  ) {}

  async create(
    userId: string,
    info: CreatePatientDto,
  ): Promise<ApiResponseModel<PatientInfoModel>> {
    this._logger.debug(
      'Creating New Patient, PatientName=>' +
        `${info.lastName} ${info.firstName}`,
    );
    const patient = await this.patientRepository.create(info);
    patient.createdAt = GenerateDate();
    patient.patientId = await this.generatePatientId();
    patient.password = HashPassword(info.contact);
    patient.updatedAt = null;
    patient.createdBy = userId;
    patient.address = info.address || null;
    patient.recordPermissions = [];
    patient.authenticationCode = GenerateOtp();
    patient.authenticated = false;

    await this.functionsService.sendMessage({
      reciepient: info.contact,
      message: `Thank You For Visiting TAN Hospital, PatientId=${patient.patientId}, AuthenticationCode=${patient.authenticationCode}, Please use this details to authenticate your profile, *Your Health, Our Concern*`,
    });
    await this.patientRepository.save(patient);
    const { password, ...otherDetails } = patient;

    return {
      data: { ...otherDetails },
      message: 'Patient Added Successfully',
      code: HttpStatus.CREATED,
    };
  }

  async getPatient(patientId: string): Promise<Patient> {
    return await this.patientRepository.findOneBy({ patientId });
  }

  async get(): Promise<ApiResponseModel<PatientInfoModel[]>> {
    this._logger.debug('Geting All Patients');
    return {
      data: (await this.patientRepository.find({})).map((p) => {
        const { password, ...info } = p;
        return info;
      }),
      message: '',
      code: HttpStatus.OK,
    };
  }

  //get patient by id
  async getPatientById(
    id: string,
  ): Promise<ApiResponseModel<PatientInfoModel>> {
    this._logger.debug(randomUUID({}));
    this._logger.debug(`Getting Patient Info, PatientId=>${id}`);
    const patient = await this.patientRepository.findOneBy({ patientId: id });
    if (patient) {
      const { password, ...info } = patient;
      return {
        data: { ...info },
        code: HttpStatus.OK,
        message: '',
      };
    }
    throw new HttpException('Patient Not Found', HttpStatus.NOT_FOUND);
  }

  //update patient info
  async updatePatientInfo(
    id: string,
    info: UpdatePatientInfoDto,
  ): Promise<ApiResponseModel<PatientInfoModel>> {
    let patientInfo = await this.patientRepository.findOneBy({
      patientId: id,
    });
    if (patientInfo) {
      await this.patientRepository.update(patientInfo._id, {
        ...info,
        updatedAt: GenerateDate(),
      });
      patientInfo = await this.patientRepository.findOneBy({ patientId: id });
      const { password, ...others } = patientInfo;
      return {
        data: { ...others },
        message: 'Info Updated Successfully',
        code: HttpStatus.OK,
      };
    }
    throw new HttpException(
      'Patient Not Found,Operation Failed',
      HttpStatus.NOT_FOUND,
    );
  }

  //update patient
  async updatePatient(info: Patient) {
    const { _id, ...others } = info;
    await this.patientRepository.update(_id, {
      ...others,
      updatedAt: GenerateDate(),
    });
  }
  //add patient document access permission
  async updateRecordAccessPermission(
    id: string,
    info: PatientRecordPermissionGrantDto,
  ): Promise<ApiResponseModel<string>> {
    const patient = await this.patientRepository.findOneBy({ patientId: id });
    const user = await this.userService.getUserById(info.userId);
    if (patient) {
      if (patient.recordPermissions) {
        await this.patientRepository.update(patient._id, {
          recordPermissions: [...patient.recordPermissions, { ...info }],
        });
      } else {
        await this.patientRepository.update(patient._id, {
          recordPermissions: [{ ...info }],
        });
      }

      await this.functionsService.sendMessage({
        reciepient: patient.contact,
        message: `Hello ${patient?.firstName} ${patient?.lastName},  ${user?.firstName} ${user?.lastName} is requesting access to your medical record, please visit your dashboard and review request`,
      });

      return {
        data: '',
        message: 'Permission Granted Successfully',
        code: HttpStatus.OK,
      };
    }
    throw new HttpException(
      'Patient Not Found, Operation Failed',
      HttpStatus.NOT_FOUND,
    );
  }

  //approve/decline record access permission
  async updateAccessPermission(
    id: string,
    info: PatientRecordPermissionGrantDto,
  ): Promise<ApiResponseModel<string>> {
    const patient = await this.patientRepository.findOneBy({ patientId: id });
    const user = await this.userService.getUserById(info.userId);
    if (patient) {
      if (patient.recordPermissions) {
        await this.patientRepository.update(patient._id, {
          recordPermissions: patient.recordPermissions.map((rp) => {
            if (rp.userId === info.userId) {
              return { ...info, id: GenerateId() };
            } else {
              return rp;
            }
          }),
        });
      }
      await this.functionsService.sendMessage({
        reciepient: user.phoneNumber,
        message: `Hello ${user.firstName} ${
          user.lastName
        }, your request to access ${patient.firstName} ${
          patient.lastName
        } medical data has been ${info.status ? 'approved' : 'declined'}`,
      });
      return {
        message: 'Access Permission Updated',
        data: '',
        code: HttpStatus.OK,
      };
    }
    throw new HttpException(
      'Patient Not Found, Operation Failed',
      HttpStatus.NOT_FOUND,
    );
  }

  //remove patient record access permission
  async removeAccessPermission(
    id: string,
    info: PatientRecordPermissionGrantDto,
  ): Promise<ApiResponseModel<string>> {
    const patient = await this.patientRepository.findOneBy({ patientId: id });
    if (patient) {
      if (patient.recordPermissions) {
        await this.patientRepository.update(patient._id, {
          recordPermissions: patient.recordPermissions.filter(
            (rp) =>
              rp.userId !== info.userId && rp.documentId !== info.documentId,
          ),
        });
        var user = await this.userService.getUserById(info.userId);
        await this.functionsService.sendMessage({
          reciepient: user.phoneNumber,
          message: `Hello ${user.firstName} ${
            user.lastName
          }, your request to access ${patient.firstName} ${
            patient.lastName
          } medical data has been ${info.status ? 'approved' : 'declined'}`,
        });
      }
      return {
        data: '',
        message: 'Patient Record Access Permission Removed Successfully',
        code: HttpStatus.OK,
      };
    }
    throw new HttpException('Patient Not Found', HttpStatus.NOT_FOUND);
  }

  //delete patient
  async deletePatient(
    id: string,
  ): Promise<ApiResponseModel<PatientInfoModel[]>> {
    const patient = await this.patientRepository.findOneBy({ patientId: id });
    if (patient) {
      await this.patientRepository.remove(patient);
      const patients = await this.patientRepository.find({});
      return {
        data: patients.map(formatPatientInfo),
        message: 'Patient Deleted Successfully',
        code: HttpStatus.OK,
      };
    }
    throw new HttpException(
      'Patient Not Found,Operation Failed',
      HttpStatus.NOT_FOUND,
    );
  }

  async generatePatientId(): Promise<string> {
    let id = GeneratePatientId();
    while (await this.patientRepository.findOneBy({ patientId: id })) {
      id = GeneratePatientId();
    }

    return id;
  }
}
