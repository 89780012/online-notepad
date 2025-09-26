'use client';

import { useState, useCallback, useEffect } from 'react';
import { Menu, X, Plus, BookOpen, History, FileText, Zap, LogOut } from 'lucide-react';
import TUIMarkdownEditor from '@/components/TUIMarkdownEditor';
import NoteList from '@/components/NoteList';
import LanguageToggle from '@/components/LanguageToggle';
import ThemeToggle from '@/components/ThemeToggle';
import LoginButton from '@/components/auth/LoginButton';
import UserDropdown from '@/components/auth/UserDropdown';
import { useAuth } from '@/contexts/AuthContext';
import MarketingContent from '@/components/MarketingContent';
import SharePopup from '@/components/SharePopup';
import SaveAsDialog from '@/components/SaveAsDialog';
import { useLocalNotes, LocalNote } from '@/hooks/useLocalNotes';
import { useNoteSyncManager } from '@/hooks/useNoteSyncManager';
import { Button } from '@/components/ui/button';
import { useTranslations, useLocale } from 'next-intl';
import { NoteMode, NOTE_MODES } from '@/types';
import { generateShareSlug } from '@/lib/id-utils';
import { useToast } from '@/components/ui/use-toast';
import { ConflictResolutionDialog } from '@/components/ConflictResolutionDialog';
import { SyncStatusIndicator } from '@/components/SyncStatusIndicator';
import Link from 'next/link';

