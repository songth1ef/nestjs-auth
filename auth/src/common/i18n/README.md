# NestJS 多语言国际化实现指南

## 安装依赖

```bash
npm install nestjs-i18n i18n-iso-countries
```

## 项目结构

```
src/
├── common/
│   ├── i18n/
│   │   ├── en/            # 英文翻译
│   │   │   ├── auth.json  # 认证相关翻译
│   │   │   ├── user.json  # 用户相关翻译
│   │   │   └── error.json # 错误消息翻译
│   │   ├── zh/            # 中文翻译
│   │   │   ├── auth.json  # 认证相关翻译
│   │   │   ├── user.json  # 用户相关翻译
│   │   │   └── error.json # 错误消息翻译
│   │   └── index.ts       # i18n模块配置
```

## 配置实现

### 1. 创建翻译文件

**英文 (en/auth.json)**:
```json
{
  "login": {
    "success": "Login successful",
    "failed": "Login failed",
    "invalidCredentials": "Invalid username or password"
  },
  "register": {
    "success": "Registration successful",
    "failed": "Registration failed",
    "userExists": "Username or email already exists"
  },
  "password": {
    "requirements": "Password must be at least {length} characters and contain uppercase, lowercase, digit and special characters"
  }
}
```

**中文 (zh/auth.json)**:
```json
{
  "login": {
    "success": "登录成功",
    "failed": "登录失败",
    "invalidCredentials": "用户名或密码错误"
  },
  "register": {
    "success": "注册成功",
    "failed": "注册失败",
    "userExists": "用户名或邮箱已存在"
  },
  "password": {
    "requirements": "密码必须至少{length}位，且包含大小写字母、数字和特殊字符"
  }
}
```

### 2. 配置I18nModule

```typescript
// src/common/i18n/index.ts
import { Module } from '@nestjs/common';
import { I18nModule } from 'nestjs-i18n';
import { join } from 'path';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'zh',
      loaderOptions: {
        path: join(__dirname, '/'),
        watch: true,
      },
    }),
  ],
  exports: [I18nModule],
})
export class I18nConfigModule {}
```

### 3. 在AppModule中导入

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { I18nConfigModule } from './common/i18n';

@Module({
  imports: [
    I18nConfigModule,
    // ...其他模块
  ],
})
export class AppModule {}
```

### 4. 创建响应拦截器

```typescript
// src/common/interceptors/i18n-response.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { I18nService } from 'nestjs-i18n';
import { Request } from 'express';

@Injectable()
export class I18nResponseInterceptor implements NestInterceptor {
  constructor(private readonly i18n: I18nService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const lang = request.headers['accept-language']?.split(',')[0] || 'zh';
    
    return next.handle().pipe(
      map(data => {
        // 如果响应中包含消息键，则翻译该消息
        if (data && data.messageKey) {
          const { messageKey, args = {} } = data;
          data.message = this.i18n.translate(messageKey, { lang, args });
          delete data.messageKey;
        }
        return data;
      }),
    );
  }
}
```

### 5. 在控制器中使用

```typescript
// src/auth/auth.controller.ts
import { Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { I18nResponseInterceptor } from '../common/interceptors/i18n-response.interceptor';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('auth')
@UseInterceptors(I18nResponseInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @I18n() i18n: I18nContext) {
    const result = await this.authService.login(loginDto);
    
    if (result) {
      return {
        code: 200,
        data: result,
        messageKey: 'auth.login.success',
        success: true,
        timestamp: Date.now(),
      };
    } else {
      return {
        code: 401,
        data: null,
        messageKey: 'auth.login.invalidCredentials',
        success: false,
        timestamp: Date.now(),
      };
    }
  }
}
```

### 6. 在异常过滤器中使用

```typescript
// src/common/filters/i18n-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';

