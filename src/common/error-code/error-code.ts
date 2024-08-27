class ErrorCodeVo{
  readonly status : number;
  readonly code : string;
  readonly message : string;

  constructor(status : number, code : string, message : string){
    this.status = status;
    this.code = code;
    this.message = message;
  }
}

export type ErrorCode = ErrorCodeVo;

export const ENTITY_NOT_FOUND : ErrorCodeVo = new ErrorCodeVo(404, 'C001', 'Entity Not Found');
export const ALREADY_ISSUED_EXCEPTION : ErrorCodeVo = new ErrorCodeVo(400, 'C002', 'Already Issued');
export const BAD_REQUEST_EXCEPTION : ErrorCodeVo = new ErrorCodeVo(400, 'C003', 'Bad Request');