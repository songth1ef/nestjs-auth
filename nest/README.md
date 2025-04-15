# NestJS 认证服务详细文档

## 项目介绍

本项目是一个基于 NestJS 框架构建的完整认证系统，提供高安全性、高性能的身份认证和授权服务。该系统可作为独立的认证中心，也可以集成到其他应用中使用。

## 系统架构

### 后端架构
- **框架**：NestJS 最新稳定版 (10.x)
- **语言**：TypeScript
- **数据库**：PostgreSQL + TypeORM
- **缓存**：Redis
- **认证方式**：JWT + Session 双重支持
- **运行环境**：Node.js v20+ (LTS)
- **安全加固**：Helmet, 数据加密, 依赖扫描
- **密钥管理**：自动密钥轮换系统

### 前端架构
- **框架**：Next.js 15
- **UI 库**：Tailwind CSS
- **状态管理**：React
- **安全措施**：CSP, SRI, 输入验证

## 详细配置

### 环境配置
```env
# 服务器配置
PORT=8101
NODE_ENV=development

# JWT配置
JWT_SYMMETRIC_ENCRYPTION=true  # 控制是否使用对称加密
JWT_SECRET_KEY=dev_jwt_secret_key_please_change_in_production
JWT_PUBLIC_KEY=path/to/public.key  # 非对称加密时使用
JWT_PRIVATE_KEY=path/to/private.key  # 非对称加密时使用
JWT_EXPIRATION_TIME=60m
JWT_REFRESH_EXPIRATION=7d
JWT_ALGORITHM=RS256  # 使用的JWT算法
JWT_AUDIENCE=your-service-name  # JWT受众
JWT_ISSUER=your-auth-server-name  # JWT颁发者

# Session配置
SESSION_SECRET=dev_session_secret_key_please_change_in_production
SESSION_EXPIRY=30m
SESSION_SECURE=false  # 生产环境设为true
SESSION_HTTP_ONLY=true  # 阻止JavaScript访问cookie
SESSION_SAME_SITE=lax  # strict, lax, none
SESSION_COOKIE_PATH=/
SESSION_DOMAIN=localhost  # 生产环境修改为自己的域名

# 数据库配置
DB_TYPE=postgres  # 支持 postgres, mysql, sqlite
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=auth_service
DB_SYNC=true  # 生产环境设为false
DB_LOGGING=true  # 生产环境设为false
DB_MIGRATIONS_RUN=true
DB_SSL=false  # 生产环境建议开启
DB_ENCRYPTION=false  # 数据加密开关

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TTL=86400
REDIS_TLS=false  # 生产环境建议开启
REDIS_SENTINEL_ENABLED=false  # Redis哨兵模式

# 速率限制配置
RATE_LIMIT_WINDOW_MS=900000  # 15分钟
RATE_LIMIT_MAX=100
LOGIN_RATE_LIMIT_WINDOW_MS=3600000  # 1小时
LOGIN_RATE_LIMIT_MAX=10
IP_RATE_LIMIT_ENABLED=true  # IP级别的限制

# 安全配置
ENABLE_2FA=false  # 生产环境建议开启
PASSWORD_SALT_ROUNDS=10
MIN_PASSWORD_LENGTH=12  # 提高到12位
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SYMBOLS=true
PASSWORD_MAX_AGE_DAYS=90  # 密码过期时间
PASSWORD_HISTORY_COUNT=5  # 记住历史密码数量
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCKOUT_TIME=15m
ACCOUNT_IDLE_LOCK_DAYS=90  # 闲置账户锁定天数
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
HELMET_ENABLED=true  # 启用Helmet安全头
STRICT_TRANSPORT_SECURITY=true  # HSTS设置
XSS_PROTECTION=true  # XSS防护
CONTENT_TYPE_OPTIONS=true  # 防止MIME类型嗅探
FRAME_OPTIONS=DENY  # 防止点击劫持

# 加密与证书
DATA_ENCRYPTION_KEY=your_data_encryption_key  # 敏感数据加密密钥
SSL_KEY_PATH=/path/to/ssl.key  # SSL证书路径
SSL_CERT_PATH=/path/to/ssl.cert  # SSL证书路径
HTTPS_ENABLED=false  # 是否启用HTTPS

# OAuth配置
OAUTH_GOOGLE_ENABLED=false
OAUTH_GOOGLE_CLIENT_ID=your_google_client_id
OAUTH_GOOGLE_CLIENT_SECRET=your_google_client_secret
OAUTH_GOOGLE_CALLBACK_URL=http://localhost:8101/auth/google/callback

OAUTH_GITHUB_ENABLED=false
OAUTH_GITHUB_CLIENT_ID=your_github_client_id
OAUTH_GITHUB_CLIENT_SECRET=your_github_client_secret
OAUTH_GITHUB_CALLBACK_URL=http://localhost:8101/auth/github/callback

# SMTP配置（用于邮件通知）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false  # 生产环境建议为true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
SMTP_FROM=noreply@yourdomain.com
SMTP_FROM_NAME=Auth Service
EMAIL_TEMPLATES_DIR=./templates/email  # 邮件模板路径

# 日志配置
LOG_FORMAT=dev  # dev, combined, json
LOG_LEVEL=info  # error, warn, info, http, verbose, debug, silly
LOG_DIR=./logs
LOG_MAX_FILES=5
LOG_MAX_SIZE=10m
LOG_CONSOLE_ENABLED=true
LOG_ROTATION_ENABLED=true
SECURITY_EVENTS_LOG=true  # 安全事件专用日志
AUDIT_LOG_ENABLED=true  # 审计日志
```

