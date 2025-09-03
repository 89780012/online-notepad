[根目录](../CLAUDE.md) > **src**

# src/ - 前端应用模块

## 变更记录 (Changelog)

- **2025-09-03 10:14:14** - 架构师全面扫描更新：完善模块结构分析、新增详细的组件清单、覆盖率报告、技术债务评估
- **2025-09-02 17:04:43** - 增量更新：新增 VerticalToolbar 组件和 EnhancedMarkdownEditor，完善编辑器生态系统
- **2025-09-02 09:00:29** - 全面功能更新：新增 Markdown 编辑模式、模式系统重构、组件结构优化
- **2025-09-01 21:06:33** - 重大功能更新：专注模式、主题系统、customSlug 自定义链接、本地存储优化
- **2025-08-30 08:02:13** - 初始化 src 模块文档，分析应用架构

## 模块职责

src 目录包含 Online Notepad 的所有前端应用代码，采用 Next.js 15.5.2 App Router 架构。负责用户界面渲染、API 路由处理、组件管理、状态管理、国际化和类型定义。支持多语言（中英文）、多种编辑模式（纯文本/Markdown）、笔记分享、专注模式、主题切换等功能。

## 入口与启动

### 主要入口点
- **应用根页面**: `app/[locale]/page.tsx` - 多语言支持的主页面
- **应用布局**: `app/[locale]/layout.tsx` - 全局布局和主题提供者
- **中间件**: `middleware.ts` - 国际化路由中间件
- **全局样式**: `app/globals.css` - Tailwind CSS 全局样式

### 启动流程
1. 用户访问根路径，通过 middleware.ts 重定向到对应语言路由
2. layout.tsx 初始化主题系统和国际化配置
3. page.tsx 渲染主应用组件，包括编辑器和笔记列表
4. 加载本地存储的笔记和用户偏好设置

## 对外接口

### API 路由
- **笔记管理**: `app/api/notes/route.ts`
  - `POST /api/notes` - 创建新笔记，支持 customSlug
  - `PUT /api/notes` - 更新笔记，支持 customSlug 唯一性检查
- **分享功能**: `app/api/notes/share/[token]/route.ts`
  - `GET /api/notes/share/[token]` - 获取分享的笔记

### 页面路由
- **主页**: `/[locale]/` - 主编辑器界面
- **分享页面**: `/[locale]/share/[token]` - 分享笔记展示页面
- **404页面**: `not-found.tsx` - 自定义404页面

### Context API
```typescript
// 主题系统
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}
```

## 关键依赖与配置

### 核心依赖
- **React 19.1.0**: 前端框架
- **Next.js 15.5.2**: 全栈框架，使用 App Router
- **TypeScript**: 类型安全的开发体验
- **Tailwind CSS 4.0**: 样式框架
- **next-intl 4.3.5**: 国际化解决方案

### UI 组件库
- **@radix-ui/react-**: 可访问性友好的基础组件
- **lucide-react**: 图标库
- **class-variance-authority**: 组件变体管理

### Markdown 处理
- **react-markdown**: Markdown 渲染
- **remark-gfm**: GitHub Flavored Markdown 支持
- **rehype-highlight**: 代码语法高亮
- **rehype-raw**: 原始 HTML 支持

### 数据处理
- **@prisma/client**: 数据库客户端
- **zod**: 数据验证
- **nanoid**: 安全的ID生成

## 数据模型

### 本地存储数据结构
```typescript
interface LocalNote {
  id: string;
  title: string;
  content: string;
  mode: NoteMode; // 'plain-text' | 'markdown'
  createdAt: string;
  updatedAt: string;
  customSlug?: string;
  isPublic?: boolean;
  shareToken?: string;
  cloudNoteId?: string;
}
```

### 编辑模式定义
```typescript
export const NOTE_MODES = {
  PLAIN_TEXT: 'plain-text',
  MARKDOWN: 'markdown',
} as const;

export type NoteMode = typeof NOTE_MODES[keyof typeof NOTE_MODES];

interface NoteModeConfig {
  id: NoteMode;
  name: string;
  description: string;
  icon: string;
  supportedFeatures: {
    preview?: boolean;
    syntax?: boolean;
    formatting?: boolean;
    export?: string[];
  };
}
```

## 核心模块详解

