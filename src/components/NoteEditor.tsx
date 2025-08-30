'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Save, Share2, Copy, Check, Clock } from 'lucide-react';
import PaperCard from './PaperCard';
import NoteInput from './NoteInput';
import SharePopup from './SharePopup';

interface Note {
  id: string;
  title: string;
  content: string;
  language: string;
  isPublic: boolean;
  shareToken?: string | null;
  customSlug?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function NoteEditor() {
  const t = useTranslations();
  const locale = useLocale();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [slugError, setSlugError] = useState('');
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastContentRef = useRef({ title: '', content: '', customSlug: '' });

  // localStorage 键名
  const STORAGE_KEYS = {
    title: 'notepad_draft_title',
    content: 'notepad_draft_content',
    customSlug: 'notepad_draft_slug',
    isPublic: 'notepad_draft_public'
  };

  // 保存到 localStorage
  const saveDraftToStorage = useCallback((draftTitle: string, draftContent: string, draftSlug: string, draftPublic: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.title, draftTitle);
      localStorage.setItem(STORAGE_KEYS.content, draftContent);
      localStorage.setItem(STORAGE_KEYS.customSlug, draftSlug);
      localStorage.setItem(STORAGE_KEYS.isPublic, draftPublic.toString());
    }
  }, []);

  // 从 localStorage 恢复
  const loadDraftFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      const savedTitle = localStorage.getItem(STORAGE_KEYS.title) || '';
      const savedContent = localStorage.getItem(STORAGE_KEYS.content) || '';
      const savedSlug = localStorage.getItem(STORAGE_KEYS.customSlug) || '';
      const savedPublic = localStorage.getItem(STORAGE_KEYS.isPublic) === 'true';
      
      return {
        title: savedTitle,
        content: savedContent,
        customSlug: savedSlug,
        isPublic: savedPublic
      };
    }
    return { title: '', content: '', customSlug: '', isPublic: false };
  }, []);

  // 清除 localStorage 草稿
  const clearDraftFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.title);
      localStorage.removeItem(STORAGE_KEYS.content);
      localStorage.removeItem(STORAGE_KEYS.customSlug);
      localStorage.removeItem(STORAGE_KEYS.isPublic);
    }
  }, []);

  // 组件挂载时恢复草稿
  useEffect(() => {
    const draft = loadDraftFromStorage();
    if (draft.title || draft.content) {
      setTitle(draft.title);
      setContent(draft.content);
      setCustomSlug(draft.customSlug);
      setIsPublic(draft.isPublic);
      lastContentRef.current = { title: draft.title, content: draft.content, customSlug: draft.customSlug };
      setDraftRestored(true);
      
      // 3秒后隐藏草稿恢复提示
      setTimeout(() => setDraftRestored(false), 3000);
    }
  }, [loadDraftFromStorage]);

  // 实时保存草稿到 localStorage
  useEffect(() => {
    saveDraftToStorage(title, content, customSlug, isPublic);
  }, [title, content, customSlug, isPublic, saveDraftToStorage]);

  // 生成随机字符串
  const generateRandomSlug = (length = 8) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 自动保存功能
  const autoSave = useCallback(async () => {
    const currentContent = { title, content, customSlug };
    
    // 检查内容是否有变化
    if (
      currentContent.title === lastContentRef.current.title &&
      currentContent.content === lastContentRef.current.content &&
      currentContent.customSlug === lastContentRef.current.customSlug
    ) {
      return;
    }
    
    // 如果标题和内容都为空，不保存
    if (!title.trim() && !content.trim()) {
      return;
    }

    setAutoSaving(true);
    
    try {
      const noteData = {
        title: title || t('untitledNote'),
        content,
        language: locale,
        isPublic,
        customSlug: customSlug || undefined
      };

      const url = currentNote ? '/api/notes' : '/api/notes';
      const method = currentNote ? 'PUT' : 'POST';
      
      if (currentNote) {
        (noteData as any).id = currentNote.id;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          setSlugError(t('urlTaken'));
          return;
        }
        throw new Error('Failed to save note');
      }

      const savedNote = await response.json();
      setCurrentNote(savedNote);
      setLastSaved(new Date());
      lastContentRef.current = currentContent;
      setSlugError('');
      
      // 成功保存后清除草稿
      clearDraftFromStorage();
      
      if (savedNote.shareToken || savedNote.customSlug) {
        const slug = savedNote.customSlug || savedNote.shareToken;
        const newShareUrl = `${window.location.origin}/${locale}/share/${slug}`;
        setShareUrl(newShareUrl);
      }
      
    } catch (error) {
      console.error('Error auto-saving note:', error);
    } finally {
      setAutoSaving(false);
    }
  }, [title, content, customSlug, locale, isPublic, t, currentNote]);

  // 设置自动保存定时器
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 2000); // 2秒后自动保存

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [title, content, customSlug, autoSave]);

  // 手动保存
  const handleSave = async () => {
    setSaving(true);
    await autoSave();
    setSaving(false);
  };

  const handleShare = async () => {
    if (!title && !content) {
      alert('Please add some content before sharing');
      return;
    }

    // 如果没有自定义地址，生成一个随机地址
    let slugToUse = customSlug;
    if (!customSlug) {
      slugToUse = generateRandomSlug();
      setCustomSlug(slugToUse);
    }
    
    setIsPublic(true);
    setShowSharePopup(true); // 显示弹框
    
    // 立即触发保存，使用新生成的地址
    setSaving(true);
    try {
      const noteData = {
        title: title || t('untitledNote'),
        content,
        language: locale,
        isPublic: true,
        customSlug: slugToUse
      };

      const url = currentNote ? '/api/notes' : '/api/notes';
      const method = currentNote ? 'PUT' : 'POST';
      
      if (currentNote) {
        (noteData as any).id = currentNote.id;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          setSlugError(t('urlTaken'));
          return;
        }
        throw new Error('Failed to save note');
      }

      const savedNote = await response.json();
      setCurrentNote(savedNote);
      setLastSaved(new Date());
      lastContentRef.current = { title, content, customSlug: slugToUse };
      setSlugError('');
      
      // 成功保存后清除草稿
      clearDraftFromStorage();
      
      if (savedNote.shareToken || savedNote.customSlug) {
        const slug = savedNote.customSlug || savedNote.shareToken;
        const newShareUrl = `${window.location.origin}/${locale}/share/${slug}`;
        setShareUrl(newShareUrl);
      }
      
    } catch (error) {
      console.error('Error saving note for sharing:', error);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const validateSlug = (value: string) => {
    if (!value) {
      setSlugError('');
      return true;
    }
    
    const slugRegex = /^[a-zA-Z0-9-_]+$/;
    if (!slugRegex.test(value)) {
      setSlugError(t('customUrlHelp'));
      return false;
    }
    
    if (value.length > 50) {
      setSlugError('URL too long (max 50 characters)');
      return false;
    }
    
    setSlugError('');
    return true;
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomSlug(value);
    validateSlug(value);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 纸张样式的主编辑区域 */}
      <PaperCard
        header={
          <CardTitle className="flex items-center justify-between text-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-400 rounded-full shadow-sm"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-sm"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full shadow-sm"></div>
              <span className="ml-4 font-semibold">{t('newNote')}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              {draftRestored && (
                <span className="flex items-center gap-1 text-blue-600">
                  <Check className="w-3 h-3" />
                  已恢复草稿
                </span>
              )}
              {autoSaving && (
                <span className="flex items-center gap-1 text-blue-600">
                  <Clock className="w-3 h-3 animate-spin" />
                  {t('saving')}
                </span>
              )}
              {lastSaved && !autoSaving && (
                <span className="flex items-center gap-1 text-green-600">
                  <Check className="w-3 h-3" />
                  {t('autoSaved')} {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <div className="flex gap-2">
                <Button 
                  onClick={handleSave} 
                  disabled={saving || autoSaving}
                  size="sm"
                  className="flex items-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  {saving ? t('saving') : t('save')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleShare}
                  size="sm"
                  className="flex items-center gap-2 shadow-sm"
                >
                  <Share2 className="w-4 h-4" />
                  {t('share')}
                </Button>
              </div>
            </div>
          </CardTitle>
        }
      >
        <NoteInput
          title={title}
          content={content}
          onTitleChange={setTitle}
          onContentChange={setContent}
        />
      </PaperCard>

      {/* 分享弹框 */}
      <SharePopup
        isOpen={showSharePopup}
        onClose={() => setShowSharePopup(false)}
        shareUrl={shareUrl}
        customSlug={customSlug}
        slugError={slugError}
        onSlugChange={handleSlugChange}
        onCopyUrl={copyToClipboard}
        copied={copied}
      />
    </div>
  );
}