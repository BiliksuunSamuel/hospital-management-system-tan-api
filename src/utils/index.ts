import * as bcrypt from 'bcrypt';
import * as otpgenerator from 'otp-generator';
import * as dayjs from 'dayjs';
import { randomUUID } from 'crypto';
import { User } from 'src/user/user.entity';
import { UserInfoModel } from 'src/model/user.info.model';
export function HashPassword(password: string = '') {
  return bcrypt.hashSync(password, 10);
}

export function ComparePassword(password: string = '', hpassword: string = '') {
  return bcrypt.compareSync(password, hpassword);
}

export function GenerateId() {
  var ids = randomUUID().split('-');
  let id = '';

  ids.forEach((i) => {
    id += i;
  });

  return id;
}

export function GenerateOtp(length: number = 6) {
  return otpgenerator.generate(length, {
    specialChars: false,
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
  });
}

export function GenerateDate() {
  return dayjs().format();
}

export function GeneratePatientId() {
  return (
    'TAN' +
    otpgenerator.generate(7, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    })
  );
}

export function GenerateRecordId() {
  return otpgenerator.generate(8, {
    upperCaseAlphabets: true,
    digits: true,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
}

export function formatUserInfo(user: User): UserInfoModel {
  const { password, authenticationCode, ...others } = user;
  return { ...others, token: '' };
}
