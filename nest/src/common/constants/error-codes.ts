/**
 * 系统错误码定义
 * 格式: A-BB-CCC
 * A: 错误类型 (1: 系统错误, 2: 业务错误, 3: 第三方服务错误)
 * BB: 模块ID (01: 通用, 02: 用户, 03: 认证, 04: 邮件)
 * CCC: 具体错误码
 */

export enum ErrorCode {
  // 系统错误 (1-xx-xxx)
  INTERNAL_ERROR = '1-01-001',         // 内部服务器错误
  INVALID_CONFIG = '1-01-002',         // 配置错误
  DATABASE_ERROR = '1-01-003',         // 数据库错误
  
  // 认证/授权错误 (2-03-xxx)
  INVALID_CREDENTIALS = '2-03-001',    // 无效的用户名或密码
  ACCOUNT_LOCKED = '2-03-002',         // 账户已锁定
  INVALID_TOKEN = '2-03-003',          // 无效的令牌
  TOKEN_EXPIRED = '2-03-004',          // 令牌已过期
  INSUFFICIENT_PERMISSIONS = '2-03-005', // 权限不足
  
  // 用户模块错误 (2-02-xxx)
  USER_NOT_FOUND = '2-02-001',         // 用户不存在
  USER_ALREADY_EXISTS = '2-02-002',    // 用户已存在
  INVALID_USER_DATA = '2-02-003',      // 无效的用户数据
  
  // 邮件模块错误 (3-04-xxx)
  EMAIL_SEND_FAILED = '3-04-001',      // 邮件发送失败
  EMAIL_CONFIG_ERROR = '3-04-002',     // 邮件配置错误
  INVALID_EMAIL = '3-04-003',          // 无效的邮件地址
  
  // 验证码错误 (2-05-xxx)
  INVALID_VERIFICATION_CODE = '2-05-001', // 无效的验证码
  VERIFICATION_CODE_EXPIRED = '2-05-002', // 验证码已过期
  VERIFICATION_CODE_SEND_FAILED = '2-05-003', // 验证码发送失败
}

/**
 * 错误码与i18n键的映射
 */
export const ErrorCodeI18nMap: Record<ErrorCode, string> = {
  [ErrorCode.INTERNAL_ERROR]: 'error.common.internalError',
  [ErrorCode.INVALID_CONFIG]: 'error.common.invalidConfig',
  [ErrorCode.DATABASE_ERROR]: 'error.common.databaseError',
  
  [ErrorCode.INVALID_CREDENTIALS]: 'auth.login.invalidCredentials',
  [ErrorCode.ACCOUNT_LOCKED]: 'auth.login.accountLocked',
  [ErrorCode.INVALID_TOKEN]: 'auth.token.invalid',
  [ErrorCode.TOKEN_EXPIRED]: 'auth.token.expired',
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'error.common.forbidden',
  
  [ErrorCode.USER_NOT_FOUND]: 'user.error.notFound',
  [ErrorCode.USER_ALREADY_EXISTS]: 'auth.register.userExists',
  [ErrorCode.INVALID_USER_DATA]: 'user.error.invalidData',
  
  [ErrorCode.EMAIL_SEND_FAILED]: 'email.resetPassword.sendFailed',
  [ErrorCode.EMAIL_CONFIG_ERROR]: 'email.configIncomplete',
  [ErrorCode.INVALID_EMAIL]: 'email.validation.invalidEmail',
  
  [ErrorCode.INVALID_VERIFICATION_CODE]: 'auth.password.reset.codeInvalid',
  [ErrorCode.VERIFICATION_CODE_EXPIRED]: 'auth.password.reset.codeExpired',
  [ErrorCode.VERIFICATION_CODE_SEND_FAILED]: 'auth.password.forgot.codeSendFailed',
}; 