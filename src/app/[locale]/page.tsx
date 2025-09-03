'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Menu, X, Plus } from 'lucide-react';
import NewMarkdownEditor from '@/components/NewMarkdownEditor';
import NoteList from '@/components/NoteList';
import LanguageToggle from '@/components/LanguageToggle';
import ThemeToggle from '@/components/ThemeToggle';
import MarketingContent from '@/components/MarketingContent';
import SharePopup from '@/components/SharePopup';
import SaveAsDialog from '@/components/SaveAsDialog';
import { useLocalNotes, LocalNote } from '@/hooks/useLocalNotes';
import { Button } from '@/components/ui/button';
import { useTranslations, useLocale } from 'next-intl';
import { NoteMode, NOTE_MODES } from '@/types';

export default function HomePage() {
  const { notes, saveNote, deleteNote, loadNotes } = useLocalNotes();
  const t = useTranslations();
  const locale = useLocale();

  const [selectedNote, setSelectedNote] = useState<LocalNote | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // 侧边栏默认隐藏
  const [currentMode, setCurrentMode] = useState<NoteMode>(NOTE_MODES.MARKDOWN); // 当前编辑模式
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentContent, setCurrentContent] = useState('');
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  // 分享相关状态
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // 另存为相关状态
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);

  // 自动保存相关状态
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAutoSaveRef = useRef<string>(''); // 记录最后一次自动保存的内容

  // 处理打开本地文件
  const handleOpenFile = (title: string, content: string) => {
    setCurrentTitle(title);
    setCurrentContent(content);
    // 创建一个新的临时笔记状态，不立即保存到localStorage
    setSelectedNote(null);
    setShowEditor(true);
  };

  // 处理另存为
  const handleSaveAs = () => {
    setShowSaveAsDialog(true);
  };

  // 处理文件下载
  const handleDownload = (filename: string) => {
    const content = currentContent;
    const title = currentTitle || filename;
    
    // 创建文件内容，包含标题和内容
    const fileContent = `# ${title}\n\n${content}`;
    
    // 确保文件名有扩展名
    const finalFilename = filename.includes('.') ? filename : `${filename}.md`;
    
    // 创建Blob并下载
    const blob = new Blob([fileContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  // 生成随机分享后缀
  const generateRandomSlug = useCallback(() => {
    const adjectives = ['swift', 'bright', 'clever', 'quick', 'wise', 'bold', 'calm', 'cool', 'kind', 'smart'];
    const nouns = ['note', 'idea', 'memo', 'text', 'doc', 'page', 'file', 'draft', 'post', 'word'];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 1000);
    return `${adjective}-${noun}-${number}`;
  }, []);

  // 自动保存函数
  const autoSaveNote = useCallback(async () => {
    if (!currentTitle && !currentContent) return;

    const currentContentKey = `${currentTitle}:${currentContent}`;
    if (currentContentKey === lastAutoSaveRef.current) {
      return; // 内容没有变化，不需要保存
    }

    setIsAutoSaving(true);
    try {
      const savedNote = saveNote({
        title: currentTitle || t('untitled'),
        content: currentContent,
        mode: currentMode,
        customSlug: selectedNote?.customSlug || '',
        isPublic: selectedNote?.isPublic || false
      }, selectedNote?.id);

      if (savedNote) {
        setSelectedNote(savedNote);
        lastAutoSaveRef.current = currentContentKey;
      }
    } catch (error) {
      console.error('自动保存失败:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [currentTitle, currentContent, currentMode, selectedNote, saveNote, t]);

  // 防抖自动保存
  const debouncedAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveNote();
    }, 2000); // 2秒后自动保存
  }, [autoSaveNote]);

  useEffect(() => {
    loadNotes();
    setCurrentMode(NOTE_MODES.MARKDOWN);
  }, [loadNotes]);

  // 监听内容变化，触发自动保存
  useEffect(() => {
    if (currentTitle || currentContent) {
      debouncedAutoSave();
    }
  }, [currentTitle, currentContent, debouncedAutoSave]);

  // 清理自动保存定时器
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const handleNoteSelect = (note: LocalNote) => {
    setSelectedNote(note);
    setShowEditor(true);
    setCurrentTitle(note.title);
    setCurrentContent(note.content);
    setCurrentMode(NOTE_MODES.MARKDOWN);
    
    // 重置自动保存状态
    lastAutoSaveRef.current = `${note.title}:${note.content}`;
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setShowEditor(true);
    setCurrentTitle('');
    setCurrentContent('');
    
    // 重置自动保存状态
    lastAutoSaveRef.current = '';
  };

  const handleNoteSaved = useCallback((savedNote: LocalNote) => {
    setSelectedNote(savedNote);
    setShowEditor(true);
    setCurrentTitle(savedNote.title);
    setCurrentContent(savedNote.content);
  }, []);

  const handleSaveNote = async () => {
    try {
      const savedNote = saveNote({
        title: currentTitle || t('untitled'),
        content: currentContent,
        mode: currentMode,
        customSlug: selectedNote?.customSlug || '',
        isPublic: selectedNote?.isPublic || false
      }, selectedNote?.id);

      if (savedNote) {
        handleNoteSaved(savedNote);
        lastAutoSaveRef.current = `${savedNote.title}:${savedNote.content}`;
        console.log('笔记保存成功');
      }
    } catch (error) {
      console.error(t('saveNoteFailed'), error);
    }
  };

  const handleShare = async () => {
    if (!selectedNote || !currentTitle || !currentContent) {
      // 先保存笔记
      await handleSaveNote();
      // 等待状态更新
      setTimeout(() => {
        setShowSharePopup(true);
        handleShareNote();
      }, 100);
      return;
    }
    
    setShowSharePopup(true);
    handleShareNote();
  };

  const handleShareNote = useCallback(async () => {
    if (!selectedNote) return;
    
    setIsGenerating(true);

    try {
      // 生成随机后缀
      const randomSlug = generateRandomSlug();
      
      const noteData = {
        title: currentTitle,
        content: currentContent,
        language: locale,
        isPublic: true,
        customSlug: randomSlug
      };

      const response = selectedNote.cloudNoteId
        ? await fetch('/api/notes', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...noteData, id: selectedNote.cloudNoteId })
          })
        : await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteData)
          });

      const result = await response.json();

      if (!response.ok) {
        // 如果随机slug冲突，重新生成
        if (result.error === 'Custom URL is already taken') {
          const newSlug = `${randomSlug}-${Date.now()}`;
          const retryResponse = await fetch('/api/notes', {
            method: selectedNote.cloudNoteId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...noteData, customSlug: newSlug, ...(selectedNote.cloudNoteId ? { id: selectedNote.cloudNoteId } : {}) })
          });
          
          if (retryResponse.ok) {
            const retryResult = await retryResponse.json();
            result.shareToken = retryResult.shareToken;
            result.customSlug = retryResult.customSlug;
            result.id = retryResult.id;
          } else {
            throw new Error('Failed to create share link');
          }
        } else {
          throw new Error(result.error);
        }
      }

      // 更新本地笔记的分享信息
      const updatedNote = saveNote({
        ...selectedNote,
        isPublic: true,
        shareToken: result.shareToken,
        customSlug: result.customSlug,
        cloudNoteId: result.id
      }, selectedNote.id);

      if (updatedNote) {
        setSelectedNote(updatedNote);
      }

      // 生成分享链接
      const shareUrl = result.customSlug
        ? `${window.location.origin}/${locale}/share/${result.customSlug}`
        : `${window.location.origin}/${locale}/share/${result.shareToken}`;
        
      setShareUrl(shareUrl);
    } catch (error) {
      console.error('分享失败:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedNote, currentTitle, currentContent, locale, saveNote, generateRandomSlug]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 当分享弹窗打开时，如果已有分享信息则显示
  useEffect(() => {
    if (showSharePopup && selectedNote?.isPublic) {
      if (selectedNote.customSlug) {
        setShareUrl(`${window.location.origin}/${locale}/share/${selectedNote.customSlug}`);
      } else if (selectedNote.shareToken) {
        setShareUrl(`${window.location.origin}/${locale}/share/${selectedNote.shareToken}`);
      }
    } else if (!showSharePopup) {
      // 重置分享状态
      setShareUrl('');
      setCopied(false);
      setIsGenerating(false);
    }
  }, [showSharePopup, selectedNote, locale]);

  const toggleFocusMode = () => {
    setIsFocusMode(!isFocusMode);
  };

  const handleExitFocusMode = () => {
    setIsFocusMode(false);
  };

  // ESC键退出专注模式
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      }
    };

    if (isFocusMode) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isFocusMode]);

  const handleNoteDelete = (noteId: string) => {
    // The hook handles the deletion. We just need to update the UI if the deleted note was being edited.
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
      setShowEditor(false);
    }
  };

  const handleNoteUnshare = (noteId: string) => {
    // 更新本地笔记的分享状态
    const noteToUpdate = notes.find(n => n.id === noteId);
    if (noteToUpdate) {
      const updatedNote = saveNote({
        ...noteToUpdate,
        isPublic: false,
        shareToken: undefined,
        customSlug: undefined,
        cloudNoteId: undefined
      }, noteToUpdate.id);

      // 如果当前正在编辑这条笔记，更新当前选中的笔记状态
      if (selectedNote?.id === noteId && updatedNote) {
        setSelectedNote(updatedNote);
      }
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };



  // 专注模式渲染
  if (isFocusMode) {
    return (
      <div className="fixed inset-0 bg-card flex flex-col relative paper-texture z-50 h-screen">
        {/* 专注模式退出按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExitFocusMode}
          className="absolute top-4 right-4 z-50 opacity-50 hover:opacity-100 transition-opacity hover:bg-accent/80"
          title={t('exitFocusMode')}
        >
          <X className="h-4 w-4" />
        </Button>
        
        {/* 专注模式快捷键提示 */}
        <div className="absolute bottom-4 left-4 z-50 opacity-30 hover:opacity-80 transition-opacity text-sm text-muted-foreground flex items-center gap-1">
          <span>按 ESC 键退出专注模式</span>
        </div>

        {/* 全屏编辑器 */}
        <NewMarkdownEditor
          title={currentTitle}
          content={currentContent}
          onTitleChange={setCurrentTitle}
          onContentChange={setCurrentContent}
          onSave={handleSaveNote}
          onShare={handleShare}
          onOpenFile={handleOpenFile}
          onSaveAs={handleSaveAs}
          isFocusMode={true}
          onToggleFocusMode={handleExitFocusMode}
          isAutoSaving={isAutoSaving}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col paper-texture">
      {/* 顶部导航 - 纸张风格 */}
      <header className="flex justify-between items-center p-4 bg-card/80 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
          {/* 侧边栏切换按钮 - 所有屏幕尺寸下都显示 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="text-muted-foreground hover:text-foreground hover:bg-accent/80"
            title={showSidebar ? t('hideSidebar') : t('showSidebar')}
          >
            {showSidebar ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground font-serif">Mini Notepad</h1>
          
          {/* 新建笔记按钮 - 移动到标题右侧 */}
          <Button
            onClick={handleNewNote}
            className="text-sm font-medium shadow-sm bg-primary hover:bg-primary/90"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{t('newNote')}</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* 左侧笔记列表 - 默认隐藏，可通过工具栏按钮打开 */}
        <div className={`
          w-64 border-r border-border bg-card/30 z-20
          ${showSidebar ? 'block' : 'hidden'}
          ${showSidebar ? 'absolute left-0 top-0 h-full' : ''}
        `}>
          <NoteList
            notes={notes}
            deleteNote={deleteNote}
            onNoteSelect={handleNoteSelect}
            onNewNote={handleNewNote}
            onNoteDelete={handleNoteDelete}
            onNoteUnshare={handleNoteUnshare}
            selectedNoteId={selectedNote?.id}
            onCloseSidebar={() => setShowSidebar(false)}
          />
        </div>

        {/* 右侧编辑器或营销内容 */}
        <main className="flex-1 overflow-auto">
          {!showEditor ? (
            <MarketingContent onNewNote={handleNewNote} />
          ) : (
            <div className="max-w-7xl mx-auto w-full h-full">
              <NewMarkdownEditor
                title={currentTitle}
                content={currentContent}
                onTitleChange={setCurrentTitle}
                onContentChange={setCurrentContent}
                onSave={handleSaveNote}
                onShare={handleShare}
                onOpenFile={handleOpenFile}
                onSaveAs={handleSaveAs}
                onToggleFocusMode={toggleFocusMode}
                isAutoSaving={isAutoSaving}
              />
            </div>
          )}
        </main>
      </div>
      
      {/* 分享弹窗 */}
      <SharePopup
        isOpen={showSharePopup}
        onClose={() => setShowSharePopup(false)}
        shareUrl={shareUrl}
        onCopyUrl={handleCopyUrl}
        copied={copied}
        isGenerating={isGenerating}
      />

      {/* 另存为对话框 */}
      <SaveAsDialog
        isOpen={showSaveAsDialog}
        onClose={() => setShowSaveAsDialog(false)}
        onSave={handleDownload}
        defaultFilename={currentTitle || t('untitled')}
      />
    </div>
  );
}