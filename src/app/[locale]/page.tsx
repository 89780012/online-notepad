'use client';

import { useState, useCallback, useEffect } from 'react';
import { Maximize2, Minimize2, Keyboard } from 'lucide-react';
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
      <div className="h-screen bg-background flex flex-col relative">
        {/* 专注模式退出按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExitFocusMode}
          className="absolute top-4 right-4 z-50 opacity-50 hover:opacity-100 transition-opacity"
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
    <div className="h-screen bg-gradient-to-br from-background to-muted flex flex-col">
      {/* 顶部导航 */}
      <header className="flex justify-between items-center p-4 bg-background border-b border-border z-10">
        <h1 className="text-3xl font-bold text-foreground">Mini Notepad</h1>
        <div className="flex items-center gap-2">
          {/* 专注模式按钮 - 只在有编辑器时显示 */}
          {showEditor && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFocusMode}
              className="text-muted-foreground hover:text-foreground"
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
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧笔记列表 */}
        <NoteList
          notes={notes}
          deleteNote={deleteNote}
          onNoteSelect={handleNoteSelect}
          onNewNote={handleNewNote}
          onNoteDelete={handleNoteDelete}
          selectedNoteId={selectedNote?.id}
        />

        {/* 右侧编辑器或营销内容 */}
        <main className="flex-1 overflow-auto">
          {!showEditor ? (
            <MarketingContent />
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