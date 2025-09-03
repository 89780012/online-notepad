'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Shield,
  Coffee
} from 'lucide-react';

interface FooterProps {
  onNewNote?: () => void;
}

export default function Footer({ onNewNote }: FooterProps) {
  const t = useTranslations();
  // 使用固定年份避免hydration问题
  const currentYear = 2024;

  const features = [
    t('freeForever'),
    t('noRegistration'),
    t('offlineFirst'),
    t('privacyProtected'),
    t('openSource'),
    t('crossPlatform')
  ];

  return (
    <footer className="bg-card/30 border-t border-border mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12">


        {/* 特性标签 */}
        <div className="mb-8">
          <h3 className="font-semibold text-foreground mb-4 text-center">
            {t('whyMiniNotepad')}
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {features.map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
              >
                <Heart className="w-3 h-3" />
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* CTA区域 */}
        <Card className="bg-primary/5 border-primary/20 p-6 mb-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t('readyToStart')}
            </h3>
            <p className="text-muted-foreground mb-4 text-sm">
              {t('footerCTA')}
            </p>
            <Button
              onClick={onNewNote}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              {t('startWriting')}
            </Button>
          </div>
        </Card>

        {/* 版权和法律信息 */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-muted-foreground text-sm">
                © {currentYear} Mini Notepad. {t('allRightsReserved')}
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                {t('madeWith')} <Heart className="w-3 h-3 inline text-red-500" /> {t('forEveryone')}
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {t('secureAndPrivate')}
              </span>
              <span className="flex items-center gap-1">
                <Coffee className="w-3 h-3" />
                {t('builtWithLove')}
              </span>
            </div>
          </div>

          {/* 额外的法律声明 */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              {t('legalDisclaimer')}
            </p>
          </div>

          {/* SEO友好的隐藏链接 */}
          <div className="sr-only">
            <h4>Mini Notepad - {t('seoFooterTitle')}</h4>
            <p>{t('seoFooterDescription')}</p>
            <ul>
              <li>Free online notepad</li>
              <li>Offline notepad app</li>
              <li>Dark mode notepad</li>
              <li>Markdown editor online</li>
              <li>Privacy-first notes</li>
              <li>No registration notepad</li>
              <li>Cross-platform notes</li>
              <li>Ad-free notepad</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
