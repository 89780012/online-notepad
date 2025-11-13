'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Download, FileText, Eye } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { getTemplates, categories, TemplateCategoryId, ProcessedTemplate } from '@/data/templates';
import LanguageToggle from '@/components/LanguageToggle';

export default function TemplatesPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategoryId>('all');

  // 获取模板数据，传入翻译函数
  const templates = getTemplates(t);

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);

  const handleApplyTemplate = (template: ProcessedTemplate) => {
    // 将模板内容存储到 sessionStorage，供主页使用
    sessionStorage.setItem('selectedTemplate', JSON.stringify({
      name: template.name,
      content: template.content
    }));

    // 返回到对应语言的首页，英文时返回根路径
    const homePath = locale === 'en' ? '/' : `/${locale}`;
    router.push(homePath);
  };

  const handlePreviewTemplate = (templateId: string) => {
    // 导航到模板预览页面
    const previewPath = locale === 'en' ? `/templates/${templateId}` : `/${locale}/templates/${templateId}`;
    router.push(previewPath);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 头部导航 */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const homePath = locale === 'en' ? '/' : `/${locale}`;
                router.push(homePath);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back')}
            </Button>
            <h1 className="text-2xl font-bold text-foreground font-serif">
              {t('templateMarket')}
            </h1>
          </div>
          <LanguageToggle />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 分类筛选 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">{t('categories')}</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id as TemplateCategoryId)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {t(category.name)}
                </Button>
              );
            })}
          </div>
        </div>

        {/* 模板网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {t(template.name)}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t(template.description)}
                      </p>
                    </div>
                  </div>

                  {/* 预览区域 */}
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-6 overflow-hidden">
                      {template.preview}
                    </pre>
                  </div>

                  {/* 标签 */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePreviewTemplate(template.id)}
                      className="flex-1 flex items-center gap-2"
                      size="sm"
                    >
                      <Eye className="h-4 w-4" />
                      {t('preview')}
                    </Button>
                    <Button
                      onClick={() => handleApplyTemplate(template)}
                      className="flex-1 flex items-center gap-2"
                      size="sm"
                    >
                      <Download className="h-4 w-4" />
                      {t('useTemplate')}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">
              {t('noTemplatesFound')}
            </h3>
            <p className="text-muted-foreground">
              {t('tryDifferentCategory')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}