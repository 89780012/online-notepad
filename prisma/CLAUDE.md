[根目录](../CLAUDE.md) > **prisma**

# prisma/ - 数据库模型模块

## 变更记录 (Changelog)

- **2025-09-03 10:14:14** - 架构师全面更新：完善数据模型分析、新增性能优化建议、扩展测试策略、补充迁移管理指南
- **2025-09-01 21:06:33** - 数据模型重要更新：新增 customSlug 字段，支持用户自定义分享链接
- **2025-08-30 08:02:13** - 初始化 prisma 模块文档，分析数据库架构

## 模块职责

prisma 目录包含数据库相关的所有配置和定义，负责数据库 schema 管理、数据模型定义、数据库迁移历史。使用 Prisma ORM 提供类型安全的数据库操作，支持 PostgreSQL 数据库，实现笔记的完整 CRUD 功能和高级分享特性。

## 入口与启动

### 核心文件
- **schema.prisma** - 数据库 schema 定义文件
- **migrations/** - 数据库迁移历史记录
- **migration_lock.toml** - 迁移锁定文件

### 数据库配置
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 环境要求
- PostgreSQL 12+
- Node.js 20+
- 环境变量: `DATABASE_URL`

## 对外接口

### 数据模型定义
```prisma
model Note {
  id           String   @id @default(cuid())
  title        String
  content      String
  language     String   @default("en") // "en" or "zh"
  isPublic     Boolean  @default(false)
  shareToken   String?  @unique
  customSlug   String?  @unique // 用户自定义的分享URL后缀
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@map("notes")
}
```

### 生成的 TypeScript 类型
```typescript
// 由 Prisma 自动生成的类型
interface Note {
  id: string;
  title: string;
  content: string;
  language: string;
  isPublic: boolean;
  shareToken: string | null;
  customSlug: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// 创建数据输入类型
interface NoteCreateInput {
  title: string;
  content: string;
  language?: string;
  isPublic?: boolean;
  shareToken?: string | null;
  customSlug?: string | null;
}

// 更新数据输入类型
interface NoteUpdateInput {
  title?: string;
  content?: string;
  language?: string;
  isPublic?: boolean;
  shareToken?: string | null;
  customSlug?: string | null;
}
```

## 关键依赖与配置

### 核心依赖
- **@prisma/client**: ^6.15.0 - 数据库客户端
- **prisma**: ^6.15.0 - CLI 工具和生成器

### 客户端配置
- 位置: `src/lib/prisma.ts`
- 单例模式确保连接复用
- 适配开发和生产环境

## 数据模型详解

### Note 表结构
| 字段 | 类型 | 约束 | 描述 |
|------|------|------|------|
| id | String | PK, CUID | 主键，自动生成 |
| title | String | NOT NULL | 笔记标题 |
| content | String | NOT NULL | 笔记内容 |
| language | String | DEFAULT "en" | 语言标识 (en/zh) |
| isPublic | Boolean | DEFAULT false | 是否公开分享 |
| shareToken | String | UNIQUE, NULL | 分享令牌（自动生成） |
| customSlug | String | UNIQUE, NULL | 用户自定义分享后缀 |
| createdAt | DateTime | DEFAULT now() | 创建时间 |
| updatedAt | DateTime | AUTO UPDATE | 更新时间 |

### 字段特性

#### customSlug 字段
- **用途**: 用户友好的自定义分享链接
- **格式**: 1-50字符，仅字母数字连字符下划线
- **唯一性**: 全局唯一约束
- **优先级**: 分享时优先于 shareToken

#### 索引设计
```sql
-- 建议的数据库索引
CREATE INDEX idx_notes_share_token ON notes(share_token);
CREATE INDEX idx_notes_custom_slug ON notes(custom_slug);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_notes_public ON notes(is_public) WHERE is_public = true;
CREATE INDEX idx_notes_language ON notes(language);
```

## 业务逻辑

### 分享链接解析
```typescript
async function findNoteByToken(token: string) {
  // 优先通过 customSlug 查找
  let note = await prisma.note.findUnique({
    where: { customSlug: token }
  });
  
  // 回退到 shareToken
  if (!note) {
    note = await prisma.note.findUnique({
      where: { shareToken: token }
    });
  }
  
  return note;
}
```

### 笔记创建流程
```typescript
async function createNoteWithValidation(data: NoteCreateInput) {
  // 验证 customSlug 唯一性
  if (data.customSlug) {
    const existing = await prisma.note.findUnique({
      where: { customSlug: data.customSlug }
    });
    if (existing) {
      throw new Error('Custom URL is already taken');
    }
  }
  
  // 生成 shareToken
  const shareToken = data.isPublic ? nanoid(10) : null;
  
  return prisma.note.create({
    data: {
      ...data,
      shareToken,
      customSlug: data.isPublic ? data.customSlug : null
    }
  });
}
```

## 迁移管理

### 迁移历史
- **20250829152647_init** - 初始数据库结构
  - 创建 notes 表
  - 基本字段和约束
  - customSlug 字段支持

### 迁移命令
```bash
# 创建新迁移（开发环境）
npx prisma migrate dev --name description

# 应用迁移（生产环境）
npx prisma migrate deploy

# 重置数据库（仅开发）
npx prisma migrate reset

# 查看迁移状态
npx prisma migrate status
```

### 迁移最佳实践
1. 每次 schema 变更都创建迁移
2. 迁移文件纳入版本控制
3. 生产环境迁移前备份数据
4. 测试迁移的回滚策略

## 性能优化

### 查询优化
```typescript
// 优化：只查询必要字段
const publicNotes = await prisma.note.findMany({
  where: { isPublic: true },
  select: {
    id: true,
    title: true,
    customSlug: true,
    shareToken: true,
    createdAt: true
  },
  orderBy: { createdAt: 'desc' },
  take: 20
});

// 批量操作
const notes = await prisma.note.createMany({
  data: noteArray,
  skipDuplicates: true
});
```

### 连接池配置
```env
DATABASE_URL="postgresql://user:password@host:5432/db?connection_limit=20&pool_timeout=20&connect_timeout=10"
```

### 缓存策略
- 公开笔记的 Redis 缓存
- 分享页面的 HTTP 缓存
- Next.js ISR 静态生成

## 测试与质量

**当前状态**: ⚠️ 缺少数据库测试

### 建议测试策略
```typescript
// 数据模型测试
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
    expect(note.shareToken).toBeTruthy();
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

### 数据完整性
```typescript
// 事务处理示例
const result = await prisma.$transaction(async (tx) => {
  const existing = await tx.note.findUnique({
    where: { customSlug: newSlug }
  });
  
  if (existing) throw new Error('Slug taken');
  
  return tx.note.create({
    data: noteData
  });
});
```

## 常见问题 (FAQ)

### Q: 如何修改数据库结构？
A: 1. 修改 `schema.prisma`；2. 运行 `npx prisma migrate dev` 创建迁移；3. 测试迁移文件

### Q: customSlug 和 shareToken 的区别？
A: customSlug 是用户自定义的友好链接，shareToken 是系统生成的安全令牌。分享时优先使用 customSlug

### Q: 如何处理大量数据？
A: 使用分页查询、批量操作、合适的索引，考虑数据库分片

### Q: 如何备份数据？
A: 使用 `pg_dump` 工具备份 PostgreSQL 数据，定期备份到云存储

### Q: 如何监控数据库性能？
A: 使用 Prisma 的查询日志，监控慢查询，配置数据库性能监控工具

## 相关文件清单

### 当前结构 (4 文件)
```
prisma/
├── schema.prisma              # 数据库 schema 定义
├── migrations/
│   ├── 20250829152647_init/
│   │   └── migration.sql      # 初始迁移 SQL
│   └── migration_lock.toml    # 迁移锁定文件
└── CLAUDE.md                  # 模块文档
```

### 建议扩展
```
prisma/
├── schema.prisma              # 数据库模式
├── seed.ts                    # 种子数据脚本
├── migrations/                # 迁移目录
├── __tests__/                # 数据库测试
│   └── models/
│       └── note.test.ts       # Note 模型测试
└── scripts/                   # 数据库脚本
    ├── backup.ts             # 备份脚本
    └── cleanup.ts            # 清理脚本
```

### 常用命令
```bash
# 开发环境
npx prisma db push          # 快速同步
npx prisma generate         # 生成客户端
npx prisma studio          # 可视化界面

# 生产环境
npx prisma migrate deploy   # 应用迁移
npx prisma db seed         # 运行种子数据

# 维护命令
npx prisma migrate reset    # 重置（仅开发）
npx prisma migrate status   # 迁移状态
npx prisma db pull         # 从数据库反向生成
```

### 监控和维护
1. **查询性能**: 监控慢查询日志
2. **连接池**: 监控数据库连接数
3. **存储空间**: 定期清理和优化
4. **备份策略**: 定期自动备份
5. **安全更新**: 保持 Prisma 版本更新