'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function MarketingContent() {
  const t = useTranslations();

  const features = [
    { text: t('featureFree'), key: 'free' },
    { text: t('featureFast'), key: 'fast' },
    { text: t('featureDarkMode'), key: 'dark' },
    { text: t('featureOffline'), key: 'offline' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50">
      <div className="max-w-3xl">
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          {t('heroTitle')}
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          {t('heroSubtitle')}
        </p>

        <Card className="mt-12 text-left">
          <CardHeader>
            <CardTitle>{t('featureListTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {features.map((feature) => (
                <li key={feature.key} className="flex items-start">
                  <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                  <span className="text-slate-700">{feature.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}