import { ServiceException } from './service.exception'
import { ALREADY_ISSUED_EXCEPTION, BAD_REQUEST_EXCEPTION, ENTITY_NOT_FOUND } from './error-code';

export const EntityNotFoundException = (message? : string): ServiceException =>{
  return new ServiceException(ENTITY_NOT_FOUND, message);
}

export const AlreadyIssuedException = (message? : string): ServiceException =>{
  return new ServiceException(ALREADY_ISSUED_EXCEPTION, message);
}

export const BadRequestException = (message? : string) : ServiceException =>{
  return new ServiceException(BAD_REQUEST_EXCEPTION, message);
}
