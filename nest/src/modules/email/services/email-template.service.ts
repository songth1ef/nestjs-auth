import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  VerificationCodeTemplateData,
  generateVerificationHtml,
  generateVerificationText,
  generateSubject,
} from '../templates/verification-code.template';

/**
 * 邮件模板服务
 * 负责处理邮件模板和内容生成
 */
@Injectable()
export class EmailTemplateService {
  private readonly logger = new Logger(EmailTemplateService.name);
  
  constructor(private readonly configService: ConfigService) {}
  
  /**
   * 生成密码重置验证码邮件
   * @param code 验证码
   * @param lang 语言
   * @returns 邮件内容对象
   */
  generatePasswordResetEmail(code: string, lang: string) {
    try {
      const appName = 
        this.configService.get<string>('app.name') ||
        this.configService.get<string>('APP_NAME') ||
        (lang === 'zh' ? '认证系统' : 'Authentication System');
        
      // 获取验证码有效期
      const expiryMinutes = 
        this.configService.get<number>('VERIFICATION_CODE_EXPIRY_MINUTES') || 10;
        
      const templateData: VerificationCodeTemplateData = {
        code,
        appName,
        expiry: expiryMinutes,
      };
      
      return {
        subject: generateSubject(templateData, lang),
        html: generateVerificationHtml(templateData, lang),
        text: generateVerificationText(templateData, lang),
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`邮件模板生成失败: ${err.message}`, err.stack);
      
      // 如果模板生成失败，提供基本的备用模板
      return {
        subject: `验证码: ${code}`,
        html: `<p>您的验证码是: <strong>${code}</strong></p>`,
        text: `您的验证码是: ${code}`,
      };
    }
  }
} 