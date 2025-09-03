[根目录](../../CLAUDE.md) > **src/app**

# Next.js App Router 层

## 模块职责

App Router 层是 Online Notepad 的路由与 API 核心，负责页面路由管理、国际化中间件、RESTful API 端点以及 SSR/SSG 渲染策略。基于 Next.js 15 的最新 App Router 架构实现。

## 入口与启动

### 页面路由
- **`[locale]/page.tsx`** - 主应用页面，支持中英文动态路由 (`/en/`, `/zh/`)
- **`[locale]/layout.tsx`** - 根布局组件，提供主题和国际化上下文
- **`[locale]/share/[token]/page.tsx`** - 笔记分享页面，支持 token 和自定义 slug

### API 端点
- **`api/notes/route.ts`** - 笔记 CRUD 操作 (POST/PUT/DELETE)
- **`api/notes/share/[token]/route.ts`** - 分享笔记获取 (GET)

### 中间件
- **`middleware.ts`** - 国际化路由中间件，处理语言重定向

## 对外接口

### 页面组件接口
```typescript
// [locale]/page.tsx - 主页面
interface PageProps {
  params: { locale: string };
}

// [locale]/share/[token]/page.tsx - 分享页面  
interface SharePageProps {
  params: { 
    locale: string;
    token: string;
  };
}

// [locale]/layout.tsx - 根布局
interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}
```

### API 路由接口
```typescript
// POST /api/notes - 创建笔记
interface CreateNoteRequest {
  title: string;
  content: string;
  language: 'en' | 'zh';
  isPublic: boolean;
  customSlug?: string;
}

interface CreateNoteResponse {
  id: string;
  title: string;
  content: string;
  language: string;
  isPublic: boolean;
  shareToken?: string;
  customSlug?: string;
  createdAt: string;
  updatedAt: string;
}

// PUT /api/notes - 更新笔记
interface UpdateNoteRequest extends CreateNoteRequest {
  id: string;
}

// DELETE /api/notes?id=xxx - 删除笔记
interface DeleteNoteResponse {
  success: boolean;
}

// GET /api/notes/share/[token] - 获取分享笔记
interface SharedNoteResponse {
  id: string;
  title: string;
  content: string;
  language: string;
  customSlug?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 中间件配置
```typescript
// middleware.ts
export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/([\\w-]+)?/users/(.+)'
  ]
};
```

## 关键依赖与配置

### Next.js 配置
```typescript
// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default withNextIntl(nextConfig);
```

### 国际化配置
```typescript
// src/i18n/config.ts
export const locales = ['zh', 'en'] as const;
export const defaultLocale: Locale = 'en';

