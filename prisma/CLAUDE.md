[根目录](../CLAUDE.md) > **prisma**

# prisma 模块 - 数据库模型与配置

## 变更记录 (Changelog)

- **2025-09-01 21:06:33** - 数据模型重要更新：新增 customSlug 字段，支持用户自定义分享链接
- **2025-08-30 08:02:13** - 初始化 prisma 模块文档，分析数据库架构

## 模块职责

prisma 目录包含数据库模式定义、迁移文件，负责 PostgreSQL 数据库的结构管理和 ORM 客户端生成。提供类型安全的数据库访问接口，支持笔记的基本 CRUD 操作以及高级分享功能。

## 入口与启动

### 主要文件
- **数据模式**: `schema.prisma` - 数据库表结构和关系定义，包含最新的 customSlug 字段
- **生成的客户端**: 通过 `npx prisma generate` 在 `node_modules/@prisma/client` 生成
- **迁移目录**: `migrations/` - 包含数据库结构变更历史

### 数据库连接
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 对外接口

### 数据模型定义 (最新版本)
```prisma
model Note {
  id          String   @id @default(cuid())
  title       String
  content     String
  language    String   @default("en") // "en" or "zh"
  isPublic    Boolean  @default(false)
  shareToken  String?  @unique
  customSlug  String?  @unique        // 新增：用户自定义分享URL后缀
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("notes")
}
```

### 生成的 TypeScript 类型
```typescript
// 自动生成的完整类型
export interface Note {
  id: string
  title: string
  content: string
  language: string
  isPublic: boolean
  shareToken: string | null
  customSlug: string | null    // 新增字段
  createdAt: Date
  updatedAt: Date
}

// 创建数据类型
export interface NoteCreateInput {
  id?: string
  title: string
  content: string
  language?: string
  isPublic?: boolean
  shareToken?: string | null
  customSlug?: string | null   // 支持自定义链接
}

// 更新数据类型
export interface NoteUpdateInput {
  title?: string
  content?: string
  language?: string
  isPublic?: boolean
  shareToken?: string | null
  customSlug?: string | null   // 支持更新自定义链接
}
```

## 关键依赖与配置

### 核心依赖
```json
{
  "@prisma/client": "^6.15.0",
  "prisma": "^6.15.0"
}
```

### 客户端配置
```prisma
generator client {
  provider = "prisma-client-js"
}
```

### 环境配置
- `DATABASE_URL`: PostgreSQL 连接字符串
- 开发环境: 本地 PostgreSQL 实例
- 生产环境: 云端 PostgreSQL (如 Vercel Postgres, PlanetScale)

## 数据模型

### Note 表结构 (更新版本)
| 字段 | 类型 | 约束 | 描述 |
|------|------|------|------|
| id | String | PK, cuid() | 主键，自动生成 |
| title | String | NOT NULL | 笔记标题 |
| content | String | NOT NULL | 笔记内容 |
| language | String | DEFAULT "en" | 语言标识 |
| isPublic | Boolean | DEFAULT false | 是否公开分享 |
| shareToken | String | UNIQUE, NULL | 分享令牌（随机生成） |
| **customSlug** | **String** | **UNIQUE, NULL** | **用户自定义分享链接后缀** |
| createdAt | DateTime | DEFAULT now() | 创建时间 |
| updatedAt | DateTime | AUTO UPDATE | 更新时间 |

### 字段详细说明

#### customSlug 新增字段
- **用途**: 允许用户自定义分享链接的后缀部分
- **限制**: 1-50 字符，只允许字母、数字、连字符和下划线
- **唯一性**: 全局唯一约束，防止冲突
- **可选性**: 可为 null，不是必填字段
- **分享逻辑**: 优先使用 customSlug，fallback 到 shareToken

### 索引优化建议
```prisma
model Note {
  // ... 字段定义
  
  @@index([shareToken])    // 分享查询优化
  @@index([customSlug])    // 新增：自定义链接查询优化
  @@index([createdAt])     // 时间排序优化
  @@index([isPublic])      // 公开笔记查询
  @@index([language])      // 语言过滤优化
}
```

## 业务逻辑与查询模式

### 分享链接解析逻辑
```typescript
// 在 API 中的查询逻辑
async function findNoteByToken(token: string) {
  // 首先尝试通过 customSlug 查找
  let note = await prisma.note.findUnique({
    where: { customSlug: token }
  });
  
  // 如果没找到，再尝试通过 shareToken 查找
  if (!note) {
    note = await prisma.note.findUnique({
      where: { shareToken: token }
    });
  }
  
  return note;
}
```

### 创建笔记的完整流程
```typescript
async function createNote(data: NoteCreateInput) {
  // 1. 检查 customSlug 是否已被使用
  if (data.customSlug) {
    const existing = await prisma.note.findUnique({
      where: { customSlug: data.customSlug }
    });
    if (existing) {
      throw new Error('Custom URL is already taken');
    }
  }
  
  // 2. 生成 shareToken（如果是公开笔记）
  const shareToken = data.isPublic ? nanoid(10) : null;
  
  // 3. 创建笔记
  return prisma.note.create({
    data: {
      ...data,
      shareToken,
      customSlug: data.isPublic ? data.customSlug : null
    }
  });
}
```

## 测试与质量

### 当前状态
- ✅ **Schema 验证** - Prisma 自动验证数据模式
- ✅ **迁移文件** - 已存在迁移历史
- ⚠️ **缺少种子数据** - 建议添加 `prisma/seed.ts`
- ⚠️ **缺少数据库测试** - 建议添加集成测试

### 建议改进

#### 种子数据脚本
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

