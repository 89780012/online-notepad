'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Plus, Cloud, Shield, Zap } from 'lucide-react';

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

  return (
    <div className="flex flex-col items-center justify-center h-full pt-20 pb-8 px-8 text-center bg-card/50 paper-texture">
      <div className="max-w-4xl">
        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl font-serif">
          {t('heroTitle')}
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
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

        {/* 特色功能卡片网格 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* 底部简介 */}
        <div className="mt-12 p-6 rounded-lg bg-primary/5 border border-primary/20">
          <h3 className="text-xl font-semibold text-foreground mb-3 font-serif">
            {t('featureListTitle')}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t('privacyFirstSummary')}
          </p>
        </div>
      </div>
    </div>
  );
}