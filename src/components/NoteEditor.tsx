'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Save, Share2, Copy, Check } from 'lucide-react';

export default function NoteEditor() {
  const t = useTranslations();
  const locale = useLocale();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const noteData = {
        title: title || t('untitledNote'),
        content,
        language: locale,
        isPublic
      };

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData)
      });

      if (!response.ok) {
        throw new Error('Failed to save note');
      }

      const savedNote = await response.json();
      
      if (savedNote.shareToken) {
        const newShareUrl = `${window.location.origin}/${locale}/share/${savedNote.shareToken}`;
        setShareUrl(newShareUrl);
      }
      
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!title && !content) {
      alert('Please add some content before sharing');
      return;
    }

    setIsPublic(true);
    
    if (!shareUrl) {
      await handleSave();
    }
  };

  const copyToClipboard = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t('newNote')}
            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? '...' : t('save')}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                {t('share')}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('noteTitle')}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('noteTitle')}
              className="text-lg"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">{t('writeNote')}</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('writeNote')}
              className="min-h-[400px] text-base leading-relaxed"
              style={{ resize: 'vertical' }}
            />
          </div>

          {shareUrl && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <Label className="text-green-800">{t('shareUrl')}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="bg-white"
                    />
                    <Button
                      variant="outline"
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
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
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}