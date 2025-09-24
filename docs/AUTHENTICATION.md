# 用户认证系统

## 概述

Mini Notepad 现在支持用户认证系统，用户可以注册账户、登录并管理个人笔记。

## 功能特性

### 🔐 用户认证
- **用户注册**：支持邮箱和用户名注册
- **用户登录**：支持邮箱或用户名登录
- **忘记密码**：通过邮件发送重置链接
- **密码重置**：安全的密码重置流程
- **JWT认证**：基于JWT的安全认证机制
- **密码加密**：使用bcrypt进行密码哈希

### 👤 用户管理
- **个人资料**：用户名、显示名、邮箱、头像、个人简介
- **头像系统**：自动生成头像或自定义头像
- **用户统计**：显示创建的笔记数量

### 📝 笔记关联
- **用户笔记**：每个笔记都可以关联到特定用户
- **权限控制**：用户只能管理自己的笔记
- **公开分享**：支持笔记公开分享功能

## 使用方法

### 1. 注册新账户
1. 点击右上角的 "Sign Up" 按钮
2. 填写邮箱、用户名和密码
3. 可选填写显示名称
4. 点击 "Create Account" 完成注册

### 2. 登录账户
1. 点击右上角的 "Login" 按钮
2. 输入邮箱/用户名和密码
3. 点击 "Login" 登录

### 3. 用户头像下拉菜单
登录后，点击右上角的用户头像可以访问：
- **Profile**：查看个人资料（开发中）
- **My Notes**：查看我的笔记（开发中）
- **Settings**：账户设置（开发中）
- **Upgrade to Pro**：升级到专业版（开发中）
- **Log out**：退出登录

## 技术实现

### 后端API
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息

### 数据库模型
```sql
-- 用户表
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "username" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "name" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- 笔记表更新（添加用户关联）
ALTER TABLE "notes" ADD COLUMN "userId" TEXT;
ALTER TABLE "notes" ADD CONSTRAINT "notes_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
```

### 前端组件
- `AuthContext` - 全局认证状态管理
- `AuthDialog` - 登录/注册对话框
- `ForgotPasswordDialog` - 忘记密码对话框
- `UserDropdown` - 用户头像下拉菜单
- `LoginButton` - 登录按钮组件
- `ResetPasswordPage` - 密码重置页面

## 忘记密码功能

### 功能流程
1. **发起重置**：用户在登录页面点击"忘记密码"
2. **输入邮箱**：用户输入注册邮箱地址
3. **生成令牌**：系统生成安全的重置令牌（32字节随机字符串）
4. **发送邮件**：系统发送包含重置链接的邮件
5. **验证令牌**：用户点击链接，系统验证令牌有效性
6. **重置密码**：用户设置新密码，令牌标记为已使用

### 安全措施
- **令牌过期**：重置链接1小时后自动过期
- **一次性使用**：每个令牌只能使用一次
- **邮箱枚举防护**：无论邮箱是否存在都返回成功消息
- **令牌清理**：新请求会清除用户之前的未使用令牌
- **密码强度**：要求新密码至少6位字符

### 邮件配置
使用Resend邮件服务：
- **生产环境**：需要配置RESEND_API_KEY和RESEND_FROM_EMAIL
- **开发模式**：无需配置，会在控制台输出重置链接用于测试
- **简单易用**：Resend提供现代化的API，配置简单可靠

### API端点
- `POST /api/auth/forgot-password`：发送重置邮件
- `GET /api/auth/reset-password?token=xxx`：验证重置令牌
- `POST /api/auth/reset-password`：重置密码

## 安全特性

1. **密码安全**：使用bcrypt进行密码哈希，盐值强度为12
2. **JWT安全**：7天过期时间，HTTP-only Cookie存储
3. **输入验证**：前后端双重验证，防止恶意输入
4. **CSRF防护**：使用SameSite Cookie属性
5. **数据库安全**：用户密码永不返回给前端
6. **重置安全**：令牌过期机制、一次性使用、邮箱枚举防护

## 环境配置

确保在 `.env` 文件中设置以下环境变量：

```bash
# 数据库连接
DATABASE_URL="postgresql://username:password@localhost:5432/notepad"

# JWT密钥（生产环境请使用强密钥）
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# 应用URL（用于密码重置链接）
NEXTAUTH_URL="http://localhost:3000"

# Resend邮件服务配置
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

## Resend邮件服务配置

### 获取Resend API密钥
1. 访问 [Resend官网](https://resend.com) 并注册账户
2. 在控制台中创建API密钥
3. 验证发送域名（或使用Resend提供的测试域名）
4. 将API密钥添加到环境变量中

### 配置步骤
```bash
# 1. 设置API密钥
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"

# 2. 设置发件人邮箱（必须是已验证的域名）
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# 3. 设置应用URL（用于重置链接）
NEXTAUTH_URL="https://yourdomain.com"
```

### 开发环境测试
在开发环境中，如果没有配置RESEND_API_KEY，系统会：
- 在控制台输出邮件内容
- 显示重置链接供测试使用
- 不会发送真实邮件

## 开发计划

### 即将推出的功能
- [ ] 用户个人资料页面
- [ ] 用户设置页面
- [x] 密码重置功能
- [ ] 邮箱验证
- [ ] OAuth登录（Google、GitHub等）
- [ ] 用户笔记管理界面
- [ ] 头像上传功能

### 性能优化
- [ ] 用户会话管理优化
- [ ] 认证状态缓存
- [ ] 批量用户操作

## 故障排除

### 常见问题

**Q: 登录后页面没有反应？**
A: 检查浏览器控制台是否有错误，确保JWT_SECRET环境变量已设置。

**Q: 注册时提示"用户名已存在"？**
A: 用户名和邮箱都必须唯一，请尝试其他用户名或邮箱。

**Q: 头像显示不正常？**
A: 系统会自动生成基于用户名首字母的头像，如果显示异常请刷新页面。

### 开发调试

1. 查看Prisma Studio：`npx prisma studio`
2. 检查数据库连接：确保DATABASE_URL正确
3. 查看服务器日志：检查控制台错误信息

## 贡献指南

如果您想为认证系统做出贡献，请：

1. Fork本项目
2. 创建功能分支：`git checkout -b feature/auth-improvement`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送分支：`git push origin feature/auth-improvement`
5. 创建Pull Request

---

**注意**：这是一个基础的认证系统实现，适合个人项目和小型应用。对于企业级应用，建议使用更成熟的认证解决方案如Auth0、Firebase Auth等。
