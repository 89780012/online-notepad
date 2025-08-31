'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Share2, Copy, Check, X } from 'lucide-react';

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  customSlug: string;
  slugError: string;
  onSlugChange: (value: string) => void;
  onCopyUrl: () => void;
  copied: boolean;
}

export default function SharePopup({
  isOpen,
  onClose,
  shareUrl,
  customSlug,
  slugError,
  onSlugChange,
  onCopyUrl,
  copied
}: SharePopupProps) {
  const t = useTranslations();
  const locale = useLocale();

  // 弹框显示动画
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-6 pointer-events-none">
      <div className="animate-in slide-in-from-bottom-5 slide-in-from-right-5 duration-300 pointer-events-auto">
        <Card className="w-112 bg-card border-border shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-foreground flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                {t('shareNote')}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0 hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* 自定义URL输入 */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">{t('customUrl')}</Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground shrink-0">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/${locale}/share/
                </span>
                <Input
                  value={customSlug}
                  onChange={(e) => onSlugChange(e.target.value)}
                  placeholder={t('customUrlPlaceholder')}
                  className={`flex-1 ${slugError ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'} bg-background`}
                />
              </div>
              {slugError && (
                <p className="text-sm text-destructive">{slugError}</p>
              )}
              <p className="text-sm text-muted-foreground">{t('customUrlHelp')}</p>
            </div>

            {/* 分享链接显示 */}
            {shareUrl && (
              <div className="space-y-2">
                <Label className="text-foreground font-medium">{t('shareUrl')}</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="bg-background border-border text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={onCopyUrl}
                    className="flex items-center gap-2 whitespace-nowrap border-border hover:bg-muted shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-primary" />
                        {t('copied')}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {t('copyUrl')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* 成功提示 */}
            {shareUrl && !slugError && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                <p className="text-primary text-sm font-medium">
                  ✅ {t('shareSuccess')}
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  {t('shareSuccessMessage')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}