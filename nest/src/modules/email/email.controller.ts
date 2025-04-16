import { Body, Controller, Inject, Post } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EmailService } from './email.service';
import { SendVerificationCodeDto } from './dto/send-verification-code.dto';

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post('verification-code')
  async sendVerificationCode(@Body() dto: SendVerificationCodeDto) {
    // 生成6位数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 将验证码存储在缓存中，有效期10分钟
    await this.cacheManager.set(`verification_code:${dto.email}`, code, 600000);

    // 发送验证码
    const success = await this.emailService.sendVerificationCode(
      dto.email,
      code,
    );

    if (success) {
      return {
        success: true,
        message: '验证码已发送，请检查您的邮箱',
      };
    } else {
      return {
        success: false,
        message: '验证码发送失败，请稍后重试',
      };
    }
  }
}
