import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, User, FileText, Tag } from 'lucide-react';
import Link from 'next/link';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ArticleIndexPageProps {
  params: Promise<{
    locale: string;
  }>;
}

interface ArticleItem {
  id: string;
  title: {
    zh: string;
    en: string;
    hi: string;
  };
  description: {
    zh: string;
    en: string;
    hi: string;
  };
  keywords: {
    zh: string[];
    en: string[];
    hi: string[];
  };
  meta: {
    author: string;
    created: string;
    lastModified: string;
    wordCount: {
      zh: number;
      en: number;
      hi: number;
    };
    readingTime: {
      zh: string;
      en: string;
      hi: string;
    };
  };
}

interface ArticleIndex {
  articles: ArticleItem[];
  metadata: {
    version: string;
    totalArticles: number;
    languages: string[];
  };
}

async function getArticleIndex(): Promise<ArticleIndex | null> {
  try {
    const indexPath = join(process.cwd(), 'content', 'seo', 'articles', 'index.json');

    if (!existsSync(indexPath)) {
      return null;
    }

    const indexContent = readFileSync(indexPath, 'utf-8');
    return JSON.parse(indexContent) as ArticleIndex;
  } catch (error) {
    console.error('Error reading article index:', error);
    return null;
  }
}

export async function generateMetadata({ params }: ArticleIndexPageProps): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXTAUTH_URL || 'https://notepad.best';
  const articlesUrl = `${baseUrl}/${locale}/articles`;

  const title = locale === 'zh'
    ? '相关文章 - Mini Notepad'
    : locale === 'hi'
    ? 'लेख - Mini Notepad'
    : 'Articles - Mini Notepad';
  const description = locale === 'zh'
    ? '浏览我们的专业文章，了解在线记事本、Markdown编辑、数字化笔记等相关话题。提升您的工作效率和写作体验。'
    : locale === 'hi'
    ? 'ऑनलाइन नोटपैड, मार्कडाउन संपादन, डिजिटल नोट-टेकिंग और अधिक के बारे में हमारे पेशेवर लेख ब्राउज़ करें। अपनी उत्पादकता और लेखन अनुभव बढ़ाएं।'
    : 'Browse our professional articles about online notepads, Markdown editing, digital note-taking and more. Enhance your productivity and writing experience.';

  return {
    title,
    description,
    keywords: locale === 'zh'
      ? ['文章', '博客', '记事本教程', 'Markdown指南', '在线笔记', '写作技巧']
      : locale === 'hi'
      ? ['लेख', 'ब्लॉग', 'नोटपैड ट्यूटोरियल', 'मार्कडाउन गाइड', 'ऑनलाइन नोट्स', 'लेखन तकनीक']
      : ['articles', 'blog', 'notepad tutorials', 'markdown guide', 'online notes', 'writing tips'],
    openGraph: {
      title,
      description,
      url: articlesUrl,
      siteName: 'Mini Notepad',
      locale: locale === 'zh' ? 'zh_CN' : locale === 'hi' ? 'hi_IN' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: articlesUrl,
      languages: {
        'zh': `${baseUrl}/zh/articles`,
        'en': `${baseUrl}/en/articles`,
        'hi': `${baseUrl}/hi/articles`,
      },
    },
  };
}

