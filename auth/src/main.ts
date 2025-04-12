import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { join } from 'path';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpAdapterHost } from '@nestjs/core';
import {
  ResponseDto,
  PaginatedResponseDto,
  ErrorResponseDto,
} from './common/dto/response.dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const httpAdapterHost = app.get(HttpAdapterHost);

  // 设置全局API前缀
  app.setGlobalPrefix('api', {
    exclude: [
      { path: '', method: RequestMethod.GET },
      { path: 'login', method: RequestMethod.GET },
      { path: 'register', method: RequestMethod.GET },
      { path: 'public/(.*)', method: RequestMethod.GET },
    ],
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 全局响应拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 全局异常过滤器
  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapterHost),
    new HttpExceptionFilter(),
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

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [ResponseDto, PaginatedResponseDto, ErrorResponseDto],
  });

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'list',
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
