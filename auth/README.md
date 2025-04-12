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
   - [ ] 密码重置
   - [x] 账户锁定/解锁
   - [ ] 用户资料管理
   - [ ] 登录设备管理
   - [ ] 活跃会话查看与终止

### 安全特性

1. **访问控制**：
   - [x] 基于角色的访问控制 (RBAC)
   - [ ] 细粒度权限系统
   - [ ] API 权限策略
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

## 许可证

MIT
