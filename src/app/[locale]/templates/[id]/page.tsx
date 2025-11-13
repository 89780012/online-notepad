'use client';

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { getTemplates } from '@/data/templates';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

// 动态导入 Markdown 预览组件，避免 SSR 问题
const MarkdownPreview = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => ({ default: mod.default.Markdown })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8 min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-sm text-muted-foreground">Loading preview...</div>
        </div>
      </div>
    )
  }
);

export default function TemplatePreviewPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const templateId = params.id as string;

  // 获取模板数据
  const templates = getTemplates(t);
  const template = templates.find(t => t.id === templateId);

  // 如果模板不存在，显示 404
  if (!template) {
    notFound();
  }

  const Icon = template.icon;

  const handleUseTemplate = () => {
    // 将模板内容存储到 sessionStorage，供主页使用
    sessionStorage.setItem('selectedTemplate', JSON.stringify({
      name: template.name,
      content: template.content
    }));

    // 返回到对应语言的首页
    const homePath = locale === 'en' ? '/' : `/${locale}`;
    router.push(homePath);
  };

  const handleBack = () => {
    // 返回模板市场
    const templatesPath = locale === 'en' ? '/templates' : `/${locale}/templates`;
    router.push(templatesPath);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 头部导航 */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('back')}
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground font-serif">
                    {t(template.name)}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {t(template.description)}
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleUseTemplate}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {t('useTemplate')}
            </Button>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Markdown 预览区域 */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div data-color-mode="light" className="dark:hidden">
            <MarkdownPreview
              source={template.content}
              className="p-6"
              style={{
                backgroundColor: 'transparent',
                color: 'inherit',
              }}
              rehypePlugins={[rehypeKatex]}
              remarkPlugins={[remarkMath]}
            />
          </div>
          <div data-color-mode="dark" className="hidden dark:block">
            <MarkdownPreview
              source={template.content}
              className="p-6"
              style={{
                backgroundColor: 'transparent',
                color: 'inherit',
              }}
              rehypePlugins={[rehypeKatex]}
              remarkPlugins={[remarkMath]}
            />
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="mt-8 flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
          >
            {t('back')}
          </Button>
          <Button
            onClick={handleUseTemplate}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {t('useTemplate')}
          </Button>
        </div>
      </div>
    </div>
  );
}
