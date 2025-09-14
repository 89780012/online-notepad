'use client';

import { useState, useCallback, useEffect } from 'react';
import { Menu, X, Plus, BookOpen } from 'lucide-react';
import TUIMarkdownEditor from '@/components/TUIMarkdownEditor';
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
import { generateShareSlug } from '@/lib/id-utils';
import Link from 'next/link';

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

 const handleSaveNote = async () => {
    try {
      const savedNote = saveNote({
        title: currentTitle || t('untitled'),
        content: currentContent,
        mode: NOTE_MODES.MARKDOWN,
        customSlug: selectedNote?.customSlug || '',
        isPublic: selectedNote?.isPublic || false
      }, selectedNote?.id);

      if (savedNote) {
        setSelectedNote(savedNote);
        setShowEditor(true);
        setCurrentTitle(savedNote.title);
        setCurrentContent(savedNote.content);
        console.log('笔记保存成功');
        return savedNote;
      }
      return null;
    } catch (error) {
      console.error(t('saveNoteFailed'), error);
    }
    return null;
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
      return generateShareSlug();
  }, []);

  // 定时检测内容变化并自动保存
  useEffect(() => {
    // 只有在有选中笔记且编辑器显示时才自动保存
    if (!selectedNote || !showEditor || (!currentTitle && !currentContent)) return;
    
    saveNote({
      title: currentTitle || t('untitled'),
      content: currentContent,
      mode: NOTE_MODES.MARKDOWN,
      customSlug: selectedNote?.customSlug || '',
      isPublic: selectedNote?.isPublic || false
    }, selectedNote?.id);
  }, [currentTitle, currentContent, selectedNote, showEditor, saveNote, t]);

  // 应用模板的函数
  const handleApplyTemplate = useCallback(async (template: { name: string; content: string }) => {
    const templateContent = template.content
      .replace(/\$\{new Date\(\)\.toLocaleDateString\(\)\}/g, new Date().toLocaleDateString())
      .replace(/\$\{t\('([^']+)'\)\}/g, (match, key) => {
        try {
          return t(key);
        } catch {
          return match;
        }
      });

    setSelectedNote(null);
    setShowEditor(true);
    setShowSidebar(true);
    setCurrentTitle(t(template.name));
    setCurrentContent(templateContent);

    // 自动保存模板笔记
    try {
      const savedNote = saveNote({
        title: t(template.name),
        content: templateContent,
        mode: NOTE_MODES.MARKDOWN,
        customSlug: '',
        isPublic: false
      });
      if (savedNote) {
        setSelectedNote(savedNote);
      }
    } catch (error) {
      console.error('模板笔记保存失败:', error);
    }
  }, [t, saveNote]);

  useEffect(() => {
    loadNotes();
    setCurrentMode(NOTE_MODES.MARKDOWN);
    
    // 检查是否有待应用的模板
    const selectedTemplate = sessionStorage.getItem('selectedTemplate');
    if (selectedTemplate) {
      try {
        const template = JSON.parse(selectedTemplate);
        handleApplyTemplate(template);
        sessionStorage.removeItem('selectedTemplate');
      } catch (error) {
        console.error('应用模板失败:', error);
      }
    }
  }, [loadNotes, handleApplyTemplate]);


  const handleNoteSelect = (note: LocalNote) => {
    setSelectedNote(note);
    setShowEditor(true);
    setCurrentTitle(note.title);
    setCurrentContent(note.content);
    setCurrentMode(NOTE_MODES.MARKDOWN);
    
  };

  const handleNewNote = async () => {
    setSelectedNote(null);
    setShowEditor(true);
    setShowSidebar(true);
    const newTitle = t('newNoteTitle');
    const newContent = ''; // 简单的空内容，用户可以选择模板
    setCurrentTitle(newTitle);
    setCurrentContent(newContent);

    // 自动保存新笔记
    try {
      const savedNote = saveNote({
        title: newTitle,
        content: newContent,
        mode: currentMode,
        customSlug: '',
        isPublic: false
      });
      if (savedNote) {
        setSelectedNote(savedNote);
      }
    } catch (error) {
      console.error('新建笔记自动保存失败:', error);
    }
  };

  // 清除 Markdown 格式的函数
  const stripMarkdown = (text: string): string => {
    return text
      // 移除标题
      .replace(/^#{1,6}\s+/gm, '')
      // 移除粗体和斜体
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // 移除删除线
      .replace(/~~([^~]+)~~/g, '$1')
      // 移除代码块
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // 移除链接
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // 移除图片
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      // 移除引用
      .replace(/^>\s+/gm, '')
      // 移除列表标记
      .replace(/^[\s]*[-*+]\s+/gm, '')
      .replace(/^[\s]*\d+\.\s+/gm, '')
      // 移除任务列表
      .replace(/^[\s]*-\s+\[[x\s]\]\s+/gm, '')
      // 移除水平线
      .replace(/^---+$/gm, '')
      // 移除多余的空行
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  };

  // 处理清除 Markdown 格式
  const handleClearMarkdown = () => {
    const plainText = stripMarkdown(currentContent);
    setCurrentContent(plainText);
    console.log('Markdown格式已清除');
  };

  const handleShare = async () => {
    if (!selectedNote || !currentTitle || !currentContent) {
      // 先保存笔记
      const savedNote = await handleSaveNote();
      if (savedNote) {
        // 直接使用保存后返回的笔记对象，而不是依赖状态更新
        setShowSharePopup(true);
        // 直接调用分享逻辑，传入保存的笔记
        await handleShareNoteWithNote(savedNote);
      }

      return;
    }
    setShowSharePopup(true);
    handleShareNote();
  };

  // 公共的分享逻辑函数
  const shareNoteLogic = useCallback(async (noteToShare: LocalNote) => {
    setIsGenerating(true);

    try {
      // 生成随机slug
      const randomSlug = generateRandomSlug();

      const noteData = {
        title: currentTitle,
        content: currentContent,
        language: locale,
        isPublic: true,
        customSlug: noteToShare.customSlug || randomSlug
      };

      const response = await fetch('/api/notes', {
        method: noteToShare.cloudNoteId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...noteData, ...(noteToShare.cloudNoteId ? { id: noteToShare.cloudNoteId } : {}) })
      });

      const result = await response.json();

      if (!response.ok) {
        // 如果随机slug冲突，重新生成
        if (result.error === 'Custom URL is already taken') {
          const newSlug = `${randomSlug}`;
          const retryResponse = await fetch('/api/notes', {
            method: noteToShare.cloudNoteId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...noteData, customSlug: newSlug, ...(noteToShare.cloudNoteId ? { id: noteToShare.cloudNoteId } : {}) })
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
        ...noteToShare,
        isPublic: true,
        shareToken: result.shareToken,
        customSlug: result.customSlug,
        cloudNoteId: result.id
      }, noteToShare.id);

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
  }, [locale, saveNote, generateRandomSlug, currentTitle, currentContent]);

  // 使用保存的笔记对象进行分享
  const handleShareNoteWithNote = useCallback(async (noteToShare: LocalNote) => {
    await shareNoteLogic(noteToShare);
  }, [shareNoteLogic]);

  const handleShareNote = useCallback(async () => {

    if (!selectedNote) return;

    await shareNoteLogic(selectedNote);
  }, [selectedNote, shareNoteLogic]);

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

  const handleMultipleNotesDelete = (noteIds: string[]) => {
    // 检查是否有正在编辑的笔记被删除
    const currentNoteDeleted = selectedNote && noteIds.includes(selectedNote.id);
    
    if (currentNoteDeleted) {
      setSelectedNote(null);
      setShowEditor(false);
      // 清空编辑器内容，避免自动保存触发
      setCurrentTitle('');
      setCurrentContent('');
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };



  // 专注模式渲染
  if (isFocusMode) {
    return (
      <div className="fixed inset-0 bg-card flex flex-col paper-texture z-50 h-screen">
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
        <TUIMarkdownEditor
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
          onClearMarkdown={handleClearMarkdown}
          showSidebar={showSidebar}
          onToggleSidebar={toggleSidebar}
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
          
          {/* 模板市场按钮 */}
          <Link href={locale === 'en' ? '/templates' : `/${locale}/templates`}>
            <Button
              variant="outline"
              size="sm"
              className="text-sm font-medium"
            >
              <BookOpen className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">{t('browseTemplates')}</span>
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* 右侧编辑器或营销内容 */}
        <main className="flex flex-1 overflow-hidden bg-background">
          {/* 内容区域 - 包含笔记列表和编辑器 */}
          <div className="flex w-full h-full">
            {/* 左侧笔记列表 - 可伸缩 */}
            <div className={`
              transition-all duration-300 ease-in-out overflow-hidden border-r border-border bg-card/30
              ${showSidebar ? 'w-64' : 'w-0'}
            `}>
              {showSidebar && (
                <NoteList
                  notes={notes}
                  deleteNote={deleteNote}
                  onNoteSelect={handleNoteSelect}
                  onNewNote={handleNewNote}
                  onNoteDelete={handleNoteDelete}
                  onNoteUnshare={handleNoteUnshare}
                  onMultipleNotesDelete={handleMultipleNotesDelete}
                  selectedNoteId={selectedNote?.id}
                  onCloseSidebar={() => setShowSidebar(false)}
                />
              )}
            </div>

            {/* 右侧编辑器区域 - 自适应剩余空间 */}
            <div className="flex-1 overflow-auto">
              <div className="max-w-7xl mx-auto w-full h-full p-4">
                <TUIMarkdownEditor
                  title={currentTitle}
                  content={currentContent}
                  onTitleChange={setCurrentTitle}
                  onContentChange={setCurrentContent}
                  onSave={handleSaveNote}
                  onShare={handleShare}
                  onOpenFile={handleOpenFile}
                  onSaveAs={handleSaveAs}
                  onToggleFocusMode={toggleFocusMode}
                  onClearMarkdown={handleClearMarkdown}
                  showSidebar={showSidebar}
                  onToggleSidebar={toggleSidebar}
                />
                <MarketingContent onNewNote={handleNewNote} />
              </div>
            </div>
          </div>
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