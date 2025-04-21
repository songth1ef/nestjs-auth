# NestJS Auth 认证系统

## 项目概述

一个基于 NestJS 框架构建的完整认证系统，提供高安全性、高性能的身份认证和授权服务。可作为独立的认证中心，也可以集成到其他应用中使用。

## 核心功能

- 🔐 用户注册/登录/退出
- 📧 邮箱验证码 与 邮件模板系统
- 🌍 完善的国际化支持 (i18n)
- 🔑 JWT 认证与授权
- 👮 基于角色的访问控制 (RBAC)
- 📱 2FA 双因素认证
- 🔄 刷新令牌机制
- 📊 用户管理与数据分析
- 🚫 错误处理与拦截
- 📝 操作日志记录
- 🔌 OAuth 2.0 客户端注册与授权

## 技术栈

- **后端**: NestJS, TypeORM, PostgreSQL
- **前端**: Next.js, Tailwind CSS, ShadcnUI
- **认证**: JWT, Passport.js, OAuth 2.0
- **缓存**: Redis
- **国际化**: i18n
- **邮件服务**: Nodemailer
- **双因素认证**: Speakeasy
- **部署**: Docker, Docker Compose

## 快速开始

1. 克隆仓库
```bash
git clone https://github.com/songth1ef/nestjs-auth.git
cd nestjs-auth/auth
```

2. 配置环境变量
```bash
cp .env.example .env
```

3. 安装依赖：`yarn install`
4. 启动开发服务器：`yarn start:dev`

5. 访问应用
```
API: http://localhost:8101/api
Swagger文档: http://localhost:8101/api/docs
登录页面: http://localhost:8101/login
注册页面: http://localhost:8101/register
```

## 最新更新

### v0.8.0 - OAuth客户端注册与授权
- 添加OAuth客户端管理功能
- 实现授权码模式认证流程
- 登录接口支持客户端密钥验证
- 支持code exchange获取token机制
- 拓展JWT payload以包含客户端标识
- 添加OAuth国际化支持

### v0.7.0 - 统一响应格式与国际化完善
- 完善响应数据结构，支持前端数据格式需求
- 修复国际化消息问题，保证多语言环境下正确显示信息
- 增强i18n响应拦截器，支持用户语言偏好设置
- 优化分页数据处理机制，提高数据一致性
- 类型定义增强，提升系统健壮性

### v0.6.0 - 邮箱验证服务
- 实现邮箱验证码服务(VerificationService)
- 建立邮件模板系统，支持多语言
- 完善错误码系统和异常处理机制
- 优化缓存键管理和邮件发送服务

## 详细文档

详细的文档和功能清单请查看 [auth/README.md](auth/README.md)，完整的更新日志请参考 [CHANGELOG.md](auth/CHANGELOG.md)。

## 许可证

MIT
