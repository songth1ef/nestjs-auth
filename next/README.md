# Next.js 认证系统前端

## 项目概述

这是一个基于 Next.js 15 构建的现代化认证系统前端，与 NestJS 认证服务完美集成。提供优雅的用户界面和流畅的用户体验，支持多语言、主题切换等高级特性。

## 功能清单

### 1. 用户认证 [60%]
- [x] 登录功能
  - [x] 用户名/密码登录
  - [x] 邮箱/密码登录
  - [x] 记住登录状态
  - [x] 登录状态保持
  - [x] 登录错误提示
  - [x] 登录加载状态
  - [x] 登录表单验证
  - [x] 登录令牌存储与管理

- [x] 注册功能
  - [x] 用户注册表单
  - [x] 密码强度验证
  - [ ] 邮箱验证
  - [x] 注册成功提示
  - [x] 注册表单验证
  - [x] 注册加载状态

- [x] 忘记密码
  - [x] 忘记密码表单
  - [ ] 邮箱验证码
  - [ ] 重置密码
  - [x] 重置成功提示

### 2. 用户中心 [60%]
- [x] 个人信息
  - [x] 基本信息展示
  - [ ] 个人信息修改
  - [ ] 头像上传
  - [ ] 个人资料表单验证

- [ ] 安全设置
  - [ ] 密码修改
  - [ ] 邮箱绑定/解绑
  - [ ] 手机号绑定/解绑
  - [ ] 两步验证设置
  - [ ] 安全日志查看

- [x] 用户管理页面
  - [x] 用户列表展示
  - [x] 用户分页（包含首页/末页快速导航）
  - [x] 用户搜索
  - [x] 用户权限控制
  - [x] 用户角色展示
  - [x] 用户状态显示

### 3. 系统功能 [70%]
- [x] 国际化
  - [x] 中文支持
  - [x] 英文支持
  - [x] 语言切换
  - [x] 语言持久化

- [x] 响应式设计
  - [x] 移动端适配
  - [x] 平板适配
  - [x] 桌面端适配
  - [x] 响应式布局

### 4. 安全特性 [75%]
- [x] 表单安全
  - [x] 输入验证
  - [x] 错误提示
  - [x] 密码强度检查
  - [ ] CSRF 防护
  - [ ] XSS 防护

- [x] 数据安全
  - [ ] 请求加密
  - [ ] 敏感信息保护
  - [x] 安全的本地存储
  - [x] 自动登出机制
  - [x] 会话管理
  - [x] JWT认证令牌管理

### 5. 性能优化 [50%]
- [x] 加载优化
  - [x] 代码分割
  - [x] 图片优化
  - [x] 预加载
  - [ ] 懒加载

- [ ] 缓存策略
  - [ ] 静态资源缓存
  - [ ] API 响应缓存
  - [ ] 状态持久化

## 最新更新 (v0.4.0)

### 认证与安全增强
- [x] 实现完整的JWT令牌认证流程
  - [x] 登录时保存令牌到本地存储
  - [x] 所有API请求自动附加认证令牌
  - [x] 令牌失效处理与重定向

### 用户管理功能改进
- [x] 优化用户管理页面
  - [x] 添加首页和末页快速导航按钮
  - [x] 修复嵌套数据结构处理问题
  - [x] 改进分页体验（每页数量变更自动重置页码）
  - [x] 添加错误处理和友好提示
  - [x] 实现权限控制和角色验证

### 数据生成与测试
- [x] 添加批量用户生成脚本
  - [x] Bash脚本支持
  - [x] Node.js脚本支持
  - [x] Python脚本支持

### 多语言支持
- [x] 扩展翻译词条
  - [x] 用户管理页面完整中英文支持
  - [x] 分页组件多语言支持
  - [x] 错误提示多语言支持

## 技术栈

### 核心框架
- Next.js 15
- React 19
- TypeScript 5+

### UI 组件
- Tailwind CSS
- Headless UI
- Radix UI
- Framer Motion

### 状态管理
- React Context
- Zustand
- React Query

### 开发工具
- ESLint
- Prettier
- Husky
- Jest
- Cypress

## 项目结构

```
src/
├── app/                    # Next.js 应用路由
│   ├── (auth)/            # 认证相关页面
│   │   ├── login/         # 登录页面
│   │   ├── register/      # 注册页面
│   │   └── forgot-password/ # 忘记密码页面
│   ├── dashboard/         # 用户中心
│   │   ├── profile/       # 个人资料
│   │   ├── security/      # 安全设置
│   │   └── settings/      # 系统设置
│   └── layout.tsx         # 根布局
├── components/            # 可复用组件
│   ├── auth/             # 认证相关组件
│   ├── common/           # 通用组件
│   ├── forms/            # 表单组件
│   └── layout/           # 布局组件
├── hooks/                # 自定义 Hooks
│   ├── useAuth.ts        # 认证相关 Hook
│   ├── useForm.ts        # 表单处理 Hook
│   └── useTheme.ts       # 主题管理 Hook
├── lib/                  # 工具库
│   ├── api/             # API 客户端
│   ├── auth/            # 认证工具
│   └── utils/           # 通用工具
├── styles/              # 样式文件
│   └── globals.css      # 全局样式
└── types/               # TypeScript 类型定义
    └── index.ts         # 类型声明
```

## 开发环境要求

- Node.js 18+
- npm 9+ 或 yarn 1.22+
- Git

## 快速开始

1. 克隆仓库
```bash
git clone https://github.com/songth1ef/nestjs-auth.git
cd nestjs-auth/next
```

2. 安装依赖
```bash
npm install
# 或
yarn install
```

3. 配置环境变量
```bash
cp .env.example .env
```

4. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

5. 访问应用
```
http://localhost:3000
```

## 开发指南

### 添加新页面
1. 在 `src/app` 目录下创建新的页面目录
2. 创建 `page.tsx` 文件作为页面组件
3. 创建 `layout.tsx` 文件（如果需要）
4. 创建 `loading.tsx` 文件（如果需要）
5. 创建 `error.tsx` 文件（如果需要）

### 添加新组件
1. 在 `src/components` 目录下创建新的组件目录
2. 创建组件文件（`.tsx`）
3. 创建样式文件（`.css` 或 `.module.css`）
4. 创建测试文件（`.test.tsx`）

### 添加新 Hook
1. 在 `src/hooks` 目录下创建新的 Hook 文件
2. 实现 Hook 逻辑
3. 添加类型定义
4. 创建测试文件

## 测试

### 单元测试
```bash
npm run test
# 或
yarn test
```

### E2E 测试
```bash
npm run test:e2e
# 或
yarn test:e2e
```

## 构建与部署

### 构建
```bash
npm run build
```

### 预览
```bash
npm run start
# 或
yarn start
```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

MIT
