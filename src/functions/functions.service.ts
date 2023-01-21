import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import configuration from 'src/configuration';
import { SendMessageDto } from 'src/dto/function/send.message.dto';

@Injectable()
export class FunctionsService {
  private readonly _logger = new Logger(FunctionsService.name);
  constructor(readonly httpService: HttpService) {}

  sendMessage(info: SendMessageDto) {
    return new Promise((resolve, reject) => {
      try {
        this.httpService
          .axiosRef({
            baseURL: configuration().SmsUrl,
            method: 'post',
            params: {
              key: configuration().SmsKey,
              to: info.reciepient,
              msg: info.message,
              sender_id: 'hmstan',
            },
            headers: {
              'api-key': configuration().SmsKey,
              contentType: 'application/json',
            },
          })
          .then((response) => {
            this._logger.log(
              'sms Response = >' + JSON.stringify(response.data),
            );
            resolve(response.data);
          })
          .catch((error) =>
            reject(error?.response?.data || error?.message || error),
          );
      } catch (error) {
        reject(error);
      }
    });
  }
}
