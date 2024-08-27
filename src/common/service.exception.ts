import { ErrorCode } from './error-code';

export class ServiceException extends Error{
  readonly errorCode : ErrorCode;

  constructor(errorCode : ErrorCode, message: string){
    if(!message){
      message = errorCode.message;
    }
    super(message);

    this.errorCode = errorCode;
  }
}