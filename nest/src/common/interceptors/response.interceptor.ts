import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  code: number;
  data: T;
  message: string;
  success: boolean;
  timestamp: number;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const now = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const statusCode = context.switchToHttp().getResponse().statusCode;
    
    return next.handle().pipe(
      map(data => {
        let response: any;
        
        // 如果响应已经是标准格式，直接返回
        if (data && data.code !== undefined && data.success !== undefined 
            && data.data !== undefined && data.message !== undefined) {
          return data;
        }
        
        // 构建标准响应格式
        response = {
          code: statusCode,
          data: data === undefined ? null : data,
          message: this.getSuccessMessage(request.method),
          success: true,
          timestamp: now,
        };
        
        return response;
      }),
    );
  }
  
  private getSuccessMessage(method: string): string {
    switch (method.toUpperCase()) {
      case 'GET':
        return '获取成功';
      case 'POST':
        return '创建成功';
      case 'PUT':
      case 'PATCH':
        return '更新成功';
      case 'DELETE':
        return '删除成功';
      default:
        return '操作成功';
    }
  }
} 