export default function HomePage() {
  const { notes, saveNote, deleteNote, loadNotes } = useLocalNotes();
  const { user, isLoading: authLoading } = useAuth();
  const t = useTranslations();
  const locale = useLocale();
  const { toast } = useToast();

  // 创建适配器函数来匹配类型
  const saveNoteAdapter = useCallback((noteData: Omit<LocalNote, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => {
    return saveNote(noteData, existingId);
  }, [saveNote]);

  // 同步管理器
  const {
    syncInProgress,
    conflicts,
    lastSyncTime,
    isInitialSyncDone,
    performFullSync,
    resolveConflict,
    syncNoteToCloud,
    deleteNoteFromCloud,
    autoSyncModifiedNotes,
    setConflicts
  } = useNoteSyncManager(notes, saveNoteAdapter);

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

  // 同步相关状态
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isFullSyncing, setIsFullSyncing] = useState(false);


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
        
        // 显示保存成功提示
        toast({
          variant: "success",
          title: t('saveSuccess'),
          description: t('saveSuccessDescription'),
          duration: 3000
        });
        
        return savedNote;
      } else {
        // 保存失败的情况
        toast({
          variant: "destructive",
          title: t('saveFailed'),
          description: t('saveFailedDescription'),
          duration: 4000
        });
      }
      return null;
    } catch (error) {
      console.error(t('saveNoteFailed'), error);
      
      // 显示保存错误提示
      toast({
        variant: "destructive",
        title: t('saveFailed'),
        description: t('saveErrorDescription'),
        duration: 4000
      });
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

  // 定时检测内容变化并自动保存（本地 + 云端）
  useEffect(() => {
    // 只有在有选中笔记且编辑器显示时才自动保存
    if (!selectedNote || !showEditor || (!currentTitle && !currentContent || isFullSyncing )) return;
    
    // 保存到本地
    const savedNote = saveNote({
      title: currentTitle || t('untitled'),
      content: currentContent,
      mode: NOTE_MODES.MARKDOWN,
      customSlug: selectedNote?.customSlug || '',
      isPublic: selectedNote?.isPublic || false
    }, selectedNote?.id);

    // 如果用户已登录且完成初始同步，则自动同步到云端
    if (user && isInitialSyncDone && savedNote) {
      // 使用防抖，避免频繁同步
      const timeoutId = setTimeout(() => {
        console.log('自动同步笔记到云端:', savedNote.title);
        syncNoteToCloud(savedNote);
      }, 2000); // 2秒后同步

      return () => clearTimeout(timeoutId);
    }
  }, [currentTitle, currentContent, selectedNote, showEditor, saveNote, t, user, isInitialSyncDone, syncNoteToCloud]);

  // 登录后自动同步 - 只同步一次
  useEffect(() => {
    if (user && !authLoading && !isInitialSyncDone) {
      console.log('用户已登录，开始首次同步...', {
        userId: user.id,
        username: user.username,
        lastSyncTime,
        isInitialSyncDone
      });
      // 延迟执行同步，避免与现有加载冲突
      setTimeout(async () => {
        setIsFullSyncing(true);
        try {
          await performFullSync();
        } finally {
          setIsFullSyncing(false);
        }
      }, 1000);
    }
  }, [user, authLoading, isInitialSyncDone, lastSyncTime, performFullSync]);
  

  // 应用模板的函数
  const handleApplyTemplate = useCallback(async (template: { nameKey?: string; name?: string; content: string }) => {
    const templateContent = template.content
      .replace(/\$\{new Date\(\)\.toLocaleDateString\(\)\}/g, new Date().toLocaleDateString())
      .replace(/\$\{t\('([^']+)'\)\}/g, (match, key) => {
        try {
          return t(key);
        } catch {
          return match;
        }
      });

    // 使用 nameKey（新格式）或 name（旧格式）
    const templateName = template.nameKey ? t(template.nameKey) : (template.name || t('untitled'));

    // 先设置基本状态
    setSelectedNote(null);
    setShowEditor(true);
    setShowSidebar(true);

    // 延迟设置内容，确保编辑器已完全初始化
    setTimeout(() => {
      setCurrentTitle(templateName);
      setCurrentContent(templateContent);

      // 延迟保存模板笔记，确保状态已更新
      setTimeout(() => {
        try {
          const savedNote = saveNote({
            title: templateName,
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
      }, 100);
    }, 100);
  }, [t, saveNote]);

  useEffect(() => {
    loadNotes();
    setCurrentMode(NOTE_MODES.MARKDOWN);
    
    // 延迟检查模板，确保组件完全初始化
    setTimeout(() => {
      // 检查是否有待应用的模板
      const selectedTemplate = sessionStorage.getItem('selectedTemplate');
      console.log("selelctdTemplate", selectedTemplate)
      if (selectedTemplate) {
        try {
          const template = JSON.parse(selectedTemplate);
          handleApplyTemplate(template);
          sessionStorage.removeItem('selectedTemplate');
        } catch (error) {
          console.error('应用模板失败:', error);
        }
      } else {
        // 如果没有笔记，显示默认欢迎内容
        if (notes.length === 0) {
          setCurrentTitle(t('defaultNote.title'));
          setCurrentContent(t('defaultNote.content'));
          setShowEditor(true);
        }
      }
    }, 200); // 增加延迟时间确保组件完全加载
  }, [loadNotes, handleApplyTemplate, notes.length, t]);


  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (user && isInitialSyncDone) {
        // 网络恢复后只同步修改的笔记，不做完整同步
        setTimeout(() => {
          console.log('网络恢复，开始增量同步...');
          autoSyncModifiedNotes();
        }, 1000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 初始化网络状态
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, isInitialSyncDone, autoSyncModifiedNotes]);

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
    const newTitle = "New Note";
    const newContent = ""; // 使用默认模板内容
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

  // 一键专注启动 - 快速进入协作模式
  const handleQuickFocusStart = async () => {
    // 如果没有当前笔记，先创建一个新笔记
    if (!selectedNote || !currentTitle) {
      await handleNewNote();
      // 等待状态更新完成
      setTimeout(() => {
        setIsFocusMode(true);
        setShowSidebar(true); // 在专注模式下显示侧边栏以便协作
      }, 100);
    } else {
      // 如果有当前笔记，直接进入专注模式
      setIsFocusMode(true);
      setShowSidebar(true); // 在专注模式下显示侧边栏以便协作
    }
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
            console.error('分享失败:', 'Failed to create share link');
            toast({
              variant: "destructive",
              title: t('shareError'),
              description: t('shareErrorDescription') || 'Failed to create share link',
              duration: 4000
            });
            return;
          }
        } else {
          console.error('分享失败:', result.error);
          toast({
            variant: "destructive",
            title: t('shareError'),
            description: result.error === 'Invalid data' ? t('shareInvalidDataError') || 'Invalid note data' : result.error,
            duration: 4000
          });
          return;
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
  }, [locale, saveNote, generateRandomSlug, currentTitle, currentContent,t,toast]);

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

  const handleNoteDelete = async (noteId: string) => {
    // 如果用户已登录，先从云端删除
    const noteToDelete = notes.find(n => n.id === noteId);
    if (user && isInitialSyncDone && noteToDelete?.cloudNoteId) {
      console.log('删除云端笔记:', noteToDelete.title);
      await deleteNoteFromCloud(noteToDelete);
    }

    // 删除本地笔记
    deleteNote(noteId);

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

  const handleMultipleNotesDelete = async (noteIds: string[]) => {
    // 如果用户已登录，批量删除云端笔记
    if (user && isInitialSyncDone) {
      const notesToDelete = notes.filter(n => noteIds.includes(n.id) && n.cloudNoteId);
      console.log('批量删除云端笔记:', notesToDelete.length, '个');
      
      // 并行删除云端笔记
      await Promise.all(notesToDelete.map(note => deleteNoteFromCloud(note)));
    }

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
      <>
        <div className="fixed inset-0 bg-card flex flex-col paper-texture z-50 h-screen">
          {/* 右下角快速退出按钮 */}
          <Button
            onClick={handleExitFocusMode}
            className="fixed bottom-6 right-6 z-50 text-sm font-medium shadow-lg bg-red-500 hover:bg-red-600 text-white border-2 border-red-400 hover:border-red-300 transition-all duration-200 hover:scale-105"
            size="sm"
            title={t('quickExitFocus')}
          >
            <LogOut className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{t('quickExitFocus')}</span>
          </Button>
          
          {/* 专注模式快捷键提示 - 调整位置避免与退出按钮重叠 */}
          <div className="absolute bottom-6 left-6 z-50 opacity-30 hover:opacity-80 transition-opacity text-sm text-muted-foreground flex items-center gap-1">
            <span>按 ESC 键退出专注模式</span>
          </div>

          {/* 专注模式主内容区域 */}
          <div className="flex flex-1 overflow-hidden">
            {/* 左侧笔记列表 - 专注模式下的侧边栏 */}
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
            <div className="flex-1 overflow-hidden">
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
                showSidebar={showSidebar}
                onToggleSidebar={toggleSidebar}
              />
            </div>
          </div>
        </div>
        
        {/* 分享弹窗 - 专注模式也需要 */}
        <SharePopup
          isOpen={showSharePopup}
          onClose={() => setShowSharePopup(false)}
          shareUrl={shareUrl}
          onCopyUrl={handleCopyUrl}
          copied={copied}
          isGenerating={isGenerating}
        />

        {/* 另存为对话框 - 专注模式也需要 */}
        <SaveAsDialog
          isOpen={showSaveAsDialog}
          onClose={() => setShowSaveAsDialog(false)}
          onSave={handleDownload}
          defaultFilename={currentTitle || t('untitled')}
        />

        {/* 同步状态指示器 - 专注模式也需要 */}
        {user && (
          <SyncStatusIndicator
            isOnline={isOnline}
            syncInProgress={syncInProgress}
            lastSyncTime={lastSyncTime}
            conflictCount={conflicts.length}
            onSync={performFullSync}
            onShowConflicts={() => setShowConflictDialog(true)}
          />
        )}

        {/* 冲突解决对话框 - 专注模式也需要 */}
        <ConflictResolutionDialog
          conflicts={conflicts}
          onResolve={resolveConflict}
          onClose={() => {
            setShowConflictDialog(false);
            setConflicts([]);
          }}
          isOpen={showConflictDialog}
        />
      </>
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
          
          {/* 一键专注启动按钮 */}
          <Button
            onClick={handleQuickFocusStart}
            className="text-sm font-medium shadow-sm bg-orange-500 hover:bg-orange-600 text-white"
            size="sm"
            title={t('quickFocusStart')}
          >
            <Zap className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{t('quickFocusStart')}</span>
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

          {/* 博客按钮 */}
          <Link href="/blog">
            <Button
              variant="outline"
              size="sm"
              className="text-sm font-medium"
            >
              <FileText className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Blog</span>
            </Button>
          </Link>

          {/* 更新日志按钮 */}
          <Link href={locale === 'en' ? '/changelog' : `/${locale}/changelog`}>
            <Button
              variant="outline"
              size="sm"
              className="text-sm font-medium"
            >
              <History className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">{t('changelog.title')}</span>
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {/* 存储状态指示器 */}
          <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 text-xs text-muted-foreground">
            {user ? (
              <>
                <span className="text-green-600">☁️</span>
                <span>{t('welcome.storageInfo.withAccount').replace('☁️ ', '')}</span>
              </>
            ) : (
              <>
                <span className="text-blue-600">📱</span>
                <span>{t('welcome.storageInfo.localOnly').replace('📱 ', '')}</span>
              </>
            )}
          </div>
          
          <ThemeToggle />
          <LanguageToggle />
          
          {/* 认证相关组件 */}
          {!authLoading && (
            <>
              {user ? (
                <UserDropdown />
              ) : (
                <div className="flex items-center gap-2">
                  <LoginButton variant="login" />
                  <LoginButton variant="register" />
                </div>
              )}
            </>
          )}
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

      {/* 同步状态指示器 */}
      {user && (
        <SyncStatusIndicator
          isOnline={isOnline}
          syncInProgress={syncInProgress}
          lastSyncTime={lastSyncTime}
          conflictCount={conflicts.length}
          onSync={performFullSync}
          onShowConflicts={() => setShowConflictDialog(true)}
        />
      )}

      {/* 冲突解决对话框 */}
      <ConflictResolutionDialog
        conflicts={conflicts}
        onResolve={resolveConflict}
        onClose={() => {
          setShowConflictDialog(false);
          setConflicts([]);
        }}
        isOpen={showConflictDialog}
      />
    </div>
  );
}