@Catch(HttpException)
export class I18nExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;
    
    const lang = request.headers['accept-language']?.split(',')[0] || 'zh';
    
    let message = exceptionResponse.message;
    
    // 检查是否是i18n消息键
    if (typeof message === 'string' && message.includes('.')) {
      try {
        const hasTranslation = await this.i18n.translate(message, { lang });
        if (hasTranslation !== message) {
          message = hasTranslation;
        }
      } catch (e) {
        // 不是有效的i18n键，保持原消息
      }
    }
    
    response.status(status).json({
      code: status,
      data: null,
      message,
      success: false,
      timestamp: Date.now(),
    });
  }
}
```

### 7. 在验证管道中使用

```typescript
// src/common/pipes/i18n-validation.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class I18nValidationPipe implements PipeTransform {
  constructor(private readonly i18n: I18nService) {}

  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    
    if (errors.length > 0) {
      const firstError = errors[0];
      const constraint = Object.values(firstError.constraints)[0];
      
      // 检查是否使用i18n键
      if (constraint.includes('i18n.')) {
        const key = constraint.replace('i18n.', '');
        const lang = 'zh'; // 从请求中获取或使用默认值
        const message = await this.i18n.translate(key, { lang });
        throw new BadRequestException(message);
      }
      
      throw new BadRequestException(constraint);
    }
    
    return value;
  }

  private toValidate(metatype: any): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

## 实际使用

### 语言检测逻辑

1. 从HTTP请求头`Accept-Language`中获取语言偏好
2. 支持URL查询参数，例如 `?lang=en`
3. 支持Cookie存储语言偏好
4. 默认使用中文（zh）

### 动态切换语言

在前端可以通过设置`Accept-Language`头或发送`?lang=zh`查询参数来动态切换语言。

### 集成到统一响应格式

在统一响应拦截器中结合国际化功能：

```typescript
// 修改之前的ResponseInterceptor
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private readonly i18n: I18nService) {}
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const now = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const statusCode = context.switchToHttp().getResponse().statusCode;
    const lang = request.headers['accept-language']?.split(',')[0] || 'zh';
    
    return next.handle().pipe(
      map(data => {
        // ...其他响应处理逻辑
        
        // 处理i18n消息键
        if (data && data.messageKey) {
          response.message = this.i18n.translate(data.messageKey, { 
            lang, 
            args: data.messageArgs || {} 
          });
          delete data.messageKey;
          delete data.messageArgs;
        } else {
          response.message = this.getSuccessMessage(request.method, lang);
        }
        
        return response;
      }),
    );
  }
  
  private getSuccessMessage(method: string, lang: string): string {
    const key = `common.${method.toLowerCase()}`;
    try {
      return this.i18n.translate(key, { lang });
    } catch (e) {
      // 默认消息
      return method === 'GET' ? '获取成功' : '操作成功';
    }
  }
}
```

## 最佳实践

1. **使用命名空间**：将翻译文件按功能模块划分，如`auth.login.success`
2. **使用参数**：支持插值变量，如`密码必须至少{length}位`
3. **集成验证消息**：将class-validator验证消息也国际化
4. **缓存翻译**：对频繁使用的翻译进行缓存
5. **懒加载**：按需加载语言包，减少初始加载时间

## 测试

多语言功能可以通过以下方式测试：

```typescript
// src/common/i18n/i18n.spec.ts
import { Test } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { I18nConfigModule } from './index';

describe('I18n Module', () => {
  let i18nService: I18nService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [I18nConfigModule],
    }).compile();

    i18nService = moduleRef.get<I18nService>(I18nService);
  });

  it('should translate to Chinese by default', async () => {
    const translation = await i18nService.translate('auth.login.success', {
      lang: 'zh',
    });
    expect(translation).toBe('登录成功');
  });

  it('should translate to English when specified', async () => {
    const translation = await i18nService.translate('auth.login.success', {
      lang: 'en',
    });
    expect(translation).toBe('Login successful');
  });

  it('should handle interpolation', async () => {
    const translation = await i18nService.translate('auth.password.requirements', {
      lang: 'zh',
      args: { length: 8 },
    });
    expect(translation).toBe('密码必须至少8位，且包含大小写字母、数字和特殊字符');
  });
}); 