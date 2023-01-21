export class ApiResponseModel<T> {
  data: T;
  message: string;
  code: number;
}
