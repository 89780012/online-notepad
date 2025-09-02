[根目录](../CLAUDE.md) > **src**

# src 模块 - Next.js 应用主体

## 变更记录 (Changelog)

- **2025-09-02 17:04:43** - 增量更新：新增 VerticalToolbar 组件和 EnhancedMarkdownEditor，完善编辑器生态系统
- **2025-09-02 09:00:29** - 全面功能更新：新增 Markdown 编辑模式、模式系统重构、组件结构优化
- **2025-09-01 21:06:33** - 重大功能更新：专注模式、主题系统、customSlug 自定义链接、本地存储优化
- **2025-08-30 08:02:13** - 初始化 src 模块文档，分析应用架构

## 模块职责

src 目录包含 Next.js 应用的全部前端代码，采用 App Router 架构，支持多语言国际化，提供完整的笔记创建、编辑、分享、专注模式、主题切换、多种编辑模式功能。通过 Context + hooks 模式管理状态，支持纯文本和 Markdown 两种编辑模式，提供优秀的用户体验。新增的 VerticalToolbar 和 EnhancedMarkdownEditor 进一步提升了编辑体验。

## 入口与启动

### 主要入口点
- **根布局**: `app/[locale]/layout.tsx` - 国际化布局包装器，集成主题系统
- **首页**: `app/[locale]/page.tsx` - 主页面，包含笔记编辑器和专注模式
- **分享页**: `app/[locale]/share/[token]/page.tsx` - 分享笔记查看页
- **API 入口**: `app/api/notes/route.ts` - 笔记 CRUD 操作，支持 customSlug
- **中间件**: `middleware.ts` - 国际化路由处理
- **主题上下文**: `contexts/ThemeContext.tsx` - 全局主题状态管理

### 启动流程
1. Next.js App Router 初始化
2. 国际化中间件处理语言路由
3. ThemeProvider 初始化主题系统
4. 布局组件加载字体和全局样式
5. 页面组件渲染笔记编辑器和功能组件
6. 加载本地笔记数据和用户偏好设置

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
  customSlug?: string         // 自定义分享链接后缀
  createdAt: Date
  updatedAt: Date
}

