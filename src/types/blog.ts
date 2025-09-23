// 博客相关类型定义

export interface BlogPostArgument {
  introduce: string;
  title: string;
  content: string; // markdown 内容
}

export interface BlogPostData {
  title: string;
  description: string;
  keywords: string;
  argument: BlogPostArgument[];
}

// n8n 提交的数据格式
export interface BlogPostCreateInput extends BlogPostData {
  status?: 'draft' | 'published';
}

// API 响应类型
export interface BlogPostSummary {
  id: string;
  title: string;
  excerpt?: string; // 文章摘要
  description?: string; // 为了向后兼容保留
  slug: string;
  status?: string;
  coverImage?: string | null;
  publishedAt: string | null;
  readingTime?: number;
  tags?: string[];
  createdAt?: string;
  author?: {
    name: string;
    avatar?: string | null;
  };
}

export interface BlogPostDetail extends BlogPostSummary {
  keywords: string;
  content: BlogPostArgument[];
  updatedAt: string;
}

// API 响应格式
export interface BlogListResponse {
  blogs: BlogPostSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BlogDetailResponse {
  blog: BlogPostDetail;
}

// 内部处理用的完整类型（对应 Prisma 生成的类型）
export interface BlogPost {
  id: string;
  title: string;
  description: string;
  keywords: string;
  slug: string;
  content: BlogPostArgument[]; // JSON 字段解析后的类型
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}