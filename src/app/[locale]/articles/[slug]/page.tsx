import { Metadata } from 'next';
import { getTranslations, getLocale  } from 'next-intl/server';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, User, List,  ChevronRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface ArticleMeta {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  date: string;
  lastmod: string;
  readingTime: string;
}

interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

async function getArticleContent(slug: string, locale: string): Promise<{ content: string; meta: ArticleMeta; toc: TableOfContentsItem[] } | null> {
  try {
    const filePath = join(process.cwd(), 'content', 'seo', 'articles', `${slug}-${locale}.md`);

    if (!existsSync(filePath)) {
      return null;
    }

    const fileContent = readFileSync(filePath, 'utf-8');

    // 解析 frontmatter
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = fileContent.match(frontmatterRegex);

    if (!match) {
      return null;
    }

    const [, frontmatter, content] = match;
    const meta: Record<string, string | string[]> = {};

    // 简单解析 YAML frontmatter
    frontmatter.split('\n').forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        // 移除引号
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        // 处理数组
        if (value.startsWith('[') && value.endsWith(']')) {
          meta[key] = value.slice(1, -1).split(',').map(item => item.trim().replace(/['"]/g, ''));
        } else {
          meta[key] = value;
        }
      }
    });

    // 生成目录
    const toc: TableOfContentsItem[] = [];
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    let match2;

    while ((match2 = headingRegex.exec(content)) !== null) {
      const level = match2[1].length;
      const text = match2[2].trim();
      const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');

      if (level <= 3) { // 只显示 H1-H3
        toc.push({
          id,
          text,
          level
        });
      }
    }

    return {
      content,
      toc,
      meta: {
        title: (meta.title as string) || '',
        description: (meta.description as string) || '',
        keywords: Array.isArray(meta.keywords) ? meta.keywords : [],
        author: (meta.author as string) || '',
        date: (meta.date as string) || '',
        lastmod: (meta.lastmod as string) || (meta.date as string) || '',
        readingTime: locale === 'zh' ? '约15分钟' : 'About 15 minutes'
      }
    };
  } catch (error) {
    console.error('Error reading article:', error);
    return null;
  }
}

// 获取所有文章用于导航
async function getAllArticles(locale: string) {
  try {
    const indexPath = join(process.cwd(), 'content', 'seo', 'articles', 'index.json');
    const indexContent = readFileSync(indexPath, 'utf-8');
    const index = JSON.parse(indexContent) as { articles: Array<{
      id: string;
      title: { zh: string; en: string; hi: string };
      description: { zh: string; en: string; hi: string };
      meta: { readingTime: { zh: string; en: string; hi: string } };
    }> };

    return index.articles.map((article) => ({
      id: article.id,
      title: article.title[locale as keyof typeof article.title] || article.title.en,
    }));
  } catch {
    return [];
  }
}

