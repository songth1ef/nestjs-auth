import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS配置
  app.enableCors({
    origin: configService.get<string>('cors.origins'),
    credentials: true,
  });

  // Swagger配置
  const config = new DocumentBuilder()
    .setTitle('NestJS Auth API')
    .setDescription('认证系统 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', '认证相关接口')
    .addTag('users', '用户管理接口')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // 提供静态文件
  app.use('/public', express.static(join(__dirname, '..', 'public')));

  // 启动应用
  const port = configService.get<number>('port') || 8101;
  await app.listen(port);
  console.log(`应用已启动: http://localhost:${port}`);
  console.log(`Swagger文档: http://localhost:${port}/api/docs`);
}
bootstrap();