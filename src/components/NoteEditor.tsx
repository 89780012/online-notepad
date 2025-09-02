'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { Save, Share2, Check, Clock, Maximize2 } from 'lucide-react';
import PaperCard from './PaperCard';
import NoteInput from './NoteInput';
import SharePopup from './SharePopup';
import { LocalNote } from '@/hooks/useLocalNotes';
import { NOTE_MODES } from '@/types/note-modes';
import { useTheme } from '@/contexts/ThemeContext';

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

interface NoteEditorProps {
  selectedNote?: LocalNote | null;
  isNewNote?: boolean;
  onNoteSaved?: (note: LocalNote, titleChanged?: boolean) => void;
  saveNote: (noteData: Omit<LocalNote, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => LocalNote | undefined;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
}

export default function NoteEditor({ selectedNote, isNewNote = true, onNoteSaved, saveNote, isFocusMode = false, onToggleFocusMode }: NoteEditorProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [slugError, setSlugError] = useState('');
  const [, setCurrentNote] = useState<Note | null>(null);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [currentLocalNote, setCurrentLocalNote] = useState<LocalNote | null>(null);
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastContentRef = useRef({ title: '', content: '', customSlug: '' });
  const lastSavedTitleRef = useRef('');

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
  }, [STORAGE_KEYS.title, STORAGE_KEYS.content, STORAGE_KEYS.customSlug, STORAGE_KEYS.isPublic]);

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
  }, [STORAGE_KEYS.title, STORAGE_KEYS.content, STORAGE_KEYS.customSlug, STORAGE_KEYS.isPublic]);

  // 清除 localStorage 草稿
  const clearDraftFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.title);
      localStorage.removeItem(STORAGE_KEYS.content);
      localStorage.removeItem(STORAGE_KEYS.customSlug);
      localStorage.removeItem(STORAGE_KEYS.isPublic);
    }
  }, [STORAGE_KEYS.title, STORAGE_KEYS.content, STORAGE_KEYS.customSlug, STORAGE_KEYS.isPublic]);

  // 初始化笔记内容
  useEffect(() => {
    if (selectedNote && !isNewNote) {
      // 加载选中的笔记
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setCustomSlug(selectedNote.customSlug || '');
      setIsPublic(selectedNote.isPublic || false);
      setCurrentLocalNote(selectedNote);
      lastContentRef.current = { 
        title: selectedNote.title, 
        content: selectedNote.content, 
        customSlug: selectedNote.customSlug || '' 
      };
      lastSavedTitleRef.current = selectedNote.title;
      
      // 如果是已分享的笔记，设置分享URL
      if (selectedNote.isPublic && (selectedNote.customSlug || selectedNote.shareToken)) {
        const slug = selectedNote.customSlug || selectedNote.shareToken;
        const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${locale}/share/${slug}`;
        setShareUrl(shareUrl);
      }
    } else if (selectedNote && isNewNote) {
      // 如果有选中笔记但标记为新建（可能是语言切换导致），也加载选中笔记的内容
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setCustomSlug(selectedNote.customSlug || '');
      setIsPublic(selectedNote.isPublic || false);
      setCurrentLocalNote(selectedNote);
      lastContentRef.current = { 
        title: selectedNote.title, 
        content: selectedNote.content, 
        customSlug: selectedNote.customSlug || '' 
      };
      lastSavedTitleRef.current = selectedNote.title;
      
      // 如果是已分享的笔记，设置分享URL
      if (selectedNote.isPublic && (selectedNote.customSlug || selectedNote.shareToken)) {
        const slug = selectedNote.customSlug || selectedNote.shareToken;
        const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${locale}/share/${slug}`;
        setShareUrl(shareUrl);
      }
    } else if (isNewNote && !selectedNote) {
      // 只有在真正新建笔记时（既没有选中笔记，又是新建模式）才尝试加载草稿
      const draft = loadDraftFromStorage();
      if (draft.title || draft.content) {
        setTitle(draft.title);
        setContent(draft.content);
        setCustomSlug(draft.customSlug);
        setIsPublic(draft.isPublic);
        setDraftRestored(true);
        setTimeout(() => setDraftRestored(false), 3000);
      } else {
        // 完全新建，清空所有内容
        setTitle('');
        setContent('');
        setCustomSlug('');
        setIsPublic(false);
      }
      setCurrentLocalNote(null);
      lastContentRef.current = { title: '', content: '', customSlug: '' };
      lastSavedTitleRef.current = '';
    }
  }, [selectedNote, isNewNote, loadDraftFromStorage, locale]);

  // 实时保存草稿到 localStorage (仅在真正新建笔记时)
  useEffect(() => {
    if (isNewNote && !selectedNote) {
      saveDraftToStorage(title, content, customSlug, isPublic);
    }
  }, [title, content, customSlug, isPublic, saveDraftToStorage, isNewNote, selectedNote]);

  // 云端同步函数
  const syncToCloud = useCallback(async () => {
    // 只有已分享的笔记才同步到云端
    if (!currentLocalNote?.isPublic || !currentLocalNote?.cloudNoteId) {
      return;
    }

    // 如果标题和内容都为空，不同步
    if (!title.trim() && !content.trim()) {
      return;
    }

    try {
      const noteData = {
        id: currentLocalNote.cloudNoteId,
        title: title || t('untitledNote'),
        content,
        language: locale,
        isPublic: true,
        customSlug: currentLocalNote.customSlug
      };

      const response = await fetch('/api/notes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData)
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setCurrentNote(updatedNote);
        console.log('云端同步成功');
      } else {
        console.error('云端同步失败:', response.statusText);
      }
    } catch (error) {
      console.error('云端同步出错:', error);
    }
  }, [title, content, locale, t, currentLocalNote]);

  // 自动保存到本地存储
  const autoSaveLocal = useCallback(async () => {
    // 如果标题和内容都为空，不保存
    if (!title.trim() && !content.trim()) {
      return;
    }

    try {
      const savedNote = saveNote({
        title: title || '无标题',
        content,
        mode: NOTE_MODES.PLAIN_TEXT, // 固定为纯文本模式
        customSlug,
        isPublic
      }, currentLocalNote?.id);

      if (savedNote) {
        const titleChanged = title !== lastSavedTitleRef.current;
        
        setCurrentLocalNote(savedNote);
        setLastSaved(new Date());
        lastContentRef.current = { title, content, customSlug };
        lastSavedTitleRef.current = title;
        
        // 通知父组件笔记已保存，传递标题是否变化的信息
        if (onNoteSaved) {
          onNoteSaved(savedNote, titleChanged);
        }
        
        // 清除草稿
        clearDraftFromStorage();
        
        // 如果是已分享的笔记，触发云端同步
        if (savedNote.isPublic && savedNote.cloudNoteId) {
          setTimeout(() => {
            syncToCloud();
          }, 500); // 延迟500ms后同步，避免频繁请求
        }
      }
    } catch (error) {
      console.error('Error saving note locally:', error);
    }
  }, [title, content, customSlug, isPublic, saveNote, currentLocalNote?.id, onNoteSaved, clearDraftFromStorage, syncToCloud]);

  // 生成随机字符串
  const generateRandomSlug = (length = 8) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 设置自动保存定时器（本地保存）
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveLocal();
    }, 3000); // 2秒后自动保存到本地

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [title, content, customSlug, autoSaveLocal]);

  // 手动保存（本地保存）
  const handleSave = async () => {
    setSaving(true);
    await autoSaveLocal();
    setSaving(false);
  };

  const handleShare = async () => {
    if (!title && !content) {
      alert('Please add some content before sharing');
      return;
    }

    // 检查当前笔记是否已经有分享链接
    const existingSlug = currentLocalNote?.customSlug || currentLocalNote?.shareToken;
    const existingCloudId = currentLocalNote?.cloudNoteId;
    
    if (existingSlug && currentLocalNote?.isPublic) {
      // 如果已经有分享链接，直接显示
      const existingShareUrl = `${window.location.origin}/${locale}/share/${existingSlug}`;
      setShareUrl(existingShareUrl);
      setCustomSlug(existingSlug);
      setIsPublic(true);
      setShowSharePopup(true);
      return;
    }

    // 如果没有分享链接，生成一个随机地址
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
      const noteData: {
        title: string;
        content: string;
        language: string;
        isPublic: boolean;
        customSlug: string;
        id?: string;
      } = {
        title: title || t('untitledNote'),
        content,
        language: locale,
        isPublic: true,
        customSlug: slugToUse
      };

      const url = '/api/notes';
      const method = existingCloudId ? 'PUT' : 'POST';
      
      if (existingCloudId) {
        noteData.id = existingCloudId;
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
        console.error('Error details:', errorData);
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
      
      // 更新本地笔记信息，保存云端信息
      if (currentLocalNote && saveNote) {
        const updatedLocalNote = {
          ...currentLocalNote,
          title: title || currentLocalNote.title,
          content,
          customSlug: slugToUse,
          isPublic: true,
          shareToken: savedNote.shareToken,
          cloudNoteId: savedNote.id
        };
        
        const updatedNote = saveNote(updatedLocalNote, currentLocalNote.id);
        if (updatedNote) {
          setCurrentLocalNote(updatedNote);
        }
      }
      
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

  const handleSlugChange = (val: string) => {
    setCustomSlug(val);
    validateSlug(val);
  };

  // 专注模式渲染
  if (isFocusMode) {
    return (
      <div className="w-full h-full flex flex-col paper-texture min-h-0">
        {/* 纸张边距线 - 复制PaperCard的效果 */}
        <div className="absolute left-16 top-0 bottom-0 w-px bg-red-400/60 dark:bg-red-300/40 z-10 shadow-sm"></div>
        <div className="absolute left-20 top-0 bottom-0 w-px bg-blue-300/50 dark:bg-blue-200/30 z-10 shadow-sm"></div>
        
        {/* 纸张孔洞效果 */}
        <div className="absolute left-8 top-8 w-2 h-2 bg-background border border-border/30 rounded-full shadow-inner"></div>
        <div className="absolute left-8 top-16 w-2 h-2 bg-background border border-border/30 rounded-full shadow-inner"></div>
        <div className="absolute left-8 top-24 w-2 h-2 bg-background border border-border/30 rounded-full shadow-inner"></div>
        
        {/* 全屏编辑器，带纸张线条背景 */}
        <div 
          className="relative flex-1 bg-card/90 backdrop-blur-sm min-h-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              transparent,
              transparent 31px,
              ${resolvedTheme === 'dark' ? 'oklch(0.285 0.022 79.5)' : 'oklch(0.896 0.015 75.8)'} 31px,
              ${resolvedTheme === 'dark' ? 'oklch(0.285 0.022 79.5)' : 'oklch(0.896 0.015 75.8)'} 32px
            )`,
            paddingTop: '32px',
            paddingBottom: '32px'
          }}
        >
          <div className="px-8 relative h-full">
            <NoteInput
              title={title}
              content={content}
              onTitleChange={setTitle}
              onContentChange={setContent}
              showPaperLines={false} // 因为已经有背景线条了
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 纸张样式的主编辑区域 */}
      <PaperCard
        header={
          <CardTitle className="flex items-center justify-between text-foreground">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full shadow-sm"></div>
              <div className="w-3 h-3 bg-yellow-500 dark:bg-yellow-400 rounded-full shadow-sm"></div>
              <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full shadow-sm"></div>
              <span className="ml-4 font-semibold">
                {isNewNote ? t('newNote') : (title || '无标题')}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {draftRestored && (
                <span className="flex items-center gap-1 text-primary">
                  <Check className="w-3 h-3" />
                  已恢复草稿
                </span>
              )}
              {autoSaving && (
                <span className="flex items-center gap-1 text-primary">
                  <Clock className="w-3 h-3 animate-spin" />
                  正在保存...
                </span>
              )}
              {lastSaved && !autoSaving && (
                <span className="flex items-center gap-1 text-primary">
                  <Check className="w-3 h-3" />
                  已保存 {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <div className="flex gap-2">
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  size="sm"
                  className="flex items-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  {saving ? '保存中' : '保存'}
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleFocusMode}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent/80"
                  title="专注模式"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardTitle>
        }
      >
        {/* 纯文本编辑器 */}
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