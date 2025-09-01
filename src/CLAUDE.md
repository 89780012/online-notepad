[根目录](../CLAUDE.md) > **src**

# src 模块 - Next.js 应用主体

## 变更记录 (Changelog)

- **2025-09-01 21:06:33** - 重大功能更新：专注模式、主题系统、customSlug 自定义链接、本地存储优化
- **2025-08-30 08:02:13** - 初始化 src 模块文档，分析应用架构

## 模块职责

src 目录包含 Next.js 应用的全部前端代码，采用 App Router 架构，支持多语言国际化，提供完整的笔记创建、编辑、分享、专注模式、主题切换功能。通过 Context + hooks 模式管理状态，提供优秀的用户体验。

## 入口与启动

### 主要入口点
- **根布局**: `app/[locale]/layout.tsx` - 国际化布局包装器，集成主题系统
- **首页**: `app/[locale]/page.tsx` - 主页面，包含笔记编辑器和专注模式
- **API 入口**: `app/api/notes/route.ts` - 笔记 CRUD 操作，支持 customSlug
- **中间件**: `middleware.ts` - 国际化路由处理
- **主题上下文**: `contexts/ThemeContext.tsx` - 全局主题状态管理

### 启动流程
1. Next.js App Router 初始化
2. 国际化中间件处理语言路由
3. ThemeProvider 初始化主题系统
4. 布局组件加载字体和全局样式
5. 页面组件渲染笔记编辑器和功能组件

## 对外接口

### API 端点
```typescript
// 笔记管理
POST   /api/notes              // 创建笔记（支持 customSlug）
PUT    /api/notes              // 更新笔记（支持 customSlug 唯一性检查）
GET    /api/notes/share/[token] // 获取共享笔记

// 数据模型
interface Note {
  id: string
  title: string
  content: string
  language: 'en' | 'zh'
  isPublic: boolean
  shareToken?: string
  customSlug?: string         // 新增：自定义分享链接后缀
  createdAt: Date
  updatedAt: Date
}

// 本地笔记类型
interface LocalNote {
  id: string
  title: string
  content: string
  updatedAt: Date
  isPublic?: boolean
  shareToken?: string
}
```

### 页面路由
- `/[locale]/` - 主页 (笔记编辑器 + 专注模式)
- `/[locale]/share/[token]` - 共享笔记查看页

### Context API
```typescript
// 主题系统
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}
```

## 关键依赖与配置

### 核心依赖
```json
{
  "next": "15.5.2",
  "react": "19.1.0",
  "next-intl": "^4.3.5",
  "@prisma/client": "^6.15.0",
  "zod": "^4.1.5",
  "tailwindcss": "^4",
  "nanoid": "^5.1.5"
}
```

### UI 组件依赖
```json
{
  "@radix-ui/react-label": "^2.1.7",
  "@radix-ui/react-slot": "^1.2.3",
  "lucide-react": "^0.542.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.3.1"
}
```

### 配置文件
- `next.config.ts` - Next.js 配置，集成国际化插件
- `i18n/config.ts` - 国际化配置，支持中英文
- `lib/prisma.ts` - 数据库客户端配置
- `lib/utils.ts` - 通用工具函数（Tailwind 类名合并等）

## 数据模型

### Prisma Schema 更新
```prisma
model Note {
  id          String   @id @default(cuid())
  title       String
  content     String
  language    String   @default("en")
  isPublic    Boolean  @default(false)
  shareToken  String?  @unique
  customSlug  String?  @unique  // 新增：用户自定义分享 URL 后缀
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 验证 Schema (Zod)
```typescript
const createNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  language: z.enum(['en', 'zh']),
  isPublic: z.boolean().default(false),
  customSlug: z.string().min(1).max(50).regex(/^[a-zA-Z0-9-_]+$/).optional()
});

const updateNoteSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  content: z.string(),
  language: z.enum(['en', 'zh']),
  isPublic: z.boolean().default(false),
  customSlug: z.string().min(1).max(50).regex(/^[a-zA-Z0-9-_]+$/).optional()
});
```

## 核心功能组件

### 专注模式 (Focus Mode)
```typescript
// 位置: app/[locale]/page.tsx
- 全屏编辑体验，隐藏所有 UI 元素
- ESC 键快速退出
- 专用退出按钮和键盘提示
- 状态管理: useState(isFocusMode)
```

### 主题系统 (Theme System)
```typescript
// 位置: contexts/ThemeContext.tsx, components/ThemeToggle.tsx
- 三种模式：亮色/暗黑/系统自适应
- localStorage 持久化
- 动态监听系统主题变化 (matchMedia)
- 循环切换 UI (Sun/Moon/Monitor 图标)
```

### 本地存储管理
```typescript
// 位置: hooks/useLocalNotes.ts
- 笔记本地缓存和持久化
- 实时保存功能
- 搜索和过滤
- 与远程 API 的同步机制
```

### 自定义分享链接
```typescript
// 位置: app/api/notes/route.ts, components/SharePopup.tsx
- 用户自定义 URL 后缀
- 唯一性检查和冲突处理
- 正则验证：字母、数字、连字符、下划线
- 优雅的错误提示机制
```

## 测试与质量

### 当前状态
- ⚠️ **缺少测试文件** - 建议添加以下测试
- ⚠️ **缺少类型测试** - 建议验证 TypeScript 类型覆盖

### 建议测试策略
```typescript
// 组件测试
describe('NoteEditor', () => {
  test('should create note with valid data')
  test('should generate share URL when public')
  test('should handle save errors gracefully')
  test('should enter focus mode on button click')
  test('should exit focus mode with ESC key')
})