## 性能指标

### 认证性能
- JWT 签名验证：< 5ms
- 用户认证：< 50ms
- 令牌刷新：< 30ms
- 并发处理：支持 1000+ QPS

### 密钥轮换性能
- 密钥生成：< 100ms
- 密钥切换：< 10ms
- 密钥验证：< 5ms
- 密钥存储：< 20ms

### 数据库性能
- 查询响应：< 20ms
- 写入响应：< 30ms
- 连接池：100 连接
- 事务处理：< 50ms

### 缓存性能
- Redis 读取：< 5ms
- Redis 写入：< 10ms
- 缓存命中率：> 95%

### 密钥轮换系统

#### 功能特点
- [x] 自动密钥生成
- [x] 定时密钥轮换
- [x] 平滑过渡机制
- [x] 密钥备份恢复
- [x] 密钥过期管理
- [x] 多环境支持

#### 轮换策略
- 生产环境：30天轮换一次
- 开发环境：90天轮换一次
- 提前5分钟生成新密钥
- 支持密钥回滚
- 密钥版本控制

#### 安全特性
- RSA 2048位加密
- 密钥文件加密存储
- 访问权限控制
- 密钥使用审计
- 异常监控告警

## 功能清单

### 用户认证功能

1. **基础认证**：
   - [x] 用户名/密码登录
   - [x] 电子邮件/密码登录
   - [ ] 手机号码/验证码登录
   - [x] 记住登录状态
   - [x] 退出登录
   - [x] 自动会话续期

2. **多种登录方式**：
   - [ ] OAuth 2.0 社交登录 (Google, GitHub, Facebook)
   - [ ] SAML/SSO 集成
   - [ ] 企业 LDAP/AD 集成
   - [ ] 生物识别认证接口

3. **多重身份验证 (MFA)**：
   - [ ] TOTP (基于时间的一次性密码)
   - [ ] 手机短信验证码
   - [ ] 电子邮件验证码
   - [ ] 硬件密钥支持 (WebAuthn)
   - [ ] FIDO2 兼容设备支持
   - [ ] 备用验证码列表

4. **账户管理**：
   - [x] 用户注册
   - [ ] 邮箱验证
   - [x] 密码重置
   - [x] 账户锁定/解锁
   - [x] 用户资料管理
   - [ ] 登录设备管理
   - [ ] 活跃会话查看与终止

### 安全特性

1. **访问控制**：
   - [x] 基于角色的访问控制 (RBAC)
   - [ ] 细粒度权限系统
   - [x] API 权限策略
   - [x] 会话超时控制
   - [ ] 特权账户保护
   - [ ] 最小权限原则实施
   - [ ] 动态权限调整

2. **防护措施**：
   - [x] 速率限制 (Rate Limiting)
   - [ ] CSRF 保护
   - [x] XSS 防护
   - [x] SQL 注入防护
   - [x] 暴力破解防护
   - [x] 会话劫持防护
   - [ ] IP 黑名单
   - [ ] 地理位置异常检测
   - [ ] 设备指纹验证
   - [ ] 用户行为分析

3. **密码策略**：
   - [x] 强密码要求
   - [ ] 密码历史记录
   - [ ] 密码定期更换
   - [x] 密码强度评估
   - [ ] 密码泄露检测 (HIBP 集成)
   - [ ] 渐进式密码哈希升级
   - [ ] 多层密码保护

