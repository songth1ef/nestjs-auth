import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { I18nService } from 'nestjs-i18n';
import { Request } from 'express';

@Injectable()
export class I18nResponseInterceptor implements NestInterceptor {
  constructor(private readonly i18n: I18nService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const lang = request.headers['accept-language']?.split(',')[0] || 
                 (request.query.lang as string) ||
                 'zh';
    
    return next.handle().pipe(
      map(data => {
        // 如果响应中包含消息键，则翻译该消息
        if (data && data.messageKey) {
          const { messageKey, args = {} } = data;
          data.message = this.i18n.translate(messageKey, { lang, args });
          delete data.messageKey;
        }
        
        // 确保响应格式统一
        if (data && !data.code) {
          const response = {
            code: context.switchToHttp().getResponse().statusCode || 200,
            data: data.data !== undefined ? data.data : data,
            message: data.message || this.getDefaultMessage(request.method, lang),
            success: data.success !== undefined ? data.success : true,
            timestamp: Date.now()
          };
          
          // 如果原始数据就已经有这些字段，不要覆盖
          if (data.data !== undefined || data.message || data.success !== undefined) {
            return data;
          }
          
          return response;
        }
        
        return data;
      }),
    );
  }
  
  private getDefaultMessage(method: string, lang: string): string {
    const methodKey = method.toLowerCase();
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
    
    try {
      return this.i18n.translate(key, { lang });
    } catch (e) {
      // 默认消息
      if (methodKey === 'get') return lang === 'zh' ? '获取成功' : 'Successfully retrieved';
      if (methodKey === 'post') return lang === 'zh' ? '创建成功' : 'Successfully created';
      if (methodKey === 'put' || methodKey === 'patch') return lang === 'zh' ? '更新成功' : 'Successfully updated';
      if (methodKey === 'delete') return lang === 'zh' ? '删除成功' : 'Successfully deleted';
      return lang === 'zh' ? '操作成功' : 'Operation successful';
    }
  }
} 