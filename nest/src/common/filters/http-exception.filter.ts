import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Optional,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';

interface ErrorResponse {
  message: string | string[];
  [key: string]: unknown;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(@Optional() private readonly i18n?: I18nService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    // 获取请求的语言
    const lang =
      request.headers['accept-language']?.split(',')[0] ||
      (request.query.lang as string) ||
      'zh';

    // 提取错误消息
    let message: string;
    const messageKey = 'error.common.badRequest';
    let messageArgs = {};

    if (typeof errorResponse === 'object' && 'message' in errorResponse) {
      const typedErrorResponse = errorResponse as ErrorResponse;
      const rawMessage = Array.isArray(typedErrorResponse.message)
        ? typedErrorResponse.message[0]
        : typedErrorResponse.message;
      
      // 使用原始消息作为参数
      messageArgs = { message: rawMessage };
      message = this.translate(messageKey, lang, messageArgs);
    } else if (typeof errorResponse === 'string') {
      // 使用异常响应作为参数
      messageArgs = { message: errorResponse };
      message = this.translate(messageKey, lang, messageArgs);
    } else {
      // 默认错误消息
      message = this.translate('error.common.badRequest', lang);
    }

    response.status(status).json({
      code: status,
      timestamp: Date.now(),
      path: request.url,
      method: request.method,
      message,
      data: null,
      success: false,
    });
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
      // 如果i18n服务不可用，返回默认消息或参数中的message
      if (args.message && typeof args.message === 'string') return args.message;
      return lang === 'zh' ? '请求失败' : 'Request failed';
    }

    try {
      return this.i18n.translate(key, { lang, args });
    } catch {
      // 如果翻译失败，尝试使用参数中的message或返回默认消息
      if (args.message && typeof args.message === 'string') return args.message;
      return lang === 'zh' ? '请求失败' : 'Request failed';
    }
  }
}
