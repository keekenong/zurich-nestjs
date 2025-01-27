// Create ResponseDto class for client response
export class ResponseDto<T> {
  status: 'OK' | 'NOK';
  data: T;
  message?: string;

  constructor(status: 'OK' | 'NOK', data: T, message?: string) {
    this.status = status;
    this.data = data;
    this.message = message;
  }
}
