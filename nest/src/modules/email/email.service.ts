import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { I18nService } from 'nestjs-i18n';

// 使用any类型临时绕过nodemailer类型问题
// 生产环境应考虑更精确的类型定义
type NodemailerTransporter = any;

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: NodemailerTransporter | null = null;

  constructor(
    private configService: ConfigService,
    @Optional() private readonly i18n?: I18nService,
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    try {
      const host =
        this.configService.get<string>('email.host') ||
        this.configService.get<string>('SMTP_HOST');
      const port =
        this.configService.get<number>('email.port') ||
        this.configService.get<number>('SMTP_PORT');
      const secure =
        this.configService.get<boolean>('email.secure') ||
        this.configService.get<boolean>('SMTP_SECURE') ||
        false;
      const user =
        this.configService.get<string>('email.user') ||
        this.configService.get<string>('SMTP_USER');
      const pass =
        this.configService.get<string>('email.pass') ||
        this.configService.get<string>('SMTP_PASS');

      if (!host || !port || !user || !pass) {
        this.logger.warn(
          `邮件服务配置不完整: host=${host}, port=${port}, user=${user}, pass=${!!pass}`,
        );
        return;
      }

      const config = {
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      } as SMTPTransport.Options;

      this.transporter = nodemailer.createTransport(config);
      this.transporter.verify((error: Error | null) => {
        if (error) {
          this.logger.error(`邮件服务器连接验证失败: ${error.message}`);
        }
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`邮件发送器初始化失败: ${err.message}`, err.stack);
    }
  }

  async sendVerificationCode(
    email: string,
    code: string,
    lang = 'zh',
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.initializeTransporter();
        if (!this.transporter) {
          return false;
        }
      }

      const from =
        this.configService.get<string>('email.from') ||
        this.configService.get<string>('SMTP_FROM') ||
        this.configService.get<string>('email.user') ||
        this.configService.get<string>('SMTP_USER') ||
        '';

      const fromName =
        this.configService.get<string>('email.fromName') ||
        this.configService.get<string>('SMTP_FROM_NAME') ||
        '';

      const appName =
        this.configService.get<string>('app.name') ||
        this.configService.get<string>('APP_NAME') ||
        this.translate('email.common.systemName', lang);

      // 直接构建邮件主题，不使用翻译
      const subject =
        lang === 'zh'
          ? `${code}是你的验证码 - ${appName}`
          : `${code} is your verification code - ${appName}`;

      // 直接构建邮件HTML内容
      const mailOptions: Mail.Options = {
        from: fromName ? `"${fromName}" <${from}>` : from,
        to: email,
        subject,
        text: this.generateResetPasswordText(code, lang, appName),
        html: this.generateResetPasswordHtml(code, lang, appName),
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`邮件发送失败: ${err.message}`, err.stack);
      return false;
    }
  }

  /**
   * 生成密码重置邮件的纯文本内容
   */
  private generateResetPasswordText(
    code: string,
    lang: string,
    appName: string,
  ): string {
    if (lang === 'zh') {
      return `${code} 是你的验证码

您好，

您正在请求重置密码。请使用上面的验证码完成密码重置流程。
此验证码将在5分钟内有效。

如果您没有请求重置密码，请忽略此邮件。

谢谢，
${appName} 团队`;
    } else {
      return `${code} is your verification code

Hello,

You have requested to reset your password. Please use the code above to complete the password reset process.
This verification code will be valid for 5 minutes.

If you did not request a password reset, please ignore this email.

Thank you,
${appName} Team`;
    }
  }

  /**
   * 生成密码重置邮件的HTML内容
   * 不使用i18n翻译，直接硬编码内容以确保正确显示
   */
  private generateResetPasswordHtml(
    code: string,
    lang: string,
    appName: string,
  ): string {
    if (lang === 'zh') {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">密码重置</h2>
          <p><strong>${code} 是你的验证码</strong></p>
          <p>您好，</p>
          <p>您正在请求重置密码。请使用上面的验证码完成密码重置流程：</p>
          <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>此验证码将在5分钟内有效。</p>
          <p>如果您没有请求重置密码，请忽略此邮件。</p>
          <p>谢谢，</p>
          <p>${appName} 团队</p>
        </div>
      `;
    } else {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Password Reset</h2>
          <p><strong>${code} is your verification code</strong></p>
          <p>Hello,</p>
          <p>You have requested to reset your password. Please use the code above to complete the password reset process:</p>
          <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>This verification code will be valid for 5 minutes.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
          <p>Thank you,</p>
          <p>${appName} Team</p>
        </div>
      `;
    }
  }

  /**
   * 翻译指定的键值
   * 使用项目的i18n服务，如果不可用则返回键名
   */
  private translate(
    key: string,
    lang: string,
    args: Record<string, any> = {},
  ): string {
    if (!this.i18n) {
      return key;
    }

    try {
      return this.i18n.translate(key, { lang, args });
    } catch {
      return key;
    }
  }
}
