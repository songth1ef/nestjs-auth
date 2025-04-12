import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { join } from 'path';
import { Public } from './auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';

@ApiTags('pages')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiExcludeEndpoint()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('login')
  @Public()
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: '登录页面', description: '提供登录界面的HTML页面' })
  getLoginPage(@Res() res: Response) {
    const filePath = join(process.cwd(), 'public', 'login.html');
    console.log('尝试加载文件:', filePath);
    return res.sendFile(filePath, (err) => {
      if (err) {
        console.error('发送文件时出错:', err);
        res.status(500).send('无法加载登录页面');
      }
    });
  }

  @Get('register')
  @Public()
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: '注册页面', description: '提供注册界面的HTML页面' })
  getRegisterPage(@Res() res: Response) {
    const filePath = join(process.cwd(), 'public', 'register.html');
    console.log('尝试加载文件:', filePath);
    return res.sendFile(filePath, (err) => {
      if (err) {
        console.error('发送文件时出错:', err);
        res.status(500).send('无法加载注册页面');
      }
    });
  }
}
