import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    
    // 默认为500错误
    const httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    
    let message = '服务器内部错误';
    if (exception instanceof Error) {
      message = exception.message;
      console.error(`错误详情: ${exception.stack}`);
    }

    const responseBody = {
      code: httpStatus,
      timestamp: Date.now(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      method: httpAdapter.getRequestMethod(ctx.getRequest()),
      message: message,
      data: null,
      success: false
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
} 