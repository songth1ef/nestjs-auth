import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { CacheKeys } from '../../common/constants/cache-keys';
import { EmailService } from '../../modules/email/email.service';
import { VerificationCodeException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-codes';

/**
 * 验证服务
 * 负责生成、存储和验证各类验证码
 */
@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  /**
   * 生成验证码
   * @returns 生成的验证码
   */
  generateVerificationCode(): string {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 排除容易混淆的字符如0,1,I,O
    let code = '';

    // 默认生成6位验证码
    const codeLength =
      this.configService.get<number>('VERIFICATION_CODE_LENGTH') || 6;

    for (let i = 0; i < codeLength; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return code;
  }

  /**
   * 为用户生成并发送验证码
   * @param email 用户邮箱
   * @param lang 语言代码
   * @returns 发送结果
   */
  async sendVerificationCode(email: string, lang: string): Promise<boolean> {
    try {
      // 生成验证码
      const code = this.generateVerificationCode();

      // 获取验证码有效期（毫秒）
      const expiryMinutes =
        this.configService.get<number>('VERIFICATION_CODE_EXPIRY_MINUTES') || 5;
      const expiryMs = expiryMinutes * 60 * 1000;

      // 存储验证码
      const cacheKey = CacheKeys.getVerificationCodeKey(email);
      await this.cacheManager.set(cacheKey, code, expiryMs);

      // 发送验证码邮件
      const success = await this.emailService.sendVerificationCode(
        email,
        code,
        lang,
      );

      if (!success) {
        this.logger.warn(`无法发送验证码邮件到 ${email}`);
        // 如果邮件发送失败，从缓存中删除验证码
        await this.cacheManager.del(cacheKey);
      }

      return success;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`验证码发送失败: ${err.message}`, err.stack);
      return false;
    }
  }

  /**
   * 验证用户提供的验证码
   * @param email 用户邮箱
   * @param code 用户提供的验证码
   * @param deleteOnSuccess 验证成功后是否删除验证码
   * @returns 验证结果
   */
  async verifyCode(
    email: string,
    code: string,
    deleteOnSuccess = true,
  ): Promise<boolean> {
    try {
      // 获取存储的验证码
      const cacheKey = CacheKeys.getVerificationCodeKey(email);
      const storedCode = await this.cacheManager.get<string>(cacheKey);

      // 如果没有找到验证码或已过期
      if (!storedCode) {
        throw new VerificationCodeException(
          '验证码已过期或不存在',
          ErrorCode.VERIFICATION_CODE_EXPIRED,
        );
      }

      // 验证码不匹配
      if (storedCode !== code) {
        throw new VerificationCodeException(
          '验证码不正确',
          ErrorCode.INVALID_VERIFICATION_CODE,
        );
      }

      // 验证成功后删除验证码（如果需要）
      if (deleteOnSuccess) {
        await this.cacheManager.del(cacheKey);
      }

      return true;
    } catch (error) {
      if (error instanceof VerificationCodeException) {
        throw error;
      }

      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`验证码验证失败: ${err.message}`, err.stack);

      throw new VerificationCodeException(
        '验证码验证过程中发生错误',
        ErrorCode.VERIFICATION_CODE_EXPIRED,
      );
    }
  }
}
