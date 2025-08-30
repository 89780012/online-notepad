[根目录](../CLAUDE.md) > **src**

# src 模块 - Next.js 应用主体

## 变更记录 (Changelog)

- **2025-08-30 08:02:13** - 初始化 src 模块文档，分析应用架构

## 模块职责

src 目录包含 Next.js 应用的全部前端代码，采用 App Router 架构，支持多语言国际化，提供完整的笔记创建、编辑和分享功能。

## 入口与启动

### 主要入口点
- **根布局**: `app/[locale]/layout.tsx` - 国际化布局包装器
- **首页**: `app/[locale]/page.tsx` - 主页面，包含笔记编辑器
- **API 入口**: `app/api/notes/route.ts` - 笔记 CRUD 操作
- **中间件**: `middleware.ts` - 国际化路由处理

### 启动流程
1. Next.js App Router 初始化
2. 国际化中间件处理语言路由
3. 布局组件加载字体和全局样式
4. 页面组件渲染笔记编辑器

## 对外接口

### API 端点
```typescript
// 笔记管理
POST   /api/notes              // 创建笔记
PUT    /api/notes              // 更新笔记
GET    /api/notes/share/[token] // 获取共享笔记

// 数据模型
interface Note {
  id: string
  title: string
  content: string
  language: 'en' | 'zh'
  isPublic: boolean
  shareToken?: string
  createdAt: Date
  updatedAt: Date
}
```

### 页面路由
- `/[locale]/` - 主页 (笔记编辑器)
- `/[locale]/share/[token]` - 共享笔记查看页

## 关键依赖与配置

### 核心依赖
```json
{
  "next": "15.5.2",
  "react": "19.1.0",
  "next-intl": "^4.3.5",
  "@prisma/client": "^6.15.0",
  "zod": "^4.1.5",
  "tailwindcss": "^4"
}
```

### 配置文件
- `next.config.ts` - Next.js 配置，集成国际化插件
- `i18n.ts` - 国际化配置，支持中英文
- `lib/prisma.ts` - 数据库客户端配置

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
  isPublic: z.boolean().default(false)
});
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
})

// API 测试  
describe('/api/notes', () => {
  test('POST should create note with valid data')
  test('PUT should update existing note')
  test('should validate input data')
})
```

## 常见问题 (FAQ)

### Q: 如何添加新语言支持？
A: 1. 在 `src/i18n.ts` 中添加语言代码，2. 创建对应的 `messages/{lang}.json`，3. 更新 Prisma schema 的 language 枚举

### Q: 如何修改笔记数据结构？
A: 1. 修改 `prisma/schema.prisma`，2. 运行 `npx prisma db push`，3. 更新 Zod 验证 schema，4. 调整相关组件

### Q: 分享链接的安全性如何保障？
A: 使用 nanoid 生成 10 位随机令牌，足够安全且不易猜测。建议添加过期时间和访问次数限制。

## 相关文件清单

### 核心文件
```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx        # 国际化根布局
│   │   ├── page.tsx          # 主页面
│   │   └── share/[token]/page.tsx # 分享页面
│   ├── api/notes/
│   │   ├── route.ts          # 笔记 CRUD API
│   │   └── share/[token]/route.ts # 分享 API
│   └── globals.css           # 全局样式
├── components/
│   ├── NoteEditor.tsx        # 核心笔记编辑器
│   ├── LanguageToggle.tsx    # 语言切换组件
│   └── ui/                   # 基础 UI 组件
├── lib/
│   ├── prisma.ts            # 数据库客户端
│   ├── utils.ts             # 工具函数
│   └── locale.ts            # 语言工具
├── messages/
│   ├── en.json              # 英文翻译
│   └── zh.json              # 中文翻译
├── middleware.ts            # 国际化中间件
└── i18n.ts                  # 国际化配置
```

### 统计信息
- **总文件数**: ~20 个文件
- **组件数**: 6 个 React 组件
- **API 路由**: 3 个端点
- **样式文件**: 1 个全局 CSS + Tailwind
- **配置文件**: 4 个配置文件