### app/ - Next.js 应用路由
- **[locale]/** - 多语言动态路由
  - `page.tsx` - 主页面组件，包含专注模式
  - `layout.tsx` - 全局布局，集成主题系统
  - `share/[token]/page.tsx` - 分享页面
- **api/** - API 路由处理
  - RESTful 设计，支持笔记 CRUD 操作
  - Zod 数据验证和错误处理

### components/ - React 组件

#### 编辑器组件
- **NoteEditor.tsx** - 纯文本编辑器
- **EnhancedMarkdownEditor.tsx** - Markdown 增强编辑器
  - 完整工具栏支持（标题、格式、链接、列表等）
  - 三种视图模式（编辑/预览/分屏）
  - 实时预览和语法高亮
  - 智能文本插入和光标定位
- **MarkdownInput.tsx** - 基础 Markdown 输入组件
- **VerticalToolbar.tsx** - 浮动垂直工具栏
  - 圆形按钮设计
  - 编辑模式切换菜单
  - 快捷操作支持

#### 业务组件
- **NoteList.tsx** - 笔记列表管理
- **SharePopup.tsx** - 分享弹窗组件
- **ModeSelector.tsx** - 编辑模式选择器
- **PaperCard.tsx** - 纸张风格卡片

#### UI 基础组件 (ui/)
- Radix UI 封装的可重用组件
- **Button**, **Input**, **Textarea**, **Card**, **Label**

#### 系统组件
- **LanguageToggle.tsx** - 语言切换
- **ThemeToggle.tsx** - 主题切换
- **NoteDisplay.tsx** - 笔记展示组件
- **MarketingContent.tsx** - 营销内容页面

### contexts/ - React Context
- **ThemeContext.tsx** - 主题状态管理
  - 支持亮色/暗黑/系统自适应
  - localStorage 持久化
  - 系统偏好监听

### hooks/ - 自定义Hooks
- **useLocalNotes.ts** - 本地笔记管理
  - localStorage 数据持久化
  - CRUD 操作封装
  - 笔记搜索功能

### i18n/ - 国际化配置
- **config.ts** - 语言配置 (zh, en)
- **index.ts** - next-intl 配置
- **request.ts** - 服务端国际化

### lib/ - 工具库
- **prisma.ts** - Prisma 客户端实例
- **utils.ts** - 通用工具函数
- **locale.ts** - 语言工具函数

### messages/ - 多语言文件
- **zh.json** - 中文文本
- **en.json** - 英文文本

### types/ - TypeScript 类型定义
- **note-modes.ts** - 编辑模式类型系统

## 测试与质量

**当前状态**: ⚠️ 缺少测试文件

### 建议测试覆盖
- **组件测试**: 每个组件的单元测试
- **Hook 测试**: useLocalNotes 等自定义 Hook
- **API 测试**: API 路由的集成测试
- **E2E 测试**: 关键用户流程

### 质量工具配置
- **ESLint**: `eslint.config.mjs` 配置
- **TypeScript**: `tsconfig.json` 严格模式
- **Prettier**: 建议添加代码格式化

## 常见问题 (FAQ)

### Q: 如何添加新的编辑模式？
A: 1. 在 `types/note-modes.ts` 中定义新模式；2. 创建对应编辑器组件；3. 在主页面中集成

### Q: 如何添加新的语言支持？
A: 1. 在 `i18n/config.ts` 中添加语言代码；2. 创建对应的 `messages/{locale}.json`；3. 更新路由配置

### Q: 主题如何扩展？
A: 修改 `contexts/ThemeContext.tsx` 中的 Theme 类型，添加新主题逻辑

### Q: 本地存储数据迁移？
A: 在 `hooks/useLocalNotes.ts` 的 loadNotes 方法中处理数据格式兼容

### Q: 如何扩展 Markdown 编辑器工具栏？
A: 在 `EnhancedMarkdownEditor.tsx` 的 `toolbarButtons` 数组中添加新按钮配置

## 相关文件清单

### 核心文件结构 (45+ 文件)
```
src/
├── app/ (9 文件)
│   ├── [locale]/
│   │   ├── layout.tsx          # 全局布局 + 主题提供者
│   │   ├── page.tsx            # 主页面 + 专注模式
│   │   └── share/[token]/page.tsx
│   ├── api/notes/
│   │   ├── route.ts            # 笔记 CRUD API
│   │   └── share/[token]/route.ts
│   ├── globals.css
│   ├── favicon.ico
│   └── not-found.tsx
├── components/ (17 文件)
│   ├── 编辑器组件 (4个)
│   ├── 业务组件 (8个)
│   └── ui/ 基础组件 (5个)
├── contexts/ (1 文件)
├── hooks/ (1 文件)
├── i18n/ (3 文件)
├── lib/ (3 文件)
├── messages/ (2 文件)
├── types/ (1 文件)
└── middleware.ts (1 文件)
```

### 按功能分类
- **编辑器**: 4 个组件 (NoteEditor, EnhancedMarkdownEditor, MarkdownInput, VerticalToolbar)
- **UI组件**: 5 个基础组件 + 8 个业务组件
- **API**: 3 个端点
- **配置**: 6 个配置文件
- **类型定义**: 1 个模式系统类型文件
- **国际化**: 2 个语言包 + 3 个配置文件

### 技术债务与改进建议
1. **测试覆盖率**: 0% → 建议达到 80%+
2. **性能优化**: 添加组件懒加载和内存优化
3. **错误边界**: 添加 React Error Boundary
4. **可访问性**: 改善键盘导航和屏幕阅读器支持
5. **代码分割**: 优化包大小，延迟加载非关键组件