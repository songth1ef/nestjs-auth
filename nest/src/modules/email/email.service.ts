import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    try {
      const host = this.configService.get<string>('SMTP_HOST');
      const port = this.configService.get<number>('SMTP_PORT');
      const secure = this.configService.get<boolean>('SMTP_SECURE') || false;
      const user = this.configService.get<string>('SMTP_USER');
      const pass = this.configService.get<string>('SMTP_PASS');

      if (!host || !port || !user || !pass) {
        this.logger.warn('邮件服务配置不完整，无法初始化邮件发送器');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });

      this.logger.log('邮件发送器初始化成功');
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`邮件发送器初始化失败: ${err.message}`, err.stack);
    }
  }

  async sendVerificationCode(email: string, code: string): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.logger.error('邮件发送器未初始化');
        return false;
      }

      const from =
        this.configService.get<string>('SMTP_FROM') ||
        this.configService.get<string>('SMTP_USER');

      const appName =
        this.configService.get<string>('APP_NAME') || '友定开放平台';

      const mailOptions = {
        from: `"${appName}" <${from}>`,
        to: email,
        subject: `${appName} - 密码重置验证码`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #333;">密码重置</h2>
            <p>您好，</p>
            <p>您正在请求重置密码。请使用以下验证码完成密码重置流程：</p>
            <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${code}
            </div>
            <p>此验证码将在10分钟内有效。</p>
            <p>如果您没有请求重置密码，请忽略此邮件。</p>
            <p>谢谢，</p>
            <p>${appName} 团队</p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`验证码邮件已发送: ${info.messageId}`);
      return true;
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`验证码邮件发送失败: ${err.message}`, err.stack);
      return false;
    }
  }
}
