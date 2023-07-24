import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";


@Catch()
export class Exceptions implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception?.response?.status ? exception?.response?.status : 500
    response.status(status).json({
      result_code : status < 500 ? 4000 : 5000,
      payload : {
        result : null
      },
      message : exception?.response?.message ? exception?.response?.message : "Unkwon error",
    })
  }
}