// 本地笔记类型
interface LocalNote {
  id: string
  title: string
  content: string
  mode: NoteMode             // 编辑模式：'plain-text' | 'markdown'
  createdAt: string
  updatedAt: string
  customSlug?: string
  isPublic?: boolean
  shareToken?: string
  cloudNoteId?: string       // 云端笔记ID
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

### 编辑模式系统
```typescript
// 笔记编辑模式
export const NOTE_MODES = {
  PLAIN_TEXT: 'plain-text',
  MARKDOWN: 'markdown',
} as const

export type NoteMode = typeof NOTE_MODES[keyof typeof NOTE_MODES]

// 模式配置
interface NoteModeConfig {
  id: NoteMode
  name: string
  description: string
  icon: string
  fileExtension?: string
  supportedFeatures: {
    preview?: boolean
    syntax?: boolean
    formatting?: boolean
    export?: string[]
  }
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

### Markdown 相关依赖
```json
{
  "react-markdown": "^10.1.0",
  "rehype-highlight": "^7.0.2",
  "rehype-raw": "^7.0.0",
  "remark-gfm": "^4.0.1"
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
- `types/note-modes.ts` - 编辑模式类型定义

## 数据模型

### Prisma Schema
```prisma
model Note {
  id          String   @id @default(cuid())
  title       String
  content     String
  language    String   @default("en")
  isPublic    Boolean  @default(false)
  shareToken  String?  @unique
  customSlug  String?  @unique  // 用户自定义分享 URL 后缀
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
```

## 核心功能组件

### 编辑器系统
```typescript
// 位置: components/
- NoteEditor.tsx：基础纯文本编辑器
- MarkdownEditor.tsx：基础 Markdown 编辑器 
- EnhancedMarkdownEditor.tsx：增强版 Markdown 编辑器（新增）
  * 完整工具栏支持
  * 三种视图模式（编辑/预览/分屏）
  * 智能文本插入和光标定位
  * 实时预览和语法高亮
- MarkdownInput.tsx：Markdown 输入组件
- VerticalToolbar.tsx：垂直工具栏（新增）
  * 浮动圆形按钮设计
  * 编辑模式切换菜单
  * 快捷操作支持
```

### 增强的 Markdown 编辑器功能
```typescript
// EnhancedMarkdownEditor 特性
interface MarkdownEditorProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
}

// 支持的工具栏功能
const toolbarButtons = [
  { icon: Heading1, title: '一级标题', action: () => insertText('# ') }
  { icon: Heading2, title: '二级标题', action: () => insertText('## ') }
  { icon: Bold, title: '粗体', action: () => insertText('**', '**') }
  { icon: Italic, title: '斜体', action: () => insertText('*', '*') }
  { icon: Code, title: '行内代码', action: () => insertText('`', '`') }
  { icon: Link, title: '链接', action: () => insertText('[', '](url)') }
  { icon: List, title: '无序列表', action: () => insertText('- ') }
  { icon: ListOrdered, title: '有序列表', action: () => insertText('1. ') }
  { icon: Quote, title: '引用', action: () => insertText('> ') }
]

// 三种视图模式
type ViewMode = 'edit' | 'preview' | 'split';
```

### 垂直工具栏系统
```typescript
// VerticalToolbar 特性
interface VerticalToolbarProps {
  currentMode: NoteMode;
  onModeChange: (mode: NoteMode) => void;
  onNewNote?: () => void;
  onExport?: () => void;
  className?: string;
}

// 模式配置
const modes = [
  {
    id: NOTE_MODES.PLAIN_TEXT,
    icon: FileText,
    title: '文本模式',
    description: '纯文本编辑'
  },
  {
    id: NOTE_MODES.MARKDOWN,
    icon: Hash,
    title: 'Markdown',
    description: '支持Markdown语法'
  }
];
```

### 模式选择器
```typescript
// 位置: components/ModeSelector.tsx, types/note-modes.ts
- 可扩展的编辑模式系统
- 类型安全的模式定义
- 持久化的模式偏好设置
- 模式特定的功能支持
```

### 专注模式 (Focus Mode)
```typescript
// 位置: app/[locale]/page.tsx
- 全屏编辑体验，隐藏所有 UI 元素
- ESC 键快速退出
- 专用退出按钮和键盘提示
- 支持所有编辑模式（包括新的 EnhancedMarkdownEditor）
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
- 支持编辑模式信息存储
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
// 增强 Markdown 编辑器测试
describe('EnhancedMarkdownEditor', () => {
  test('should render toolbar buttons correctly')
  test('should insert text with proper cursor positioning')
  test('should switch between view modes (edit/preview/split)')
  test('should apply markdown formatting via toolbar')
  test('should handle real-time preview rendering')
  test('should support rehype plugins for syntax highlighting')
})

// 垂直工具栏测试
describe('VerticalToolbar', () => {
  test('should display current mode indicator')
  test('should toggle mode selection menu')
  test('should switch between editing modes')
  test('should handle new note and export actions')
  test('should close menu when clicking outside')
})

// 编辑器组件测试
describe('NoteEditor', () => {
  test('should create note with valid data')
  test('should auto-save content changes')
  test('should enter focus mode on button click')
  test('should exit focus mode with ESC key')
})

// 模式系统测试
describe('ModeSelector', () => {
  test('should switch between note modes')
  test('should persist mode preference')
  test('should validate mode configurations')
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
  test('should save notes with mode information')
  test('should load notes on mount')
  test('should filter notes by search term')
  test('should handle mode-specific operations')
})
```

### 性能考虑
- **代码分割**: 使用 dynamic imports 延迟加载编辑器组件
- **状态优化**: useMemo/useCallback 防止不必要的重渲染
- **本地存储**: 防抖保存机制减少写入频率
- **主题切换**: 使用 CSS 变量实现平滑过渡
- **Markdown 渲染**: 优化大文档的渲染性能
- **工具栏优化**: 避免频繁的 DOM 操作

## 常见问题 (FAQ)

### Q: 如何添加新的编辑模式？
A: 1. 在 `types/note-modes.ts` 中定义新模式，2. 创建对应的编辑器组件，3. 在主页面中集成新编辑器，4. 更新模式选择器和垂直工具栏

### Q: 如何扩展 EnhancedMarkdownEditor 的工具栏？
A: 在 `toolbarButtons` 数组中添加新的按钮配置，包含 icon、title 和 action 函数，action 函数调用 `insertText` 方法

### Q: 垂直工具栏如何添加新功能？
A: 在 `VerticalToolbar.tsx` 中添加新的按钮组件，通过 props 传递回调函数，确保响应式设计

### Q: Markdown 编辑器如何扩展功能？
A: 1. 在 rehype/remark 插件配置中添加新插件，2. 更新编辑器组件的渲染逻辑，3. 考虑安全性（XSS防护）

### Q: 如何添加新语言支持？
A: 1. 在 `src/i18n/config.ts` 中添加语言代码，2. 创建对应的 `messages/{lang}.json`，3. 更新 Prisma schema 的 language 枚举

### Q: 专注模式如何自定义？
A: 在 `app/[locale]/page.tsx` 中修改 `isFocusMode` 条件渲染部分，可以调整布局、快捷键、退出方式等

### Q: 如何添加新主题？
A: 1. 在 `ThemeContext.tsx` 中扩展 Theme 类型，2. 更新主题切换逻辑，3. 在 CSS 中定义新主题的颜色变量

### Q: customSlug 的限制是什么？
A: 长度 1-50 字符，只允许字母、数字、连字符和下划线，必须全局唯一

## 相关文件清单

### 核心文件结构
```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          # 国际化根布局 + ThemeProvider
│   │   ├── page.tsx            # 主页面 + 专注模式 + 编辑器集成
│   │   └── share/[token]/page.tsx # 分享页面
│   ├── api/notes/
│   │   ├── route.ts            # 笔记 CRUD API + customSlug
│   │   └── share/[token]/route.ts # 分享 API
│   ├── globals.css             # 全局样式 + CSS 变量
│   ├── favicon.ico             # 网站图标
│   └── not-found.tsx           # 404 页面
├── components/
│   ├── NoteEditor.tsx          # 纯文本笔记编辑器
│   ├── MarkdownEditor.tsx      # 基础 Markdown 编辑器
│   ├── EnhancedMarkdownEditor.tsx # 增强版 Markdown 编辑器（新增）
│   ├── VerticalToolbar.tsx     # 垂直工具栏（新增）
│   ├── MarkdownInput.tsx       # Markdown 输入组件
│   ├── ModeSelector.tsx        # 编辑模式选择器
│   ├── NoteList.tsx            # 笔记列表 + 搜索
│   ├── NoteInput.tsx           # 基础笔记输入组件
│   ├── NoteDisplay.tsx         # 笔记显示组件
│   ├── SharePopup.tsx          # 分享弹窗 + customSlug
│   ├── LanguageToggle.tsx      # 语言切换组件
│   ├── ThemeToggle.tsx         # 主题切换组件
│   ├── MarketingContent.tsx    # 营销内容展示
│   ├── PaperCard.tsx           # 纸张风格卡片组件
│   └── ui/                     # 基础 UI 组件库
│       ├── button.tsx          # 按钮组件
│       ├── input.tsx           # 输入框组件
│       ├── textarea.tsx        # 文本域组件
│       ├── card.tsx            # 卡片组件
│       └── label.tsx           # 标签组件
├── contexts/
│   └── ThemeContext.tsx        # 主题系统上下文
├── hooks/
│   └── useLocalNotes.ts        # 本地笔记管理 Hook（支持模式）
├── lib/
│   ├── prisma.ts               # 数据库客户端
│   ├── utils.ts                # 工具函数
│   └── locale.ts               # 语言工具
├── types/
│   └── note-modes.ts           # 编辑模式类型定义
├── messages/
│   ├── en.json                 # 英文翻译
│   └── zh.json                 # 中文翻译
├── i18n/
│   ├── config.ts               # 国际化配置
│   ├── index.ts                # 国际化入口
│   └── request.ts              # 请求国际化
└── middleware.ts               # 国际化中间件
```

### 最新更新文件
- `components/EnhancedMarkdownEditor.tsx` - 增强版 Markdown 编辑器
- `components/VerticalToolbar.tsx` - 垂直工具栏组件
- `types/note-modes.ts` - 编辑模式类型系统
- `contexts/ThemeContext.tsx` - 主题系统核心
- `components/ThemeToggle.tsx` - 主题切换 UI
- `hooks/useLocalNotes.ts` - 增强的本地存储管理
- `app/[locale]/page.tsx` - 专注模式集成
- `app/api/notes/route.ts` - customSlug API 支持

### 统计信息
- **总文件数**: ~45+ 个文件
- **组件数**: 17+ React 组件
- **编辑器**: 3 种编辑器组件（NoteEditor、MarkdownEditor、EnhancedMarkdownEditor）
- **API 路由**: 3 个端点
- **Context**: 1 个主题上下文
- **Hooks**: 1 个自定义 Hook
- **类型定义**: 1 个模式系统类型文件
- **样式文件**: 1 个全局 CSS + Tailwind
- **配置文件**: 6 个配置文件
- **国际化文件**: 2 个语言包

### 新增组件详细说明

#### EnhancedMarkdownEditor
- **功能**: 完整的 Markdown 编辑器，包含工具栏和三种视图模式
- **特性**: 实时预览、语法高亮、智能文本插入、rehype 插件支持
- **位置**: `src/components/EnhancedMarkdownEditor.tsx`
- **依赖**: react-markdown, rehype-highlight, rehype-raw, remark-gfm

#### VerticalToolbar
- **功能**: 浮动在编辑区域右侧的垂直工具栏
- **特性**: 圆形按钮设计、编辑模式切换菜单、快捷操作
- **位置**: `src/components/VerticalToolbar.tsx`
- **交互**: 支持点击外部关闭菜单，响应式适配