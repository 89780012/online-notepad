# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Online Notepad 是基于 Next.js 15 + React 19 的现代化在线记事本应用，支持多语言、Markdown 编辑、专注模式、主题切换和自定义分享链接。

## 开发命令

### 基本操作
```bash
# 安装依赖
npm install

# 开发模式（使用 Turbopack）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

### 数据库操作
```bash
# 同步数据库模式（开发环境）
npx prisma db push

# 生成 Prisma 客户端
npx prisma generate

# 查看数据库（图形界面）
npx prisma studio

# 重置数据库
npx prisma db push --force-reset
```

## 技术架构

### 核心技术栈
- **Next.js 15.5.2** (App Router) + **React 19.1.0**
- **TypeScript** 严格模式
- **Tailwind CSS 4.0** + **Radix UI**
- **PostgreSQL** + **Prisma ORM 6.15.0**
- **next-intl** 国际化
- **Zod** 数据验证
- **@uiw/react-md-editor** Markdown 编辑

### 项目结构
```
src/
├── app/
│   ├── [locale]/           # 国际化路由 (/en/, /zh/)
│   │   ├── page.tsx       # 主页面
│   │   └── layout.tsx     # 布局组件
│   └── api/               # API 路由
│       └── notes/         # 笔记相关 API
├── components/
│   ├── ui/                # 基础 UI 组件
│   ├── EnhancedMarkdownEditor.tsx  # 增强 Markdown 编辑器
│   ├── NoteEditor.tsx     # 笔记编辑器
│   └── VerticalToolbar.tsx # 垂直工具栏
├── contexts/
│   └── ThemeContext.tsx   # 主题管理
├── hooks/
│   └── useLocalNotes.ts   # 本地存储管理
├── lib/
├── types/
│   └── note-modes.ts      # 编辑模式类型定义
└── messages/              # 国际化文本
    ├── en.json
    └── zh.json
```

## 核心功能架构

### 路由系统
- 使用 App Router 的 `[locale]` 动态路由支持中英文
- 所有页面路径需要包含语言前缀：`/en/` 或 `/zh/`
- 页面组件通过 `useTranslations()` 获取国际化文本

### 编辑模式系统
编辑模式在 `src/types/note-modes.ts` 中定义：
```typescript
export const noteModes = {
  text: { ... },           # 纯文本模式
  markdown: { ... },       # 基础 Markdown
  enhanced: { ... }        # 增强 Markdown 编辑器
} as const
```

每个模式都有对应的编辑器组件和特定功能。

### 主题系统
通过 `ThemeContext` 管理三种主题：
- `light` - 亮色主题
- `dark` - 暗黑主题  
- `system` - 跟随系统

主题状态持久化到 localStorage，并监听系统偏好变化。

### 专注模式
全屏编辑模式，通过以下方式实现：
- 隐藏所有 UI 元素，只保留编辑器
- ESC 键快捷退出
- 支持所有编辑模式

### 数据持久化
- **远程存储**: PostgreSQL + Prisma，支持分享功能
- **本地存储**: localStorage 实现离线功能
- **自动保存**: 编辑时实时保存到本地存储

## API 设计

### RESTful 模式
```
GET    /api/notes         # 获取笔记列表
POST   /api/notes         # 创建笔记
PUT    /api/notes/[id]    # 更新笔记
DELETE /api/notes/[id]    # 删除笔记
GET    /api/notes/share/[token]  # 获取分享笔记
```

### 数据验证
所有 API 使用 Zod schema 进行输入验证：
```typescript
const createNoteSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string(),
  // ...
})
```

## 数据库模式

核心表结构（简化）：
```prisma
model Note {
  id          String   @id @default(cuid())
  title       String
  content     String
  shareToken  String?  @unique
  customSlug  String?  @unique  // 自定义分享链接
  isPublic    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 组件设计原则

### 编辑器组件
- 基础编辑器：`NoteEditor.tsx`
- 增强 Markdown：`EnhancedMarkdownEditor.tsx`
- 工具栏：支持格式化、预览模式切换
- 自动保存：编辑时触发本地存储

### UI 组件模式
- 使用 Radix UI 作为无样式基础组件
- Tailwind CSS 进行样式定制
- 支持主题切换的 CSS 变量系统
- 响应式设计，移动端友好

### 状态管理
- React Context 管理全局状态（主题、语言）
- Custom Hooks 管理业务逻辑（笔记、本地存储）
- 避免过度使用外部状态管理库

## 重要注意事项

### 安全考虑
- Markdown 内容需要进行 XSS 防护
- 分享链接使用安全的随机 token
- 自定义链接需要唯一性验证

### 性能优化
- 使用 Next.js 的自动代码分割
- 图片和静态资源优化
- 大文本编辑器的防抖处理

### 开发规范
- 严格的 TypeScript 配置
- 所有用户界面文本必须国际化
- 组件 props 需要完整的类型定义
- API 响应需要统一的错误处理格式

### 测试策略（待实现）
建议添加以下测试：
- 单元测试：组件和 Hook 测试
- 集成测试：API 接口测试
- E2E 测试：完整用户流程测试
- 可访问性测试：键盘导航和屏幕阅读器支持

## 部署和环境

### 环境变量
```bash
DATABASE_URL="postgresql://..."    # PostgreSQL 连接字符串
```

### 生产部署流程
1. `npm run build` - 构建生产版本
2. `npx prisma generate` - 生成数据库客户端
3. `npx prisma db push` - 同步数据库结构（或使用迁移）
4. `npm start` - 启动生产服务器

### 数据库迁移
生产环境建议使用 Prisma 迁移而非 `db push`：
```bash
npx prisma migrate dev --name init
npx prisma migrate deploy
```