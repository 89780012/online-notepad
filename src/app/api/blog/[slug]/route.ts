import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { BlogDetailResponse, BlogPostArgument } from '@/types/blog';

// 验证更新博客的输入数据
const UpdateBlogSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  keywords: z.string().optional(),
  argument: z.array(z.object({
    introduce: z.string(),
    title: z.string(),
    content: z.string()
  })).optional(),
  status: z.enum(['draft', 'published']).optional()
});

// GET /api/blog/[slug] - 获取单个博客
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const blogPost = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (!blogPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // 只返回已发布的博客给公众
    if (blogPost.status !== 'published') {
      return NextResponse.json(
        { error: 'Blog post not available' },
        { status: 404 }
      );
    }

    const response: BlogDetailResponse = {
      blog: {
        id: blogPost.id,
        title: blogPost.title,
        description: blogPost.description,
        keywords: blogPost.keywords,
        slug: blogPost.slug,
        content: JSON.parse(blogPost.content) as BlogPostArgument[], // JSON 字符串解析为 BlogPostArgument[]
        status: blogPost.status,
        publishedAt: blogPost.publishedAt?.toISOString() || null,
        createdAt: blogPost.createdAt.toISOString(),
        updatedAt: blogPost.updatedAt.toISOString()
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get blog error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// PUT /api/blog/[slug] - 更新博客
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    // 验证输入数据
    const validatedData = UpdateBlogSchema.parse(body);

    // 检查博客是否存在
    const existingBlog = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (!existingBlog) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // 准备更新数据
    const baseUpdateData: {
      title?: string;
      description?: string;
      keywords?: string;
      status?: string;
      content?: string;
    } = {
      title: validatedData.title,
      description: validatedData.description,
      keywords: validatedData.keywords,
      status: validatedData.status,
    };

    // 只有当 argument 存在时才更新 content 字段
    if (validatedData.argument) {
      baseUpdateData.content = JSON.stringify(validatedData.argument);
    }

    // 如果状态改为 published 且之前不是，设置 publishedAt
    const updateData = validatedData.status === 'published' && existingBlog.status !== 'published'
      ? { ...baseUpdateData, publishedAt: new Date() }
      : baseUpdateData;

    const updatedBlog = await prisma.blogPost.update({
      where: { slug },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      blog: {
        id: updatedBlog.id,
        title: updatedBlog.title,
        description: updatedBlog.description,
        keywords: updatedBlog.keywords,
        slug: updatedBlog.slug,
        content: updatedBlog.content,
        status: updatedBlog.status,
        publishedAt: updatedBlog.publishedAt?.toISOString() || null,
        createdAt: updatedBlog.createdAt.toISOString(),
        updatedAt: updatedBlog.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Update blog error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE /api/blog/[slug] - 删除博客
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 检查博客是否存在
    const existingBlog = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (!existingBlog) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    await prisma.blogPost.delete({
      where: { slug }
    });

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully'
    });

  } catch (error) {
    console.error('Delete blog error:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}