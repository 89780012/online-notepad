'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { X, Download } from 'lucide-react';

interface SaveAsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (filename: string) => void;
  defaultFilename: string;
}

export default function SaveAsDialog({
  isOpen,
  onClose,
  onSave,
  defaultFilename
}: SaveAsDialogProps) {
  const t = useTranslations();
  const [filename, setFilename] = useState(defaultFilename);

  const handleSave = () => {
    if (filename.trim()) {
      onSave(filename.trim());
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-md bg-card border-border shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              {t('saveAs')}
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
          <div className="space-y-2">
            <Label className="text-foreground font-medium">{t('filename')}</Label>
            <Input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={t('enterFilename')}
              className="bg-background border-border"
              autoFocus
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-border hover:bg-muted"
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!filename.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('download')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}