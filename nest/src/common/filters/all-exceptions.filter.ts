import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Optional,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { I18nService } from 'nestjs-i18n';
import { Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    @Optional() private readonly i18n?: I18nService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    // 获取请求的语言
    const lang =
      request.headers['accept-language']?.split(',')[0] ||
      (request.query.lang as string) ||
      'zh';

    // 默认为500错误
    const httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

    // 使用i18n获取错误消息
    let messageKey = 'error.common.internalError';
    let messageArgs = {};

    if (exception instanceof Error) {
      messageKey = 'error.common.internalError';
      messageArgs = { message: exception.message };
      console.error(`错误详情: ${exception.stack}`);
    }

    // 翻译错误消息
    const message = this.translate(messageKey, lang, messageArgs);

    const responseBody = {
      code: httpStatus,
      timestamp: Date.now(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      method: httpAdapter.getRequestMethod(ctx.getRequest()),
      message,
      data: null,
      success: false,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  /**
   * 翻译指定的键值
   * 使用项目的i18n服务，如果不可用则返回默认消息
   */
  private translate(
    key: string,
    lang: string,
    args: Record<string, any> = {},
  ): string {
    if (!this.i18n) {
      // 如果i18n服务不可用，返回默认消息
      return lang === 'zh' ? '服务器内部错误' : 'Internal Server Error';
    }

    try {
      return this.i18n.translate(key, { lang, args });
    } catch {
      // 如果翻译失败，返回默认消息
      return lang === 'zh' ? '服务器内部错误' : 'Internal Server Error';
    }
  }
}
