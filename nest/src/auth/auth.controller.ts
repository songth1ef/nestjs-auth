import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  BadRequestException,
  Inject,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResponseDto } from '../common/dto/response.dto';
import { Public } from './decorators/public.decorator';
import { EmailService } from '../modules/email/email.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { I18nService } from 'nestjs-i18n';
import { Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private readonly emailService: EmailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly i18n: I18nService,
  ) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: '用户注册' })
  @ApiOkResponse({
    description: '注册成功',
    type: ResponseDto,
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return this.authService.login(user);
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: '用户登录' })
  @ApiOkResponse({
    description: '登录成功',
    type: ResponseDto,
  })
  @ApiResponse({ status: 401, description: '用户名/邮箱或密码错误' })
  async login(@Body() loginDto: LoginDto) {
    if (!loginDto.username && !loginDto.email) {
      throw new UnauthorizedException('请提供用户名或邮箱');
    }

    const identifier = loginDto.username || (loginDto.email as string);
    const isEmail = identifier.includes('@');

    const user = await this.authService.validateUser(
      identifier,
      loginDto.password,
      isEmail,
    );

    return this.authService.login(user);
  }

  @Post('refresh')
  @Public()
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiOkResponse({
    description: '刷新成功',
    type: ResponseDto,
  })
  @ApiResponse({ status: 401, description: '无效的刷新令牌' })
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body.refresh_token);
  }

  @Post('forgot-password')
  @Public()
  async forgotPassword(@Body('email') email: string, @Req() req: Request) {
    if (!email) {
      throw new BadRequestException(
        await this.i18n.translate('auth.password.forgot.emailRequired', {
          lang: req.headers['accept-language'] || 'zh',
        }),
      );
    }

    // 生成6位大写字母和数字的组合验证码
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 排除容易混淆的字符如0,1,I,O
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // 将验证码存储在缓存中，有效期5分钟
    await this.cacheManager.set(`verification_code:${email}`, code, 300000);

    // 发送验证码
    const success = await this.emailService.sendVerificationCode(email, code);

    if (success) {
      return {
        success: true,
        message: await this.i18n.translate('auth.password.forgot.codeSent', {
          lang: req.headers['accept-language'] || 'zh',
        }),
      };
    } else {
      return {
        success: false,
        message: await this.i18n.translate(
          'auth.password.forgot.codeSendFailed',
          {
            lang: req.headers['accept-language'] || 'zh',
          },
        ),
      };
    }
  }

  @Post('reset-password')
  @Public()
  async resetPassword(
    @Body('email') email: string,
    @Body('code') code: string,
    @Body('newPassword') newPassword: string,
    @Req() req: Request,
  ) {
    const lang = req.headers['accept-language'] || 'zh';

    if (!email || !code || !newPassword) {
      throw new BadRequestException(
        await this.i18n.translate('auth.password.reset.fieldsRequired', {
          lang,
        }),
      );
    }

    // 从缓存中获取验证码
    const storedCode = await this.cacheManager.get(
      `verification_code:${email}`,
    );

    if (!storedCode) {
      return {
        success: false,
        message: await this.i18n.translate('auth.password.reset.codeExpired', {
          lang,
        }),
      };
    }

    if (storedCode !== code) {
      return {
        success: false,
        message: await this.i18n.translate('auth.password.reset.codeInvalid', {
          lang,
        }),
      };
    }

    // 重置密码
    try {
      await this.usersService.resetPassword(email, newPassword);

      // 删除缓存中的验证码
      await this.cacheManager.del(`verification_code:${email}`);

      return {
        success: true,
        message: await this.i18n.translate('auth.password.reset.success', {
          lang,
        }),
      };
    } catch (error) {
      return {
        success: false,
        message: await this.i18n.translate('auth.password.reset.failed', {
          lang,
          args: {
            message: error instanceof Error ? error.message : String(error),
          },
        }),
      };
    }
  }
}