// src/i18n/request.ts  
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { locales } from './config';

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound();
  
  return {
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
```

### Prisma 数据库客户端
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

## 关键依赖与配置

### 核心依赖
```json
{
  "next": "15.5.2",                    // Next.js框架
  "next-intl": "^4.3.5",             // 国际化支持
  "@prisma/client": "^6.15.0",       // 数据库ORM
  "zod": "^4.1.5",                   // API数据验证
  "nanoid": "^5.1.5",               // ID生成器
  "react": "19.1.0",                // React核心
  "react-dom": "19.1.0"             // React DOM
}
```

### TypeScript 配置
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    "plugins": [{ "name": "next" }]
  }
}
```

## 数据模型

### API 验证模式 (Zod Schema)
```typescript
// src/app/api/notes/route.ts
const createNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  language: z.enum(['en', 'zh']),
  isPublic: z.boolean().default(false),
  customSlug: z.string()
    .min(1)
    .max(50)
    .regex(/^[a-zA-Z0-9-_]+$/)
    .optional()
});

const updateNoteSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  content: z.string(),
  language: z.enum(['en', 'zh']),
  isPublic: z.boolean().default(false),
  customSlug: z.string()
    .min(1)
    .max(50)
    .regex(/^[a-zA-Z0-9-_]+$/)
    .optional()
});
```

### 国际化路由模型
```typescript
// 支持的路由模式
type LocaleRoute = 
  | '/en/'           // 英文首页
  | '/zh/'           // 中文首页  
  | '/en/share/[token]'    // 英文分享页面
  | '/zh/share/[token]'    // 中文分享页面

// 自动重定向规则
'/' → '/en/'                    // 根路径重定向到默认语言
'/share/[token]' → '/en/share/[token]'  // 无语言前缀自动加上
```

### 错误响应模型
```typescript
interface ApiErrorResponse {
  error: string;
  details?: any;
  status: 400 | 404 | 409 | 500;
}

// 常见错误类型
type ApiError = 
  | 'Invalid data'           // 400 - Zod验证失败
  | 'Note not found'         // 404 - 笔记不存在
  | 'Custom URL is already taken'  // 409 - 自定义URL冲突
  | 'Internal server error'  // 500 - 服务器错误
```

## 测试与质量

### 当前状态: ⚠️ 缺少测试覆盖

**急需的测试用例:**

#### API 路由测试
```typescript
// __tests__/api/notes.test.ts
describe('/api/notes', () => {
  describe('POST /api/notes', () => {
    it('应当成功创建新笔记', async () => {});
    it('应当验证必需字段', async () => {});
    it('应当处理自定义slug冲突', async () => {});
    it('应当生成分享token', async () => {});
  });

  describe('PUT /api/notes', () => {
    it('应当成功更新现有笔记', async () => {});
    it('应当返回404如果笔记不存在', async () => {});
    it('应当处理slug更新冲突', async () => {});
  });

  describe('DELETE /api/notes', () => {
    it('应当成功删除笔记', async () => {});
    it('应当要求id参数', async () => {});
  });
});

// __tests__/api/notes/share.test.ts  
describe('/api/notes/share/[token]', () => {
  it('应当返回公开的分享笔记', async () => {});
  it('应当支持自定义slug访问', async () => {});
  it('应当返回404如果笔记不存在', async () => {});
  it('应当返回404如果笔记不是公开的', async () => {});
});
```

#### 页面渲染测试
```typescript
// __tests__/pages/page.test.tsx
describe('HomePage', () => {
  it('应当正确渲染中文页面', async () => {});
  it('应当正确渲染英文页面', async () => {});
  it('应当显示新建笔记按钮', async () => {});
});

// __tests__/pages/share/[token].test.tsx
describe('SharePage', () => {
  it('应当显示分享的笔记内容', async () => {});
  it('应当显示404如果token无效', async () => {});
  it('应当支持自定义slug', async () => {});
});
```

#### 中间件测试
```typescript
// __tests__/middleware.test.ts
describe('Middleware', () => {
  it('应当重定向根路径到默认语言', async () => {});
  it('应当保持有效的语言路径', async () => {});
  it('应当处理无效的语言代码', async () => {});
});
```

## 常见问题 (FAQ)

### Q: 如何添加新的语言支持？
A: 
1. 在 `src/i18n/config.ts` 中添加新的 locale
2. 创建对应的 `src/messages/[locale].json` 文件
3. 更新 API 验证 schema 中的语言枚举

### Q: 自定义分享链接的冲突如何处理？
A: API 会检查 customSlug 的唯一性，如果冲突返回 409 状态码。前端可以自动添加后缀重试。

### Q: 如何优化 API 响应性能？
A: 
1. 为 shareToken 和 customSlug 字段添加数据库索引
2. 实现 Redis 缓存层
3. 使用 Next.js 的 API 路由缓存

### Q: 国际化路由的 SEO 如何优化？
A: 
1. 使用 `next-intl` 的 `alternate` hreflang 标签
2. 为每个语言版本生成独立的 sitemap
3. 确保正确的 canonical URL 设置

### Q: 如何处理大量并发的笔记创建？
A: 
1. 实现 API 速率限制
2. 使用数据库连接池
3. 考虑队列系统处理批量操作

## 相关文件清单

### 页面组件
```
src/app/
├── [locale]/
│   ├── page.tsx              # 主页面 (594行)
│   ├── layout.tsx            # 根布局
│   └── share/[token]/
│       └── page.tsx          # 分享页面
├── api/
│   └── notes/
│       ├── route.ts          # CRUD API (166行)  
│       └── share/[token]/
│           └── route.ts      # 分享API
├── globals.css               # 全局样式
├── favicon.ico               # 网站图标
└── not-found.tsx            # 404页面
```

### 配置文件
```
./
├── next.config.ts           # Next.js配置
├── middleware.ts            # 路由中间件
├── tsconfig.json           # TypeScript配置
└── src/
    ├── i18n/
    │   ├── config.ts       # 国际化配置
    │   ├── index.ts        # i18n导出
    │   └── request.ts      # 请求配置
    └── messages/
        ├── en.json         # 英文文案
        └── zh.json         # 中文文案
```

## 变更记录 (Changelog)

### 2025-09-03 当前版本
- ✅ **Next.js 15 App Router**: 最新路由架构，支持 RSC 和并行路由
- ✅ **国际化路由**: 完整的中英文路由支持，自动重定向和语言检测
- ✅ **RESTful API**: 标准的笔记 CRUD 操作，Zod 验证和错误处理
- ✅ **自定义分享**: 支持 token 和自定义 slug 两种分享方式
- ✅ **TypeScript 严格模式**: 完整的类型安全和编译时检查
- ✅ **Prisma 集成**: 类型安全的数据库操作和查询
- ✅ **中间件支持**: 路由级别的请求处理和重定向

### 计划改进
- [ ] **API 安全**: 实现速率限制、CSRF 保护和请求验证
- [ ] **缓存策略**: Redis 缓存层和 CDN 集成
- [ ] **错误监控**: Sentry 集成和错误日志收集
- [ ] **性能优化**: API 响应缓存和数据库查询优化
- [ ] **更多语言**: 扩展支持更多语言和地区

---

> 🔒 **安全提示**: 在生产环境中确保配置适当的 CORS 策略、请求验证和错误处理
> 
> 📊 **监控建议**: 建议集成 APM 工具监控 API 性能和错误率，设置告警阈值