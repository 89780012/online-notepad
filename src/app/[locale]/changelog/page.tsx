'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import changelogData from '@/data/changelog';
import { useEffect } from 'react';

export default function ChangelogPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  // SEO 优化：动态设置页面标题
  useEffect(() => {
    document.title = `${t('changelog.title')} - ${t('title')}`;

    // 设置页面描述
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('changelog.description'));
    }
  }, [t]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    // 使用更可靠的日期格式化
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    // 根据语言选择合适的 locale
    const localeMap: Record<string, string> = {
      zh: 'zh-CN',
      en: 'en-US',
      hi: 'hi-IN'
    };

    return date.toLocaleDateString(localeMap[locale] || 'en-US', options);
  };

  const getFeatureTypeColor = (type: string) => {
    switch (type) {
      case 'feat':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'fix':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'refactor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getFeatureTypeLabel = (type: string) => {
    switch (type) {
      case 'feat':
        return t('changelog.labels.feature');
      case 'fix':
        return t('changelog.labels.bugfix');
      case 'refactor':
        return t('changelog.labels.refactor');
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 头部导航 */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back')}
            </Button>
            <h1 className="text-2xl font-bold text-foreground font-serif">
              {t('changelog.title')}
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 页面描述 */}
        <div className="mb-8">
          <p className="text-lg text-muted-foreground">
            {t('changelog.description')}
          </p>
        </div>

        {/* 时间线 */}
        <div className="relative">
          {/* 时间线线条 */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>

          {changelogData.entries.map((entry) => (
            <div key={entry.version} className="relative mb-12">
              {/* 版本节点 */}
              <div className="absolute left-4 w-4 h-4 bg-primary rounded-full border-2 border-background"></div>

              {/* 版本卡片 */}
              <div className="ml-12">
                <Card className="p-6">
                  {/* 版本头部 */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold text-foreground">
                        {entry.version}
                      </h2>
                      <span className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium">
                        {t(entry.titleKey)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="h-4 w-4" />
                      <time dateTime={entry.date}>
                        {formatDate(entry.date)}
                      </time>
                    </div>
                    <p className="text-muted-foreground">
                      {t(entry.descriptionKey)}
                    </p>
                  </div>

                  {/* 功能列表 */}
                  <div className="space-y-4">
                    {entry.features.map((feature, featureIndex) => {
                      const Icon = feature.icon;
                      return (
                        <div
                          key={featureIndex}
                          className="flex items-start gap-4 p-4 rounded-lg border border-border/50 hover:border-border transition-colors"
                        >
                          {/* 功能图标 */}
                          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>

                          {/* 功能内容 */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground">
                                {t(feature.titleKey)}
                              </h3>
                              <span
                                className={`px-2 py-1 text-xs rounded-full font-medium ${getFeatureTypeColor(
                                  feature.type
                                )}`}
                              >
                                {getFeatureTypeLabel(feature.type)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {t(feature.descriptionKey)}
                            </p>

                            {/* 提交记录 */}
                            <div className="flex flex-wrap gap-1">
                              {feature.commits.map((commit) => (
                                <span
                                  key={commit}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground text-xs rounded font-mono"
                                >
                                  <Tag className="h-3 w-3" />
                                  {commit}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </div>
          ))}
        </div>

        {/* 底部信息 */}
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {t('changelog.footer')}
          </p>
        </div>
      </div>
    </div>
  );
}