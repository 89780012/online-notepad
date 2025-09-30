import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { BlogPostSummary } from '@/types/blog';

// GET /api/blog/[slug]/related - 获取相关文章
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');

    // 首先获取当前文章的信息
    const currentPost = await prisma.blogPost.findUnique({
      where: { slug },
      select: {
        id: true,
        keywords: true,
        title: true
      }
    });

    if (!currentPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // 获取相关文章的策略：
    // 1. 基于关键词匹配
    // 2. 最近发布的文章
    // 3. 排除当前文章
    const currentKeywords = currentPost.keywords ? 
      currentPost.keywords.split(',').map(k => k.trim().toLowerCase()) : [];
    
    let relatedPosts: Array<{
      id: string;
      title: string;
      description: string;
      slug: string;
      publishedAt: Date | null;
      keywords: string;
    }> = [];

    if (currentKeywords.length > 0) {
      // 基于关键词查找相关文章
      const keywordConditions = currentKeywords.map(keyword => ({
        keywords: {
          contains: keyword,
          mode: 'insensitive' as const
        }
      }));

      relatedPosts = await prisma.blogPost.findMany({
        where: {
          AND: [
            { id: { not: currentPost.id } }, // 排除当前文章
            { status: 'published' }, // 只显示已发布的
            {
              OR: keywordConditions
            }
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
          publishedAt: true,
          keywords: true
        },
        orderBy: [
          { publishedAt: 'desc' }
        ],
        take: limit
      });
    }

    // 如果基于关键词的相关文章不够，补充最新文章
    if (relatedPosts.length < limit) {
      const additionalPosts = await prisma.blogPost.findMany({
        where: {
          AND: [
            { id: { not: currentPost.id } },
            { status: 'published' },
            { id: { notIn: relatedPosts.map(p => p.id) } } // 排除已选中的
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
          publishedAt: true,
          keywords: true
        },
        orderBy: {
          publishedAt: 'desc'
        },
        take: limit - relatedPosts.length
      });

      relatedPosts = [...relatedPosts, ...additionalPosts];
    }

    // 格式化响应数据
    const formattedPosts: BlogPostSummary[] = relatedPosts.map(post => ({
      id: post.id,
      title: post.title,
      description: post.description,
      excerpt: post.description,
      slug: post.slug,
      publishedAt: post.publishedAt?.toISOString() || null,
      tags: post.keywords ? post.keywords.split(',').map((k: string) => k.trim()) : []
    }));

    return NextResponse.json({
      related: formattedPosts,
      total: formattedPosts.length
    });

  } catch (error) {
    console.error('Get related posts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related posts' },
      { status: 500 }
    );
  }
}
