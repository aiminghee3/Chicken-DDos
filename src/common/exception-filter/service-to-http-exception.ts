import { ServiceException } from '../service.exception';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch(ServiceException)
export class ServiceToHttpException implements ExceptionFilter{
  catch(exception: ServiceException, host : ArgumentsHost){
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.errorCode.status;

    response
      .status(status)
      .json({
        statusCode : status,
        message : exception.message,
        code : exception.errorCode.code,
        path: request.url,
      })
  }
}