4. **审计与监控**：
   - [x] 登录尝试记录
   - [ ] 账户活动日志
   - [ ] 异常行为检测
   - [ ] 安全事件实时告警
   - [ ] 管理员操作审计
   - [ ] 合规性报告生成
   - [ ] SIEM 系统集成
   - [ ] 实时安全控制台

### 高级安全功能

1. **数据安全**：
   - [x] 静态数据加密
   - [x] 传输中数据加密
   - [ ] 敏感信息脱敏
   - [ ] 数据库字段级加密
   - [ ] 个人身份信息(PII)保护
   - [ ] 符合 GDPR 数据保护需求
   - [ ] 数据访问审计日志

2. **防攻击措施**：
   - [ ] 分布式拒绝服务(DDoS)防护
   - [ ] DNS 重绑定攻击防护
   - [ ] HTTP 参数污染防护
   - [ ] 请求走私防护
   - [ ] 服务器端请求伪造(SSRF)防护
   - [ ] 依赖项漏洞自动扫描
   - [ ] WAF 集成支持

3. **高级认证安全**：
   - [x] 持续认证
   - [ ] 自适应认证逻辑
   - [ ] 风险评分登录
   - [ ] 可疑活动验证挑战
   - [ ] 会话保险箱
   - [ ] 特权会话录制
   - [ ] 零信任架构支持

4. **合规性支持**：
   - [ ] SOC 2 合规性
   - [ ] HIPAA 合规性
   - [ ] PCI DSS 合规性
   - [ ] GDPR 合规性
   - [ ] CCPA 合规性
   - [ ] 合规性控制面板
   - [ ] 自定义合规性规则

### API 与集成

1. **认证 API**：
   - [x] RESTful 身份认证端点
   - [ ] GraphQL 支持
   - [x] 令牌管理
   - [x] 刷新令牌机制
   - [x] 会话管理
   - [x] API 密钥轮换
   - [ ] OAuth 2.1 支持
   - [x] JWT 签名验证 API

2. **用户管理 API**：
   - [x] 用户 CRUD 操作
   - [x] 角色与权限管理
   - [x] 用户分页查询
   - [x] 用户搜索功能
   - [x] 用户语言偏好设置
   - [ ] 组织结构管理
   - [ ] 批量用户导入/导出
   - [ ] 用户合并操作
   - [ ] 自定义身份提供商集成

3. **集成功能**：
   - [ ] 第三方系统对接
   - [ ] Webhook 支持
   - [ ] API 密钥管理
   - [ ] SDK 支持
   - [ ] 身份联合
   - [ ] 事件流
   - [ ] 自定义身份验证流程

4. **API 文档**：
   - [x] Swagger/OpenAPI 集成
   - [x] 交互式 API 测试工具
   - [x] 示例请求与响应
   - [x] 权限标记
   - [ ] 版本控制

### 前端功能

1. **用户界面**：
   - [x] 响应式登录页面
   - [x] 注册页面
   - [x] 用户语言偏好设置页面
   - [ ] 密码找回流程
   - [ ] 用户个人中心
   - [ ] 账户安全设置
   - [ ] 安全健康度评分
   - [ ] 多设备活动状态页面

2. **管理界面**：
   - [ ] 用户管理面板
   - [ ] 角色权限管理
   - [ ] 安全设置管理
   - [ ] 日志查看与分析
   - [ ] 系统状态监控
   - [ ] 安全事件响应控制台
   - [ ] 威胁情报仪表板

### 开发与部署

1. **开发特性**：
   - [x] 模块化架构
   - [ ] 完整的单元测试
   - [ ] 端到端测试
   - [x] 详细 API 文档
   - [x] 示例代码
   - [x] 安全编码准则
   - [ ] 漏洞测试工具集成

2. **部署选项**：
   - [ ] Docker 容器化
   - [ ] Kubernetes 支持
   - [ ] CI/CD 配置
   - [x] 多环境部署
   - [ ] 监控与日志集成
   - [ ] 蓝绿部署支持
   - [ ] 自动安全扫描
   - [ ] 灾难恢复计划

### 安全治理

1. **安全策略管理**：
   - [x] 集中化安全策略配置
   - [x] 基于环境的策略适配
   - [ ] 安全模板管理
   - [ ] 安全配置版本控制
   - [ ] 策略合规性检查

2. **威胁情报**：
   - [ ] 已知威胁检测
   - [ ] 威胁情报订阅
   - [ ] IP 信誉服务集成
   - [ ] 恶意行为识别
   - [ ] 安全情报共享

