# NestJS 认证系统

## 项目概述

一个基于 NestJS 框架构建的完整认证系统，提供高安全性、高性能的身份认证和授权服务。可作为独立的认证中心，也可以集成到其他应用中使用。

## 核心特性

- **完整的认证流程**：用户注册、登录、令牌刷新
- **安全防护**：JWT加密、密码哈希、速率限制
- **密钥管理**：自动密钥轮换系统
- **验证码服务**：支持邮箱验证码、密码重置流程
- **API管理**：支持RESTful API、Swagger文档
- **国际化**：支持多语言
- **响应式前端**：简洁直观的用户界面

## 技术栈

- **后端**：NestJS, TypeScript, PostgreSQL, TypeORM, Redis
- **前端**：HTML, CSS, JavaScript
- **安全**：JWT, Bcrypt, Helmet
- **文档**：Swagger/OpenAPI

## 快速开始

1. 克隆仓库
```bash
git clone https://github.com/songth1ef/nestjs-auth.git
cd nestjs-auth/auth
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
```

4. 启动开发服务器
```bash
npm run start:dev
```

5. 访问应用
```
API: http://localhost:8101/api
Swagger文档: http://localhost:8101/api/docs
登录页面: http://localhost:8101/login
注册页面: http://localhost:8101/register
```

## 最新更新 (v0.6.0)

- 实现邮箱验证码服务 (VerificationService)
- 添加邮件模板系统 (EmailTemplateService)
- 完善错误码体系和统一响应格式
- 支持密码重置功能
- 优化邮件发送服务
- 增强应用异常处理机制

## 详细文档

详细的文档和功能清单请查看 [auth/README.md](auth/README.md)，完整的更新日志请参考 [CHANGELOG.md](auth/CHANGELOG.md)。

## 许可证

MIT
