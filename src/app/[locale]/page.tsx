'use client';

import { useState, useCallback, useEffect } from 'react';
import { Maximize2, Minimize2, Keyboard, Menu, X, Plus } from 'lucide-react';
import NoteEditor from '@/components/NoteEditor';
import NoteList from '@/components/NoteList';
import LanguageToggle from '@/components/LanguageToggle';
import ThemeToggle from '@/components/ThemeToggle';
import MarketingContent from '@/components/MarketingContent';
import { LocalNote, useLocalNotes } from '@/hooks/useLocalNotes';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const { notes, saveNote, deleteNote, loadNotes } = useLocalNotes();
  const t = useTranslations();

  const [selectedNote, setSelectedNote] = useState<LocalNote | null>(null);
  const [isNewNote, setIsNewNote] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // 默认隐藏侧边栏

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleNoteSelect = (note: LocalNote) => {
    setSelectedNote(note);
    setIsNewNote(false);
    setShowEditor(true);
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setIsNewNote(true);
    setShowEditor(true);
  };

  const handleNoteSaved = useCallback((savedNote: LocalNote) => {
    setSelectedNote(savedNote);
    setIsNewNote(false);
    setShowEditor(true);
  }, []);

  const handleNoteDelete = (noteId: string) => {
    // The hook handles the deletion. We just need to update the UI if the deleted note was being edited.
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
      setIsNewNote(false);
      setShowEditor(false);
    }
  };

  const toggleFocusMode = () => {
    setIsFocusMode(!isFocusMode);
  };

  const handleExitFocusMode = useCallback(() => {
    setIsFocusMode(false);
  }, []);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
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

  // 专注模式渲染
  if (isFocusMode && showEditor) {
    return (
      <div className="h-screen bg-card flex flex-col relative paper-texture">
        {/* 专注模式退出按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExitFocusMode}
          className="absolute top-4 right-4 z-50 opacity-50 hover:opacity-100 transition-opacity hover:bg-accent/80"
          title={t('exitFocusMode')}
        >
          <Minimize2 className="h-4 w-4" />
        </Button>
        
        {/* 专注模式快捷键提示 */}
        <div className="absolute bottom-4 left-4 z-50 opacity-30 hover:opacity-80 transition-opacity text-sm text-muted-foreground flex items-center gap-1">
          <Keyboard className="h-3 w-3" />
          <span>按 ESC 退出专注模式</span>
        </div>

        {/* 全屏编辑器 */}
        <div className="flex-1 p-4">
          <NoteEditor
            selectedNote={selectedNote}
            isNewNote={isNewNote}
            onNoteSaved={handleNoteSaved}
            saveNote={saveNote}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col paper-texture">
      {/* 顶部导航 - 纸张风格 */}
      <header className="flex justify-between items-center p-4 bg-card/80 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
          {/* 侧边栏切换按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="text-muted-foreground hover:text-foreground hover:bg-accent/80"
            title={showSidebar ? t('hideSidebar') : t('showSidebar')}
          >
            {showSidebar ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <h1 className="text-3xl font-bold text-foreground font-serif">Mini Notepad</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* 新建笔记按钮 */}
          <Button
            onClick={handleNewNote}
            className="text-sm font-medium shadow-sm bg-primary hover:bg-primary/90"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t('newNote')}
          </Button>
          
          {/* 专注模式按钮 - 只在有编辑器时显示 */}
          {showEditor && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFocusMode}
              className="text-muted-foreground hover:text-foreground hover:bg-accent/80"
              title={t('focusMode')}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* 左侧笔记列表 - 可折叠侧边栏 */}
        <div className={`
          transition-all duration-300 ease-in-out
          ${showSidebar ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
          absolute left-0 top-0 h-full z-20 lg:relative lg:translate-x-0 lg:opacity-100
          ${showSidebar ? 'lg:block' : 'lg:hidden'}
        `}>
          <NoteList
            notes={notes}
            deleteNote={deleteNote}
            onNoteSelect={handleNoteSelect}
            onNewNote={handleNewNote}
            onNoteDelete={handleNoteDelete}
            selectedNoteId={selectedNote?.id}
            onCloseSidebar={() => setShowSidebar(false)}
          />
        </div>

        {/* 遮罩层 - 移动端显示侧边栏时使用 */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-10 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* 右侧编辑器或营销内容 */}
        <main className={`
          flex-1 overflow-auto transition-all duration-300 ease-in-out
          ${showSidebar ? 'lg:ml-0' : 'ml-0'}
        `}>
          {!showEditor ? (
            <MarketingContent onNewNote={handleNewNote} />
          ) : (
            <div className="h-full p-4">
              <NoteEditor
                selectedNote={selectedNote}
                isNewNote={isNewNote}
                onNoteSaved={handleNoteSaved}
                saveNote={saveNote}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}