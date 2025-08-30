# Online Notepad - AI 项目上下文

## 变更记录 (Changelog)

- **2025-08-30 08:02:13** - 初始化项目 AI 上下文，完成架构分析和文档生成

## 项目愿景

Online Notepad 是一个基于 Next.js 的在线记事本应用，支持多语言（中英文）、笔记分享功能，使用 PostgreSQL 作为数据存储，采用现代化的 React 技术栈和 Tailwind CSS 样式框架。

## 架构总览

### 技术栈
- **前端框架**: Next.js 15.5.2 (App Router)
- **UI 库**: React 19.1.0 + Tailwind CSS 4.0
- **组件库**: Radix UI + Lucide React
- **数据库**: PostgreSQL + Prisma ORM
- **国际化**: next-intl
- **表单验证**: Zod
- **开发工具**: TypeScript, ESLint

### 架构特点
- 采用 Next.js App Router 架构
- 支持多语言路由 (`/en/`, `/zh/`)
- RESTful API 设计
- 响应式设计，移动端友好
- 数据库迁移和类型安全

## 模块结构图

```mermaid
graph TD
    A["(根) Online Notepad"] --> B["src/app"];
    B --> C["[locale]"];
    C --> D["页面路由"];
    B --> E["api"];
    E --> F["notes"];
    F --> G["share/[token]"];
    A --> H["src/components"];
    H --> I["ui"];
    H --> J["业务组件"];
    A --> K["src/lib"];
    K --> L["工具类"];
    A --> M["prisma"];
    M --> N["数据模型"];

    click B "./src/CLAUDE.md" "查看 src 模块文档"
    click M "./prisma/CLAUDE.md" "查看 prisma 模块文档"
```

## 模块索引

| 模块 | 路径 | 职责 | 语言 | 状态 |
|------|------|------|------|------|
| **前端应用** | `src/` | Next.js 应用主体，包含页面、API、组件 | TypeScript | ✅ 活跃 |
| **数据库模型** | `prisma/` | 数据库 schema 定义和迁移 | Prisma Schema | ✅ 活跃 |
| **静态资源** | `public/` | 图标和静态文件 | - | ✅ 活跃 |

## 运行与开发

### 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器（使用 Turbopack）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

### 环境要求
- Node.js 20+
- PostgreSQL 数据库
- 环境变量: `DATABASE_URL`

### 数据库操作
```bash
# 同步数据库模式
npx prisma db push

# 生成客户端
npx prisma generate

# 查看数据库
npx prisma studio
```

## 测试策略

**当前状态**: ⚠️ 暂无测试文件
- 建议添加单元测试 (Jest + Testing Library)
- API 接口测试
- 组件测试
- E2E 测试 (Playwright)

## 编码规范

- **代码风格**: ESLint + Prettier
- **TypeScript**: 严格模式，完整类型定义
- **组件**: 功能组件 + React Hooks
- **样式**: Tailwind CSS utilities-first
- **API**: RESTful 设计，Zod 数据验证
- **数据库**: Prisma ORM，类型安全查询

## AI 使用指引

### 代码修改建议
1. **API 路由**: 在 `src/app/api/` 下添加新的端点
2. **页面组件**: 使用 App Router 约定，支持国际化
3. **UI 组件**: 扩展 `src/components/ui/` 下的基础组件
4. **数据模型**: 修改 `prisma/schema.prisma` 后需要重新生成客户端

### 常见任务
- 添加新页面: 在 `src/app/[locale]/` 下创建路由文件
- 新增 API: 在 `src/app/api/` 下添加 `route.ts`
- 数据库修改: 更新 schema 并运行 `prisma db push`
- 样式调整: 使用 Tailwind 类名，保持响应式设计

### 注意事项
- 所有用户界面文本需要国际化处理
- API 接口需要适当的错误处理
- 数据库操作要考虑并发和事务安全
- 分享功能涉及安全令牌，注意权限控制