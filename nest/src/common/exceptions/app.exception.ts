import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../constants/error-codes';

/**
 * 应用异常基类
 * 提供标准化的错误响应格式，包含错误码、消息和元数据
 */
export class AppException extends HttpException {
  /**
   * 创建应用异常
   * @param errorCode 错误码
   * @param message 错误消息
   * @param status HTTP状态码
   * @param data 附加数据
   */
  constructor(
    public readonly errorCode: ErrorCode,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly data?: Record<string, any>,
  ) {
    super(
      {
        statusCode: status,
        errorCode,
        message,
        data,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
}

/**
 * 未授权异常
 */
export class UnauthorizedException extends AppException {
  constructor(
    message = '未授权访问',
    errorCode = ErrorCode.INVALID_CREDENTIALS,
    data?: Record<string, any>,
  ) {
    super(errorCode, message, HttpStatus.UNAUTHORIZED, data);
  }
}

/**
 * 资源不存在异常
 */
export class NotFoundException extends AppException {
  constructor(
    message = '资源不存在',
    errorCode = ErrorCode.USER_NOT_FOUND,
    data?: Record<string, any>,
  ) {
    super(errorCode, message, HttpStatus.NOT_FOUND, data);
  }
}

/**
 * 验证码异常
 */
export class VerificationCodeException extends AppException {
  constructor(
    message = '验证码无效或已过期',
    errorCode = ErrorCode.INVALID_VERIFICATION_CODE,
    data?: Record<string, any>,
  ) {
    super(errorCode, message, HttpStatus.BAD_REQUEST, data);
  }
}

/**
 * 邮件发送异常
 */
export class EmailException extends AppException {
  constructor(
    message = '邮件发送失败',
    errorCode = ErrorCode.EMAIL_SEND_FAILED,
    data?: Record<string, any>,
  ) {
    super(errorCode, message, HttpStatus.INTERNAL_SERVER_ERROR, data);
  }
} 