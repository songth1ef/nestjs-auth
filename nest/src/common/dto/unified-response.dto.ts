import { ApiProperty } from '@nestjs/swagger';
import { ErrorCode } from '../constants/error-codes';

/**
 * 统一响应DTO
 * 提供一致的API响应格式
 */
export class UnifiedResponseDto<T = unknown> {
  @ApiProperty({ description: '请求状态码', example: 200 })
  code: number;

  @ApiProperty({
    description: '错误码，仅在错误时提供',
    example: '2-03-001',
    required: false,
  })
  errorCode?: ErrorCode;

  @ApiProperty({ description: '响应消息', example: '操作成功' })
  message: string;

  @ApiProperty({ description: '响应数据', required: false })
  data?: T;

  @ApiProperty({ description: '请求路径', example: '/api/auth/login' })
  path: string;

  @ApiProperty({ description: '请求方法', example: 'POST' })
  method: string;

  @ApiProperty({ description: '请求是否成功', example: true })
  success: boolean;

  @ApiProperty({ description: '时间戳', example: '2023-06-01T12:00:00.000Z' })
  timestamp: string;

  /**
   * 创建成功响应
   */
  static success<T>(
    data?: T,
    message = '操作成功',
  ): Omit<UnifiedResponseDto<T>, 'path' | 'method'> {
    return {
      code: 200,
      message,
      data,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 创建错误响应
   */
  static error<T>(
    message: string,
    code = 500,
    errorCode?: ErrorCode,
    data?: T,
  ): Omit<UnifiedResponseDto<T>, 'path' | 'method'> {
    return {
      code,
      errorCode,
      message,
      data,
      success: false,
      timestamp: new Date().toISOString(),
    };
  }
} 