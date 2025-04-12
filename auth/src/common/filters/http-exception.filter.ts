import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();
    
    let message = '请求失败';
    if (typeof errorResponse === 'object' && 'message' in errorResponse) {
      message = Array.isArray(errorResponse['message']) 
        ? errorResponse['message'][0] 
        : errorResponse['message'];
    } else if (typeof errorResponse === 'string') {
      message = errorResponse;
    }

    response.status(status).json({
      code: status,
      timestamp: Date.now(),
      path: request.url,
      method: request.method,
      message: message,
      data: null,
      success: false
    });
  }
} 