3. **响应与恢复**：
   - [ ] 安全事件响应流程
   - [ ] 自动化隔离措施
   - [ ] 取证数据收集
   - [ ] 事后分析工具
   - [ ] 业务连续性计划

## API 文档

启动服务后访问：`http://localhost:8101/api/docs`

### 主要接口
- POST `/auth/register` - 用户注册
- POST `/auth/login` - 用户登录
- POST `/auth/refresh` - 刷新令牌
- GET `/auth/profile` - 获取用户信息

## 开发指南

### 目录结构
```
src/
├── auth/           # 认证模块
├── users/          # 用户模块
├── config/         # 配置文件
└── public/         # 静态文件
```

### 常用命令
```bash
# 生成新模块
nest g module module-name

# 生成新控制器
nest g controller controller-name

# 生成新服务
nest g service service-name
```

## 安全说明

### JWT 密钥管理
- 密钥文件存储在 `keys` 目录
- 支持自动密钥轮换
- 可配置使用对称或非对称加密

### 密码安全要求
- 最小长度：12 位
- 必须包含大小写字母
- 必须包含数字
- 必须包含特殊字符

### API 安全措施
- CORS 保护
- 请求速率限制
- 输入验证和清理

## 更新日志

### v0.1.0 (2025-04-12)
- 初始版本发布
- 实现基础认证功能：
  - 用户注册
  - 用户名/密码登录
  - JWT令牌生成与验证
  - 令牌刷新机制
- 实现安全特性：
  - 密码加密存储
  - 登录尝试限制
  - 账户锁定机制
  - 基于角色的访问控制
- 配置系统：
  - 开发环境配置
  - 生产环境配置
  - 环境变量加载
- API文档：
  - Swagger集成
  - API端点文档
  - 请求/响应示例

### v0.2.0 (最新)
- 实现API路径前缀配置
  - 所有API接口添加`/api`前缀
  - 前端页面保持原有路径不变
- 实现前端页面
  - 响应式登录页面
  - 注册页面
  - 用户语言偏好设置页面
- 实现国际化支持
  - 添加用户语言偏好设置
  - 支持中英文切换
- 安全性改进
  - 优化认证流程
  - 增强前端表单验证

### v0.3.0 (最新)
- 添加基于角色的用户管理功能
  - [x] 用户列表分页查询
  - [x] 按用户名和邮箱搜索
  - [x] 管理员权限控制
- 实现用户语言偏好
  - [x] 添加用户语言偏好设置
  - [x] 支持中英文切换
  - [x] 语言偏好持久化存储
- 安全性改进
  - [x] 密钥管理服务完善
  - [x] 优化认证流程
  - [x] 修复安全漏洞

## Swagger 集成指南

### 安装依赖

```bash
npm install @nestjs/swagger swagger-ui-express
```

### 配置 Swagger

在 `main.ts` 文件中添加以下代码：

```typescript
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle("NestJS Auth API")
    .setDescription("认证系统 API 文档")
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("auth", "认证相关接口")
    .addTag("users", "用户管理接口")
    .addTag("roles", "角色权限接口")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT || 8101);
}
bootstrap();
```

### 使用装饰器增强 API 文档

在控制器和 DTO 中使用 Swagger 装饰器:

```typescript
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiProperty,
} from "@nestjs/swagger";

// DTO 示例
export class CreateUserDto {
  @ApiProperty({ example: "john.doe", description: "用户名" })
  username: string;

  @ApiProperty({ example: "john@example.com", description: "电子邮件" })
  email: string;

  @ApiProperty({ example: "StrongPassword123!", description: "密码" })
  password: string;
}

// 控制器示例
@ApiTags("users")
@Controller("users")
export class UsersController {
  @Post()
  @ApiOperation({ summary: "创建新用户" })
  @ApiResponse({ status: 201, description: "用户创建成功" })
  @ApiResponse({ status: 400, description: "无效的请求参数" })
  async create(@Body() createUserDto: CreateUserDto) {
    // 实现创建用户的逻辑
  }
}
```

### 分组和版本控制

```typescript
// 创建多个文档实例用于 API 版本管理
const v1Options = new DocumentBuilder()
  .setTitle("API v1")
  .setDescription("Version 1 of the API")
  .setVersion("1.0")
  .addBearerAuth()
  .build();

const v1Document = SwaggerModule.createDocument(app, v1Options, {
  include: [UsersV1Module, AuthV1Module],
});

SwaggerModule.setup("api/v1/docs", app, v1Document);
```

## 许可证

MIT