export default async function ArticleIndexPage({ params }: ArticleIndexPageProps) {
  const { locale } = await params;
  const t = await getTranslations();
  const articleIndex = await getArticleIndex();

  if (!articleIndex) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {locale === 'zh' ? '文章未找到' : locale === 'hi' ? 'लेख नहीं मिले' : 'Articles Not Found'}
          </h1>
          <Link href={`/${locale}`}>
            <Button>
              {locale === 'zh' ? '返回首页' : locale === 'hi' ? 'होम पर वापस' : 'Back to Home'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { articles, metadata } = articleIndex;

  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/${locale}`}>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('backToApp')}
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground font-serif">Mini Notepad</h1>
            <div></div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 页面标题区域 */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {locale === 'zh' ? '相关文章' : locale === 'hi' ? 'संबंधित लेख' : 'Articles'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {locale === 'zh'
              ? '深入了解在线记事本、Markdown编辑和数字化写作的最佳实践'
              : locale === 'hi'
              ? 'ऑनलाइन नोटपैड, मार्कडाउन संपादन और डिजिटल लेखन की सर्वोत्तम प्रथाओं में गहराई से जानें'
              : 'Deep dive into online notepads, Markdown editing, and digital writing best practices'}
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{metadata.totalArticles} {locale === 'zh' ? '篇文章' : locale === 'hi' ? 'लेख' : 'articles'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              <span>{metadata.languages.length} {locale === 'zh' ? '种语言' : locale === 'hi' ? 'भाषाएं' : 'languages'}</span>
            </div>
          </div>
        </div>

        {/* 文章列表 */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => {
            const title = article.title[locale as keyof typeof article.title] || article.title.en;
            const description = article.description[locale as keyof typeof article.description] || article.description.en;
            const keywords = article.keywords[locale as keyof typeof article.keywords] || article.keywords.en;
            const wordCount = article.meta.wordCount[locale as keyof typeof article.meta.wordCount] || article.meta.wordCount.en;
            const readingTime = article.meta.readingTime[locale as keyof typeof article.meta.readingTime] || article.meta.readingTime.en;

            return (
              <Card key={article.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-border">
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                        <Link href={`/${locale}/articles/${article.id}`} className="hover:underline">
                          {title}
                        </Link>
                      </CardTitle>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{article.meta.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(article.meta.created).toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale === 'hi' ? 'hi-IN' : 'en-US')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{readingTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed line-clamp-3">
                    {description}
                  </p>

                  {/* 关键词标签 */}
                  <div className="flex flex-wrap gap-1">
                    {keywords.slice(0, 4).map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
                      >
                        {keyword}
                      </span>
                    ))}
                    {keywords.length > 4 && (
                      <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                        +{keywords.length - 4}
                      </span>
                    )}
                  </div>

                  {/* 文章统计信息 */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="text-xs text-muted-foreground">
                      {wordCount.toLocaleString()} {locale === 'zh' ? '字' : locale === 'hi' ? 'शब्द' : 'words'}
                    </div>
                    <Link href={`/${locale}/articles/${article.id}`}>
                      <Button size="sm" className="text-xs">
                        {locale === 'zh' ? '阅读全文' : locale === 'hi' ? 'और पढ़ें' : 'Read More'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 底部信息 */}
        <div className="mt-16 text-center">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {locale === 'zh' ? '准备开始写作？' : locale === 'hi' ? 'लिखना शुरू करने के लिए तैयार हैं?' : 'Ready to Start Writing?'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {locale === 'zh'
                  ? '立即体验我们的在线记事本，将这些技巧应用到您的写作中。'
                  : locale === 'hi'
                  ? 'अभी हमारे ऑनलाइन नोटपैड का अनुभव करें और इन तकनीकों को अपने लेखन में लागू करें।'
                  : 'Experience our online notepad now and apply these techniques to your writing.'}
              </p>
              <Link href={`/${locale}`}>
                <Button size="lg" className="font-medium">
                  {locale === 'zh' ? '开始使用' : locale === 'hi' ? 'शुरू करें' : 'Get Started'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-card/50 border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 Mini Notepad. {locale === 'zh' ? '保留所有权利。' : locale === 'hi' ? 'सभी अधिकार सुरक्षित।' : 'All rights reserved.'}</p>
            <p className="mt-2">
              {locale === 'zh'
                ? `最后更新于 ${new Date().toLocaleDateString('zh-CN')}`
                : locale === 'hi'
                ? `अंतिम अपडेट ${new Date().toLocaleDateString('hi-IN')}`
                : `Last updated on ${new Date().toLocaleDateString('en-US')}`}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}