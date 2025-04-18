/**
 * 缓存键前缀常量
 * 使用统一前缀可以避免命名冲突，并方便按类型清理缓存
 */
export class CacheKeys {
  // 通用前缀
  static readonly PREFIX = 'auth_service';
  
  // 验证码前缀
  static readonly VERIFICATION_CODE = `${CacheKeys.PREFIX}:verification_code`;
  
  // 登录尝试前缀
  static readonly LOGIN_ATTEMPTS = `${CacheKeys.PREFIX}:login_attempts`;
  
  // 用户会话前缀
  static readonly USER_SESSION = `${CacheKeys.PREFIX}:user_session`;
  
  // 令牌黑名单前缀
  static readonly TOKEN_BLACKLIST = `${CacheKeys.PREFIX}:token_blacklist`;
  
  /**
   * 获取用户验证码缓存键
   * @param email 用户邮箱
   */
  static getVerificationCodeKey(email: string): string {
    return `${CacheKeys.VERIFICATION_CODE}:${email}`;
  }
  
  /**
   * 获取登录尝试缓存键
   * @param username 用户名或邮箱
   */
  static getLoginAttemptsKey(username: string): string {
    return `${CacheKeys.LOGIN_ATTEMPTS}:${username}`;
  }
  
  /**
   * 获取用户会话缓存键
   * @param userId 用户ID
   */
  static getUserSessionKey(userId: string): string {
    return `${CacheKeys.USER_SESSION}:${userId}`;
  }
  
  /**
   * 获取令牌黑名单缓存键
   * @param token 令牌
   */
  static getTokenBlacklistKey(token: string): string {
    return `${CacheKeys.TOKEN_BLACKLIST}:${token}`;
  }
} 