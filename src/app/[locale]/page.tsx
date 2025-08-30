'use client';

import { useState, useCallback, useEffect } from 'react';
import NoteEditor from '@/components/NoteEditor';
import NoteList from '@/components/NoteList';
import LanguageToggle from '@/components/LanguageToggle';
import MarketingContent from '@/components/MarketingContent';
import { LocalNote, useLocalNotes } from '@/hooks/useLocalNotes';

export default function HomePage() {
  const { notes, saveNote, deleteNote, loadNotes } = useLocalNotes();

  const [selectedNote, setSelectedNote] = useState<LocalNote | null>(null);
  const [isNewNote, setIsNewNote] = useState(true);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleNoteSelect = (note: LocalNote) => {
    setSelectedNote(note);
    setIsNewNote(false);
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setIsNewNote(true);
  };

  const handleNoteSaved = useCallback((savedNote: LocalNote) => {
    setSelectedNote(savedNote);
    setIsNewNote(false);
  }, []);

  const handleNoteDelete = (noteId: string) => {
    // The hook handles the deletion. We just need to update the UI if the deleted note was being edited.
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
      setIsNewNote(true);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* 顶部导航 */}
      <header className="flex justify-between items-center p-4 bg-white border-b border-gray-200 z-10">
        <h1 className="text-3xl font-bold text-slate-800">Mini Notepad</h1>
        <LanguageToggle />
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
          {selectedNote === null && isNewNote ? (
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