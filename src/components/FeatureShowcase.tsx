'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Keyboard,
  Zap,
  Globe,
  Lock,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

interface FeatureShowcaseProps {
  onNewNote?: () => void;
}

export default function FeatureShowcase({ onNewNote }: FeatureShowcaseProps) {
  const t = useTranslations();

  const keyFeatures = [
    {
      icon: Zap,
      title: t('instantAccess'),
      description: t('instantAccessDesc'),
      highlight: t('noSignupRequired')
    },
    {
      icon: Lock,
      title: t('privacyFirst'),
      description: t('privacyFirstDesc'),
      highlight: t('localStorageOnly')
    },
    {
      icon: Globe,
      title: t('universalAccess'),
      description: t('universalAccessDesc'),
      highlight: t('anyBrowserAnywhere')
    },
    {
      icon: Keyboard,
      title: t('keyboardShortcuts'),
      description: t('keyboardShortcutsDesc'),
      highlight: t('powerUserFriendly')
    }
  ];

  const quickStart = [
    {
      step: '1',
      title: t('step1Title'),
      description: t('step1Desc')
    },
    {
      step: '2', 
      title: t('step2Title'),
      description: t('step2Desc')
    },
    {
      step: '3',
      title: t('step3Title'),
      description: t('step3Desc')
    },
    {
      step: '4',
      title: t('step4Title'),
      description: t('step4Desc')
    }
  ];

  const comparisons = [
    {
      feature: t('price'),
      us: t('free'),
      others: t('freemiumOrPaid')
    },
    {
      feature: t('ads'),
      us: t('noAds'),
      others: t('hasAds')
    },
    {
      feature: t('signup'),
      us: t('noSignup'),
      others: t('requiresSignup')
    },
    {
      feature: t('offline'),
      us: t('fullOffline'),
      others: t('limitedOffline')
    },
    {
      feature: t('privacy'),
      us: t('localFirst'),
      others: t('cloudFirst')
    }
  ];

  return (
    <div className="space-y-16">
      {/* 核心特性展示 */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-foreground text-center font-serif">
          {t('whyChooseUs')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {keyFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="bg-card/80 backdrop-blur-sm shadow-lg border-border hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-foreground text-lg">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    {feature.highlight}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 快速入门指南 */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-foreground text-center font-serif">
          {t('quickStartGuide')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStart.map((step, index) => (
            <Card key={index} className="bg-card/60 backdrop-blur-sm shadow-md border-border text-center relative">
              <CardHeader className="pb-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-3">
                  {step.step}
                </div>
                <CardTitle className="text-foreground text-lg">
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
              {index < quickStart.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2 text-primary">
                  <ArrowRight className="w-6 h-6" />
                </div>
              )}
            </Card>
          ))}
        </div>
        <div className="text-center">
          <Button
            onClick={onNewNote}
            size="lg"
            className="text-base px-8 py-3 font-semibold bg-primary hover:bg-primary/90 shadow-lg"
          >
            {t('tryItNow')}
          </Button>
        </div>
      </section>

      {/* 对比表格 */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-foreground text-center font-serif">
          {t('comparisonTitle')}
        </h2>
        <Card className="bg-card/80 backdrop-blur-sm shadow-lg border-border overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary/5">
                  <tr>
                    <th className="text-left p-4 font-semibold text-foreground">{t('feature')}</th>
                    <th className="text-center p-4 font-semibold text-primary">Mini Notepad</th>
                    <th className="text-center p-4 font-semibold text-muted-foreground">{t('others')}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((comparison, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-card/30' : 'bg-transparent'}>
                      <td className="p-4 text-foreground font-medium">{comparison.feature}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          {comparison.us}
                        </span>
                      </td>
                      <td className="p-4 text-center text-muted-foreground text-sm">
                        {comparison.others}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