// 生成相关文章推荐
async function getRelatedArticles(currentSlug: string, locale: string) {
  try {
    const indexPath = join(process.cwd(), 'content', 'seo', 'articles', 'index.json');
    const indexContent = readFileSync(indexPath, 'utf-8');
    const index = JSON.parse(indexContent) as { articles: Array<{
      id: string;
      title: { zh: string; en: string; hi: string };
      description: { zh: string; en: string; hi: string };
      meta: { readingTime: { zh: string; en: string; hi: string } };
    }> };

    return index.articles
      .filter((article) => article.id !== currentSlug)
      .slice(0, 3)
      .map((article) => ({
        id: article.id,
        title: article.title[locale as keyof typeof article.title] || article.title.en,
        description: article.description[locale as keyof typeof article.description] || article.description.en,
        readingTime: article.meta.readingTime[locale as keyof typeof article.meta.readingTime] || article.meta.readingTime.en
      }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const article = await getArticleContent(slug, locale);

  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
    };
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'https://notepad.best';
  const articleUrl = `${baseUrl}/${locale}/articles/${slug}`;

  return {
    title: article.meta.title,
    description: article.meta.description,
    keywords: article.meta.keywords,
    authors: [{ name: article.meta.author }],
    openGraph: {
      title: article.meta.title,
      description: article.meta.description,
      url: articleUrl,
      siteName: 'Mini Notepad',
      locale: locale,
      type: 'article',
      publishedTime: article.meta.date,
      modifiedTime: article.meta.lastmod,
      authors: [article.meta.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.meta.title,
      description: article.meta.description,
    },
    alternates: {
      canonical: articleUrl,
      languages: {
        'zh': `${baseUrl}/zh/articles/${slug}`,
        'en': `${baseUrl}/en/articles/${slug}`,
      },
    },
    other: {
      'article:author': article.meta.author,
      'article:published_time': article.meta.date,
      'article:modified_time': article.meta.lastmod,
      'article:tag': article.meta.keywords.join(','),
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations();
  const article = await getArticleContent(slug, locale);
  const relatedArticles = await getRelatedArticles(slug, locale);
  const allArticles = await getAllArticles(locale);

  if (!article) {
    notFound();
  }

  const { content, meta, toc } = article;

  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/${locale}/articles`}>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {locale === 'zh' ? '文章列表' : 'Articles'}
                </Button>
              </Link>
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Link href={`/${locale}`} className="hover:text-foreground">Mini Notepad</Link>
                <ChevronRight className="h-3 w-3" />
                <Link href={`/${locale}/articles`} className="hover:text-foreground">
                  {locale === 'zh' ? '文章' : 'Articles'}
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground">{meta.title}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/${locale}`}>
                <Button variant="ghost" size="sm">
                  {t('backToApp')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* 左侧主要内容 */}
          <main className="flex-1 min-w-0">
            <article className="space-y-12">
              {/* 文章头部 */}
              <header className="space-y-8">
                {/* 主标题区域 */}
                <div className="text-center space-y-6 py-8 border-b border-border/50">
                  <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight max-w-4xl mx-auto">
                    {meta.title}
                  </h1>

                  <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                    {meta.description}
                  </p>
                </div>

                {/* 文章元信息 */}
                <div className="bg-card/50 rounded-lg p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 bg-background/50 px-3 py-2 rounded-full">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{meta.author}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-background/50 px-3 py-2 rounded-full">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(meta.date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-background/50 px-3 py-2 rounded-full">
                      <Clock className="h-4 w-4" />
                      <span>{meta.readingTime}</span>
                    </div>
                  </div>

                  {/* 关键词标签 */}
                  {meta.keywords.length > 0 && (
                    <div className="pt-4 border-t border-border/30">
                      <div className="flex flex-wrap justify-center gap-2">
                        {meta.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-primary/10 text-primary text-sm rounded-full font-medium hover:bg-primary/20 transition-colors"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </header>

              {/* 文章正文 */}
              <div className="bg-card/30 rounded-lg p-8 md:p-12">
                <div className="max-w-none space-y-6">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      h1: ({ children }) => {
                        const text = children?.toString() || '';
                        const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');
                        return (
                          <h1 id={id} className="group text-5xl font-bold mt-12 mb-8 text-foreground border-b border-border pb-4 leading-tight scroll-mt-24">
                            {children}
                            <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-50 transition-opacity text-primary text-lg">#</a>
                          </h1>
                        );
                      },
                      h2: ({ children }) => {
                        const text = children?.toString() || '';
                        const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');
                        return (
                          <h2 id={id} className="group text-3xl font-semibold mt-10 mb-6 text-foreground border-l-4 border-primary pl-4 leading-snug scroll-mt-24">
                            {children}
                            <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-50 transition-opacity text-primary text-base">#</a>
                          </h2>
                        );
                      },
                      h3: ({ children }) => {
                        const text = children?.toString() || '';
                        const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');
                        return (
                          <h3 id={id} className="group text-2xl font-medium mt-8 mb-4 text-primary/90 leading-normal pb-2 border-b border-border/30 border-dotted scroll-mt-24">
                            {children}
                            <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-50 transition-opacity text-primary text-sm">#</a>
                          </h3>
                        );
                      },
                      h4: ({ children }) => {
                        const text = children?.toString() || '';
                        const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');
                        return (
                          <h4 id={id} className="group text-xl font-medium mt-6 mb-3 text-muted-foreground leading-normal relative pl-6 scroll-mt-24 before:content-['▸'] before:absolute before:left-0 before:text-primary/60">
                            {children}
                            <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-50 transition-opacity text-primary text-sm">#</a>
                          </h4>
                        );
                      },
                      p: ({ children }) => (
                        <p className="text-foreground leading-8 mb-6 text-base">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="my-6 space-y-3 pl-6">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="my-6 space-y-3 pl-6">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-foreground leading-7 relative">
                          {children}
                        </li>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary/30 pl-6 py-4 my-8 bg-muted/50 rounded-r-lg text-muted-foreground italic">
                          {children}
                        </blockquote>
                      ),
                      code: ({ className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        ) : (
                          <code className="bg-muted px-2 py-1 rounded text-sm text-foreground font-mono border border-border/50" {...props}>
                            {children}
                          </code>
                        );
                      },
                      pre: ({ children }) => (
                        <pre className="bg-muted border border-border rounded-lg p-4 my-8 overflow-x-auto">
                          {children}
                        </pre>
                      ),
                      table: ({ children }) => (
                        <div className="my-8 overflow-x-auto">
                          <table className="min-w-full border border-border rounded-lg overflow-hidden">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-muted border-b border-border">
                          {children}
                        </thead>
                      ),
                      tbody: ({ children }) => (
                        <tbody className="divide-y divide-border">
                          {children}
                        </tbody>
                      ),
                      th: ({ children }) => (
                        <th className="py-3 px-4 text-left font-semibold text-foreground">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="py-3 px-4 text-foreground">
                          {children}
                        </td>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic text-foreground">
                          {children}
                        </em>
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              </div>

              {/* 文章结尾操作 */}
              <div className="bg-card/50 rounded-lg p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    {locale === 'zh'
                      ? `最后更新于 ${new Date(meta.lastmod).toLocaleDateString('zh-CN')}`
                      : `Last updated on ${new Date(meta.lastmod).toLocaleDateString('en-US')}`}
                  </div>
                  <div className="flex items-center gap-3">
                    <Link href={`/${locale}`}>
                      <Button size="sm" className="px-6">
                        {locale === 'zh' ? '开始使用' : 'Get Started'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* 推荐行动区域 */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-8 text-center space-y-4 border border-primary/20">
                <h3 className="text-2xl font-bold text-foreground">
                  {locale === 'zh' ? '立即体验 Mini Notepad' : 'Try Mini Notepad Now'}
                </h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {locale === 'zh'
                    ? '将文章中的技巧和概念应用到实际写作中，体验我们强大的在线记事本功能。'
                    : 'Apply the techniques and concepts from this article to your actual writing with our powerful online notepad.'}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link href={`/${locale}`}>
                    <Button size="lg" className="px-8">
                      {locale === 'zh' ? '免费开始写作' : 'Start Writing Free'}
                    </Button>
                  </Link>
                  <Link href={`/${locale}/templates`}>
                    <Button variant="outline" size="lg" className="px-8">
                      {locale === 'zh' ? '浏览模板' : 'Browse Templates'}
                    </Button>
                  </Link>
                </div>
              </div>
            </article>
          </main>

          {/* 右侧边栏 */}
          <aside className="w-80 hidden lg:block">
            <div className="sticky top-24 space-y-6 max-h-[calc(100vh-6rem)] overflow-y-auto">
              {/* 全部文章导航 */}
              {allArticles.length > 0 && (
                <Card className="shadow-lg border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border/30">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground text-lg">
                        {locale === 'zh' ? '全部文章' : locale === 'hi' ? 'सभी लेख' : 'All Articles'}
                      </h3>
                    </div>
                    <nav className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                      {allArticles.map((article) => (
                        <Link
                          key={article.id}
                          href={`/${locale}/articles/${article.id}`}
                          className={`block text-sm py-2 px-3 rounded-md transition-all duration-200 ${
                            article.id === slug
                              ? 'bg-primary/10 text-primary font-semibold border-l-3 border-primary'
                              : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                          }`}
                        >
                          {article.title}
                        </Link>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              )}

              {/* 目录 */}
              {toc.length > 0 && (
                <Card className="shadow-lg border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border/30">
                      <List className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground text-lg">
                        {locale === 'zh' ? '文章目录' : 'Table of Contents'}
                      </h3>
                    </div>
                    <nav className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                      {toc.map((item, index) => (
                        <a
                          key={index}
                          href={`#${item.id}`}
                          className={`block text-sm hover:text-primary transition-all duration-200 py-2 px-3 rounded-md hover:bg-primary/5 ${
                            item.level === 1 ? 'font-semibold border-l-3 border-primary pl-4' :
                            item.level === 2 ? 'ml-4 border-l-2 border-muted pl-3' : 'ml-8 pl-2'
                          } ${
                            item.level === 1 ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {item.text}
                        </a>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              )}

              {/* 相关文章 */}
              {relatedArticles.length > 0 && (
                <Card className="shadow-lg border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border/30">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground text-lg">
                        {locale === 'zh' ? '相关文章' : 'Related Articles'}
                      </h3>
                    </div>
                    <div className="space-y-6">
                      {relatedArticles.map((relatedArticle) => (
                        <Link
                          key={relatedArticle.id}
                          href={`/${locale}/articles/${relatedArticle.id}`}
                          className="block group p-3 rounded-lg hover:bg-primary/5 transition-all duration-200"
                        >
                          <div className="space-y-3">
                            <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-6">
                              {relatedArticle.title}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-3 leading-5">
                              {relatedArticle.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{relatedArticle.readingTime}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-border/30">
                      <Link href={`/${locale}/articles`}>
                        <Button variant="outline" size="sm" className="w-full">
                          {locale === 'zh' ? '查看所有文章' : 'View All Articles'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 行动号召 */}
              <Card className="bg-primary/5 border-primary/20 shadow-lg">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg">
                    {locale === 'zh' ? '准备开始写作？' : 'Ready to Start Writing?'}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-6">
                    {locale === 'zh'
                      ? '立即体验我们的在线记事本，将这些技巧应用到您的写作中。'
                      : 'Experience our online notepad now and apply these techniques to your writing.'}
                  </p>
                  <Link href={`/${locale}`}>
                    <Button className="w-full">
                      {locale === 'zh' ? '免费开始' : 'Start Free'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}