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
import { PageResponseDto } from '../dto/page.dto';

// 定义用户接口，匹配request.user的结构
interface User {
  preferredLanguage?: string;
  [key: string]: any;
}

// 扩展Express的Request接口，添加user属性
interface RequestWithUser extends Request {
  user?: User;
}

// 定义响应数据接口
interface ResponseData {
  code?: number;
  data?: unknown;
  message?: string;
  messageKey?: string;
  args?: Record<string, unknown>;
  success?: boolean;
  timestamp?: number;
  meta?: unknown; // 添加meta字段，支持分页数据
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
    const request = context.switchToHttp().getRequest<RequestWithUser>();
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
          try {
            typedData.message = this.i18n.translate(messageKey, {
              lang,
              args,
            }) as string;
          } catch (error) {
            console.warn(`翻译键 ${messageKey} 失败:`, error);
            // 提供一个后备消息，避免显示键名
            typedData.message =
              (args['message'] as string) ||
              this.getDefaultMessage(request.method, lang);
          }
          delete typedData.messageKey;
        }

        // 处理PageResponseDto类型的响应，将其转换为前端期望的格式
        if (typedData instanceof PageResponseDto) {
          const pageData = typedData;
          const statusCode = response.statusCode || 200;
          
          // 获取用户语言偏好
          let userLang = lang;
          if (request.user && request.user.preferredLanguage) {
            userLang = request.user.preferredLanguage;
          }
          
          // 根据HTTP方法和用户语言获取消息
          const message = this.getDefaultMessage(request.method, userLang);
          
          return {
            code: statusCode,
            data: {
              data: pageData.data,
              meta: pageData.meta,
            },
            message,
            success: true,
            timestamp: Date.now(),
          };
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
            // 尝试翻译message如果它看起来像一个i18n键
            if (
              typedData.message &&
              typeof typedData.message === 'string' &&
              typedData.message.includes('.') &&
              this.i18n
            ) {
              try {
                const translatedMessage = this.i18n.translate(
                  typedData.message,
                  {
                    lang,
                  },
                ) as string;
                if (translatedMessage !== typedData.message) {
                  typedData.message = translatedMessage;
                }
              } catch (error) {
                console.warn(`翻译消息 ${typedData.message} 失败:`, error);
              }
            }
            return typedData;
          }

          // 构建标准响应
          const message = this.getDefaultMessage(request.method, lang);
          return {
            code: statusCode,
            data: typedData.data !== undefined ? typedData.data : typedData,
            message,
            success: typedData.success !== undefined ? typedData.success : true,
            timestamp: Date.now(),
          };
        }

        // 如果message看起来像是i18n键且没有被翻译，尝试翻译
        if (
          typedData &&
          typedData.message &&
          typeof typedData.message === 'string' &&
          typedData.message.includes('.') &&
          this.i18n
        ) {
          try {
            const translatedMessage = this.i18n.translate(typedData.message, {
              lang,
            }) as string;
            if (translatedMessage !== typedData.message) {
              typedData.message = translatedMessage;
            }
          } catch (error) {
            console.warn(`翻译消息 ${typedData.message} 失败:`, error);
          }
        }

        return typedData;
      }),
    );
  }

  private getDefaultMessage(method: string, lang: string): string {
    const methodKey = method.toLowerCase();
    
    // 根据语言直接返回硬编码的消息
    // 这样即使i18n服务不可用也能返回正确的消息
    if (lang.startsWith('zh')) {
      if (methodKey === 'get') return '获取成功';
      if (methodKey === 'post') return '创建成功';
      if (methodKey === 'put' || methodKey === 'patch') return '更新成功';
      if (methodKey === 'delete') return '删除成功';
      return '操作成功';
    } else {
      if (methodKey === 'get') return 'Successfully retrieved';
      if (methodKey === 'post') return 'Successfully created';
      if (methodKey === 'put' || methodKey === 'patch') return 'Successfully updated';
      if (methodKey === 'delete') return 'Successfully deleted';
      return 'Operation successful';
    }
  }
}