// 主题系统测试
describe('ThemeContext', () => {
  test('should cycle through themes correctly')
  test('should persist theme to localStorage')
  test('should respond to system theme changes')
})

// API 测试  
describe('/api/notes', () => {
  test('POST should create note with valid data')
  test('POST should validate customSlug uniqueness')
  test('PUT should update existing note')
  test('should validate input data with Zod')
})

// Hooks 测试
describe('useLocalNotes', () => {
  test('should save notes to localStorage')
  test('should load notes on mount')
  test('should filter notes by search term')
})
```

### 性能考虑
- **代码分割**: 使用 dynamic imports 延迟加载非关键组件
- **状态优化**: useMemo/useCallback 防止不必要的重渲染
- **本地存储**: 防抖保存机制减少写入频率
- **主题切换**: 使用 CSS 变量实现平滑过渡

## 常见问题 (FAQ)

### Q: 如何添加新语言支持？
A: 1. 在 `src/i18n/config.ts` 中添加语言代码，2. 创建对应的 `messages/{lang}.json`，3. 更新 Prisma schema 的 language 枚举

### Q: 如何修改笔记数据结构？
A: 1. 修改 `prisma/schema.prisma`，2. 运行 `npx prisma db push`，3. 更新 Zod 验证 schema，4. 调整相关组件接口

### Q: 专注模式如何自定义？
A: 在 `app/[locale]/page.tsx` 中修改 `isFocusMode` 条件渲染部分，可以调整布局、快捷键、退出方式等

### Q: 如何添加新主题？
A: 1. 在 `ThemeContext.tsx` 中扩展 Theme 类型，2. 更新主题切换逻辑，3. 在 CSS 中定义新主题的颜色变量

### Q: customSlug 的限制是什么？
A: 长度 1-50 字符，只允许字母、数字、连字符和下划线，必须全局唯一

### Q: 如何扩展分享功能？
A: 1. 在 Note 模型中添加新字段，2. 更新 API 路由验证，3. 修改 SharePopup 组件界面，4. 考虑安全性和访问控制

## 相关文件清单

### 核心文件结构
```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          # 国际化根布局 + ThemeProvider
│   │   ├── page.tsx            # 主页面 + 专注模式
│   │   └── share/[token]/page.tsx # 分享页面
│   ├── api/notes/
│   │   ├── route.ts            # 笔记 CRUD API + customSlug
│   │   └── share/[token]/route.ts # 分享 API
│   ├── globals.css             # 全局样式 + CSS 变量
│   ├── favicon.ico             # 网站图标
│   └── not-found.tsx           # 404 页面
├── components/
│   ├── NoteEditor.tsx          # 核心笔记编辑器
│   ├── NoteList.tsx            # 笔记列表 + 搜索
│   ├── NoteInput.tsx           # 笔记输入组件
│   ├── SharePopup.tsx          # 分享弹窗 + customSlug
│   ├── LanguageToggle.tsx      # 语言切换组件
│   ├── ThemeToggle.tsx         # 主题切换组件
│   ├── MarketingContent.tsx    # 营销内容展示
│   └── ui/                     # 基础 UI 组件库
│       ├── button.tsx          # 按钮组件
│       ├── input.tsx           # 输入框组件
│       ├── textarea.tsx        # 文本域组件
│       ├── card.tsx            # 卡片组件
│       └── label.tsx           # 标签组件
├── contexts/
│   └── ThemeContext.tsx        # 主题系统上下文
├── hooks/
│   └── useLocalNotes.ts        # 本地笔记管理 Hook
├── lib/
│   ├── prisma.ts               # 数据库客户端
│   ├── utils.ts                # 工具函数
│   └── locale.ts               # 语言工具
├── messages/
│   ├── en.json                 # 英文翻译
│   └── zh.json                 # 中文翻译
├── i18n/
│   ├── config.ts               # 国际化配置
│   ├── index.ts                # 国际化入口
│   └── request.ts              # 请求国际化
└── middleware.ts               # 国际化中间件
```

### 新增功能文件
- `contexts/ThemeContext.tsx` - 主题系统核心
- `components/ThemeToggle.tsx` - 主题切换 UI
- `hooks/useLocalNotes.ts` - 本地存储管理
- `app/[locale]/page.tsx` - 专注模式集成
- `app/api/notes/route.ts` - customSlug API 支持

### 统计信息
- **总文件数**: ~35 个文件
- **组件数**: 10+ React 组件
- **API 路由**: 3 个端点
- **Context**: 1 个主题上下文
- **Hooks**: 1 个自定义 Hook
- **样式文件**: 1 个全局 CSS + Tailwind
- **配置文件**: 6 个配置文件
- **国际化文件**: 2 个语言包