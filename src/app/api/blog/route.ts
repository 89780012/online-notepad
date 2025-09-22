import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { BlogPostCreateInput, BlogListResponse } from '@/types/blog';

// Slug 生成函数
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-') // 空格替换为连字符
    .replace(/-+/g, '-') // 多个连字符合并为一个
    .replace(/^-|-$/g, ''); // 移除开头和结尾的连字符
}

// 验证创建博客的输入数据
const CreateBlogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  keywords: z.string(),
  argument: z.array(z.object({
    introduce: z.string(),
    title: z.string(),
    content: z.string()
  })).min(1, 'At least one argument is required'),
  status: z.enum(['draft', 'published']).optional().default('draft')
});

// GET /api/blog - 获取博客列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const status = searchParams.get('status') || 'published';

    const skip = (page - 1) * pageSize;

    // 查询已发布的博客
    const [blogs, total] = await Promise.all([
      prisma.blogPost.findMany({
        where: {
          status: status
        },
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
          status: true,
          publishedAt: true,
          createdAt: true
        },
        orderBy: {
          publishedAt: 'desc'
        },
        skip,
        take: pageSize
      }),
      prisma.blogPost.count({
        where: {
          status: status
        }
      })
    ]);

    const response: BlogListResponse = {
      blogs: blogs.map(blog => ({
        ...blog,
        publishedAt: blog.publishedAt?.toISOString() || null,
        createdAt: blog.createdAt.toISOString()
      })),
      total,
      page,
      pageSize
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get blogs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

// POST /api/blog - 创建新博客
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as BlogPostCreateInput;

    // 验证输入数据
    const validatedData = CreateBlogSchema.parse(body);

    // 生成唯一的 slug
    const baseSlug = generateSlug(validatedData.title);
    let slug = baseSlug;
    let counter = 1;

    // 检查 slug 唯一性
    while (await prisma.blogPost.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 创建博客文章
    const blogPost = await prisma.blogPost.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        keywords: validatedData.keywords,
        slug,
        content: validatedData.argument,
        status: validatedData.status,
        publishedAt: validatedData.status === 'published' ? new Date() : null
      }
    });

    return NextResponse.json({
      success: true,
      blog: {
        id: blogPost.id,
        title: blogPost.title,
        description: blogPost.description,
        slug: blogPost.slug,
        status: blogPost.status,
        publishedAt: blogPost.publishedAt?.toISOString() || null,
        createdAt: blogPost.createdAt.toISOString()
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create blog error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}