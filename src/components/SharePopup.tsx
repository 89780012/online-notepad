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
        <Card className="w-96 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-green-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                {t('shareNote')}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0 hover:bg-green-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* 自定义URL输入 */}
            <div className="space-y-2">
              <Label className="text-green-800 font-medium">{t('customUrl')}</Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 shrink-0">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/${locale}/share/
                </span>
                <Input
                  value={customSlug}
                  onChange={(e) => onSlugChange(e.target.value)}
                  placeholder={t('customUrlPlaceholder')}
                  className={`flex-1 ${slugError ? 'border-red-300 focus:border-red-300' : 'border-green-300 focus:border-green-500'} bg-white`}
                />
              </div>
              {slugError && (
                <p className="text-sm text-red-600">{slugError}</p>
              )}
              <p className="text-sm text-green-700">{t('customUrlHelp')}</p>
            </div>

            {/* 分享链接显示 */}
            {shareUrl && (
              <div className="space-y-2">
                <Label className="text-green-800 font-medium">{t('shareUrl')}</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="bg-white border-green-300 text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={onCopyUrl}
                    className="flex items-center gap-2 whitespace-nowrap border-green-300 hover:bg-green-100 shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
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
              <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 text-sm font-medium">
                  ✅ {t('shareSuccess')}
                </p>
                <p className="text-green-600 text-sm mt-1">
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