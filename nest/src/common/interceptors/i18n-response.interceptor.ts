import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { I18nService } from 'nestjs-i18n';
import { Request, Response } from 'express';

// 定义响应数据接口
interface ResponseData {
  code?: number;
  data?: unknown;
  message?: string;
  messageKey?: string;
  args?: Record<string, unknown>;
  success?: boolean;
  timestamp?: number;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseData>
{
  constructor(private readonly i18n?: I18nService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseData> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const lang =
      request.headers['accept-language']?.split(',')[0] ||
      (request.query.lang as string) ||
      'zh';

    return next.handle().pipe(
      map((data: unknown) => {
        const typedData = data as ResponseData;

        // 如果响应中包含消息键，则翻译该消息
        if (typedData && typedData.messageKey && this.i18n) {
          const { messageKey, args = {} } = typedData;
          typedData.message = this.i18n.translate(messageKey, { lang, args });
          delete typedData.messageKey;
        }

        // 确保响应格式统一
        if (typedData && !typedData.code) {
          const statusCode = response.statusCode || 200;

          // 如果原始数据已经是标准格式，不要重复处理
          if (
            typedData.data !== undefined ||
            typedData.message ||
            typedData.success !== undefined
          ) {
            return typedData;
          }

          // 构建标准响应
          return {
            code: statusCode,
            data: typedData.data !== undefined ? typedData.data : typedData,
            message:
              typedData.message || this.getDefaultMessage(request.method, lang),
            success: typedData.success !== undefined ? typedData.success : true,
            timestamp: Date.now(),
          };
        }

        return typedData;
      }),
    );
  }

  private getDefaultMessage(method: string, lang: string): string {
    const methodKey = method.toLowerCase();

    // 如果有i18n服务，尝试使用i18n
    if (this.i18n) {
      try {
        let key: string;
        switch (methodKey) {
          case 'get':
            key = 'common.getSuccess';
            break;
          case 'post':
            key = 'common.createSuccess';
            break;
          case 'put':
          case 'patch':
            key = 'common.updateSuccess';
            break;
          case 'delete':
            key = 'common.deleteSuccess';
            break;
          default:
            key = 'common.operationSuccess';
        }
        return this.i18n.translate(key, { lang });
      } catch {
        // 翻译失败，使用默认消息
      }
    }

    // 使用硬编码的默认消息
    if (methodKey === 'get')
      return lang === 'zh' ? '获取成功' : 'Successfully retrieved';
    if (methodKey === 'post')
      return lang === 'zh' ? '创建成功' : 'Successfully created';
    if (methodKey === 'put' || methodKey === 'patch')
      return lang === 'zh' ? '更新成功' : 'Successfully updated';
    if (methodKey === 'delete')
      return lang === 'zh' ? '删除成功' : 'Successfully deleted';
    return lang === 'zh' ? '操作成功' : 'Operation successful';
  }
}
