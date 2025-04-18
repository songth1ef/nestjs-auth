import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { I18nService } from 'nestjs-i18n';
import { EmailTemplateService } from './services/email-template.service';

// 使用更明确的类型定义
type NodemailerTransporter = ReturnType<typeof nodemailer.createTransport>;

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: NodemailerTransporter | null = null;

  constructor(
    private configService: ConfigService,
    private emailTemplateService: EmailTemplateService,
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
      if (this.transporter) {
        this.transporter.verify((error: Error | null) => {
          if (error) {
            this.logger.error(`邮件服务器连接验证失败: ${error.message}`);
          }
        });
      }
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

      // 使用模板服务生成邮件内容
      const emailContent = this.emailTemplateService.generatePasswordResetEmail(
        code,
        lang,
      );

      // 设置邮件选项
      const mailOptions: Mail.Options = {
        from: fromName ? `"${fromName}" <${from}>` : from,
        to: email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      };

      if (this.transporter) {
        await this.transporter.sendMail(mailOptions);
      }
      return true;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`邮件发送失败: ${err.message}`, err.stack);
      return false;
    }
  }

  private translate(
    key: string,
    lang: string,
    args: Record<string, any> = {},
  ): string {
    try {
      if (this.i18n) {
        return this.i18n.translate(key, { lang, args }) || key;
      }
    } catch (err) {
      this.logger.warn(`翻译失败: ${key}, ${lang}`, err);
    }

    // 默认情况下返回键名
    return key;
  }
}
