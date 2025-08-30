[根目录](../CLAUDE.md) > **prisma**

# prisma 模块 - 数据库模型与配置

## 变更记录 (Changelog)

- **2025-08-30 08:02:13** - 初始化 prisma 模块文档，分析数据库架构

## 模块职责

prisma 目录包含数据库模式定义、迁移文件，负责 PostgreSQL 数据库的结构管理和 ORM 客户端生成。提供类型安全的数据库访问接口。

## 入口与启动

### 主要文件
- **数据模式**: `schema.prisma` - 数据库表结构和关系定义
- **生成的客户端**: 通过 `npx prisma generate` 在 `node_modules/@prisma/client` 生成
- **迁移目录**: `migrations/` (暂未创建，建议在生产环境使用)

### 数据库连接
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 对外接口

### 数据模型定义
```prisma
model Note {
  id          String   @id @default(cuid())
  title       String
  content     String
  language    String   @default("en") // "en" or "zh"
  isPublic    Boolean  @default(false)
  shareToken  String?  @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("notes")
}
```

### 生成的 TypeScript 类型
```typescript
// 自动生成的类型
export interface Note {
  id: string
  title: string
  content: string
  language: string
  isPublic: boolean
  shareToken: string | null
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

### Note 表结构
| 字段 | 类型 | 约束 | 描述 |
|------|------|------|------|
| id | String | PK, cuid() | 主键，自动生成 |
| title | String | NOT NULL | 笔记标题 |
| content | String | NOT NULL | 笔记内容 |
| language | String | DEFAULT "en" | 语言标识 |
| isPublic | Boolean | DEFAULT false | 是否公开分享 |
| shareToken | String | UNIQUE, NULL | 分享令牌 |
| createdAt | DateTime | DEFAULT now() | 创建时间 |
| updatedAt | DateTime | AUTO UPDATE | 更新时间 |

### 索引优化建议
```prisma
model Note {
  // ... 字段定义
  
  @@index([shareToken])    // 分享查询优化
  @@index([createdAt])     // 时间排序优化
  @@index([isPublic])      // 公开笔记查询
}
```

## 测试与质量

### 当前状态
- ✅ **Schema 验证** - Prisma 自动验证数据模式
- ⚠️ **缺少种子数据** - 建议添加 `prisma/seed.ts`
- ⚠️ **缺少迁移文件** - 建议使用 `prisma migrate` 管理版本

### 建议改进
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 创建测试数据
  const testNote = await prisma.note.create({
    data: {
      title: 'Welcome Note',
      content: 'Welcome to Online Notepad!',
      language: 'en',
      isPublic: true,
      shareToken: 'welcome123'
    }
  })
}
```

## 常见问题 (FAQ)

### Q: 如何添加新字段？
A: 1. 修改 `schema.prisma`，2. 运行 `npx prisma db push`，3. 运行 `npx prisma generate`

### Q: 如何处理数据迁移？
A: 使用 `npx prisma migrate dev --name migration_name` 创建迁移文件

### Q: 如何查看数据库内容？
A: 运行 `npx prisma studio` 打开可视化界面

### Q: shareToken 字段为什么可为空？
A: 只有公开分享的笔记才需要 shareToken，私有笔记保持为 null 以节省存储

## 相关文件清单

### 当前结构
```
prisma/
└── schema.prisma          # 数据库模式定义
```

### 建议补充
```
prisma/
├── schema.prisma         # 数据库模式定义
├── seed.ts              # 种子数据脚本
└── migrations/          # 迁移文件目录
    └── [timestamp]_[name]/
        └── migration.sql
```

### 常用命令
```bash
# 同步开发数据库
npx prisma db push

# 生成客户端
npx prisma generate

# 创建迁移文件
npx prisma migrate dev

# 查看数据库
npx prisma studio

# 重置数据库
npx prisma migrate reset
```

### 性能考虑
- **连接池**: 在生产环境配置适当的连接池大小
- **查询优化**: 使用 `select` 指定需要的字段
- **批量操作**: 使用 `createMany` 和 `updateMany` 提高效率
- **事务处理**: 使用 `$transaction` 保证数据一致性