async function main() {
  // 创建示例笔记
  const welcomeNote = await prisma.note.create({
    data: {
      title: 'Welcome to Online Notepad',
      content: '这是一个示例笔记，展示我们的功能！',
      language: 'zh',
      isPublic: true,
      shareToken: nanoid(10),
      customSlug: 'welcome'
    }
  })
  
  // 创建英文示例
  const englishNote = await prisma.note.create({
    data: {
      title: 'Getting Started',
      content: 'This is your first note. You can edit, save, and share it!',
      language: 'en',
      isPublic: true,
      shareToken: nanoid(10),
      customSlug: 'getting-started'
    }
  })
  
  console.log({ welcomeNote, englishNote })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
```

#### 数据库测试建议
```typescript
// __tests__/prisma/note.test.ts
describe('Note Model', () => {
  test('should create note with customSlug', async () => {
    const note = await prisma.note.create({
      data: {
        title: 'Test Note',
        content: 'Test Content',
        isPublic: true,
        customSlug: 'test-note'
      }
    });
    
    expect(note.customSlug).toBe('test-note');
  });
  
  test('should enforce customSlug uniqueness', async () => {
    await prisma.note.create({
      data: { title: 'Note 1', content: 'Content', customSlug: 'unique' }
    });
    
    await expect(
      prisma.note.create({
        data: { title: 'Note 2', content: 'Content', customSlug: 'unique' }
      })
    ).rejects.toThrow();
  });
  
  test('should find note by customSlug or shareToken', async () => {
    const note = await prisma.note.create({
      data: {
        title: 'Findable Note',
        content: 'Content',
        isPublic: true,
        customSlug: 'findable',
        shareToken: 'abc123'
      }
    });
    
    const foundBySlug = await prisma.note.findUnique({
      where: { customSlug: 'findable' }
    });
    
    const foundByToken = await prisma.note.findUnique({
      where: { shareToken: 'abc123' }
    });
    
    expect(foundBySlug?.id).toBe(note.id);
    expect(foundByToken?.id).toBe(note.id);
  });
});
```

## 常见问题 (FAQ)

### Q: 如何添加新字段？
A: 1. 修改 `schema.prisma`，2. 运行 `npx prisma db push` (开发) 或 `npx prisma migrate dev` (生产)，3. 运行 `npx prisma generate`

### Q: customSlug 和 shareToken 的区别？
A: 
- `shareToken`: 系统自动生成的10位随机字符串，保证安全性
- `customSlug`: 用户自定义的友好链接，便于记忆和分享
- 两者都可以用于分享链接，customSlug 优先级更高

### Q: 如何处理数据迁移？
A: 
- 开发环境：使用 `npx prisma db push` 直接同步
- 生产环境：使用 `npx prisma migrate deploy` 应用迁移

### Q: 如何查看数据库内容？
A: 运行 `npx prisma studio` 打开可视化界面

### Q: customSlug 的验证规则是什么？
A: 
- 长度：1-50 字符
- 字符集：字母、数字、连字符(-)、下划线(_)
- 唯一性：全局唯一
- 正则表达式：`/^[a-zA-Z0-9-_]+$/`

### Q: 如何优化查询性能？
A: 
1. 为常用查询字段添加索引
2. 使用 `select` 只查询需要的字段
3. 使用连接池配置
4. 考虑读写分离

## 相关文件清单

### 当前结构
```
prisma/
├── schema.prisma                    # 数据库模式定义
├── migrations/
│   ├── migration_lock.toml          # 迁移锁定文件
│   └── 20250829152647_init/
│       └── migration.sql            # 初始化迁移
└── CLAUDE.md                        # 本文档
```

### 建议补充
```
prisma/
├── schema.prisma                    # 数据库模式定义
├── seed.ts                         # 种子数据脚本
├── migrations/                     # 迁移文件目录
│   ├── migration_lock.toml         # 迁移锁定
│   ├── 20250829152647_init/        # 初始化迁移
│   └── [new_migrations]/           # 新增迁移
└── __tests__/                      # 数据库测试
    └── models/
        └── note.test.ts            # Note 模型测试
```

### 常用命令
```bash
# 开发环境同步
npx prisma db push

# 生成客户端
npx prisma generate

# 创建迁移文件
npx prisma migrate dev --name add_custom_slug

# 应用迁移（生产）
npx prisma migrate deploy

# 查看数据库
npx prisma studio

# 重置数据库
npx prisma migrate reset

# 运行种子数据
npx prisma db seed
```

### 性能优化考虑

#### 查询优化
```typescript
// 好的实践：只查询需要的字段
const publicNotes = await prisma.note.findMany({
  where: { isPublic: true },
  select: {
    id: true,
    title: true,
    customSlug: true,
    shareToken: true,
    createdAt: true
  }
});

// 批量操作
const notes = await prisma.note.createMany({
  data: noteArray,
  skipDuplicates: true
});
```

#### 连接池配置
```env
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/notepad?connection_limit=20&pool_timeout=20"
```

#### 缓存策略
- 对公开笔记考虑添加 Redis 缓存
- 使用 Next.js ISR 对静态内容进行缓存
- 为分享页面实现适当的 HTTP 缓存头

### 数据完整性

#### 约束检查
- `shareToken` 和 `customSlug` 的唯一性约束
- `isPublic` 与分享字段的业务逻辑一致性
- 字符长度和格式验证

#### 事务处理
```typescript
// 复杂操作使用事务
const result = await prisma.$transaction(async (tx) => {
  // 检查唯一性
  const existing = await tx.note.findUnique({
    where: { customSlug: newSlug }
  });
  
  if (existing) throw new Error('Slug taken');
  
  // 创建笔记
  return tx.note.create({
    data: noteData
  });
});
```