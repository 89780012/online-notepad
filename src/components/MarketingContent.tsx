'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Plus, Cloud, Shield, Zap, FileText, Smartphone, Moon, Download, Edit3, Share2 } from 'lucide-react';
import FeatureShowcase from './FeatureShowcase';
import UseCaseShowcase from './UseCaseShowcase';
import SEOContent from './SEOContent';
import Footer from './Footer';

interface MarketingContentProps {
  onNewNote?: () => void;
}

export default function MarketingContent({ onNewNote }: MarketingContentProps) {
  const t = useTranslations();

  const features = [
    {
      icon: Zap,
      title: t('offlineFirst'),
      text: t('offlineFirstDesc'),
      key: 'offline'
    },
    {
      icon: Cloud,
      title: t('shareToCloud'),
      text: t('shareToCloudDesc'),
      key: 'cloud'
    },
    {
      icon: Shield,
      title: t('cancelShareCloudDelete'),
      text: t('cancelShareCloudDeleteDesc'),
      key: 'privacy'
    },
    {
      icon: CheckCircle2,
      title: t('noAdsSimple'),
      text: t('noAdsSimpleDesc'),
      key: 'simple'
    },
  ];

  const useCases = [
    {
      icon: FileText,
      title: t('quickNotes'),
      description: t('quickNotesDesc'),
      key: 'quick'
    },
    {
      icon: Edit3,
      title: t('markdownWriting'),
      description: t('markdownWritingDesc'),
      key: 'markdown'
    },
    {
      icon: Share2,
      title: t('collaborativeSharing'),
      description: t('collaborativeSharingDesc'),
      key: 'sharing'
    }
  ];

  const advantages = [
    {
      icon: Moon,
      title: t('darkModeSupport'),
      description: t('darkModeSupportDesc'),
      key: 'darkmode'
    },
    {
      icon: Smartphone,
      title: t('crossDevice'),
      description: t('crossDeviceDesc'),
      key: 'device'
    },
    {
      icon: Download,
      title: t('exportOptions'),
      description: t('exportOptionsDesc'),
      key: 'export'
    }
  ];

  return (
    <div className="flex flex-col items-center justify-start min-h-full pt-12 pb-16 px-4 sm:px-8 text-center bg-card/50 paper-texture overflow-y-auto">
      {/* SEO优化内容 */}
      <SEOContent />

      <div className="max-w-6xl w-full space-y-16">
        {/* Hero Section */}
        <section className="space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground font-serif">
            {t('heroTitle')}
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-3xl mx-auto">
            {t('heroSubtitle')}
          </p>

          {/* CTA按钮 */}
          <div className="mt-8 flex justify-center">
            <Button
              onClick={onNewNote}
              size="lg"
              className="text-base px-8 py-3 font-semibold bg-primary hover:bg-primary/90 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('newNote')}
            </Button>
          </div>

          {/* SEO关键词段落 */}
          <div className="mt-12 max-w-4xl mx-auto text-left">
            <h2 className="text-2xl font-semibold text-foreground mb-4 text-center font-serif">
              {t('seoTitle')}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-center">
              {t('seoDescription')}
            </p>
          </div>
        </section>

        {/* 核心功能特色 */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-foreground font-serif">
            {t('coreFeatures')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Card key={feature.key} className="text-left bg-card/80 backdrop-blur-sm shadow-lg border-border hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-foreground text-lg">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.text}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 使用场景 */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-foreground font-serif">
            {t('useCases')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {useCases.map((useCase) => {
              const IconComponent = useCase.icon;
              return (
                <Card key={useCase.key} className="text-center bg-card/60 backdrop-blur-sm shadow-md border-border hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-foreground text-lg">
                      {useCase.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {useCase.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 技术优势 */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-foreground font-serif">
            {t('technicalAdvantages')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {advantages.map((advantage) => {
              const IconComponent = advantage.icon;
              return (
                <Card key={advantage.key} className="text-center bg-card/60 backdrop-blur-sm shadow-md border-border hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-foreground text-lg">
                      {advantage.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {advantage.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 常见问题 */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-foreground font-serif">
            {t('faqTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <Card className="bg-card/60 backdrop-blur-sm shadow-md border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">
                  {t('faq1Question')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('faq1Answer')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-sm shadow-md border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">
                  {t('faq2Question')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('faq2Answer')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-sm shadow-md border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">
                  {t('faq3Question')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('faq3Answer')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-sm shadow-md border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">
                  {t('faq4Question')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('faq4Answer')}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 功能展示组件 */}
        <FeatureShowcase onNewNote={onNewNote} />

        {/* 使用场景展示组件 */}
        <UseCaseShowcase onNewNote={onNewNote} />

        {/* 页脚组件 */}
        <Footer onNewNote={onNewNote} />
      </div>
    </div>
  );
}