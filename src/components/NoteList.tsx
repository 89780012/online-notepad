'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FileText, Trash2, Plus } from 'lucide-react';
import { LocalNote } from '@/hooks/useLocalNotes';

interface NoteListProps {
  notes: LocalNote[];
  deleteNote: (id: string) => void;
  onNoteSelect: (note: LocalNote) => void;
  onNewNote: () => void;
  onNoteDelete?: (noteId: string) => void;
  selectedNoteId?: string;
}

export default function NoteList({ notes, deleteNote, onNoteSelect, onNewNote, onNoteDelete, selectedNoteId }: NoteListProps) {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteNote = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (confirm(t('confirmDelete'))) {
      deleteNote(noteId);
      // 通知父组件笔记已被删除
      onNoteDelete?.(noteId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="w-80 bg-background border-r border-border flex flex-col h-full">
      {/* 头部：新建按钮和搜索 */}
      <div className="p-4 border-b border-border">
        <Button 
          onClick={onNewNote}
          className="w-full mb-3 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('newNote')}
        </Button>
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchNotes')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* 笔记列表 */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm">
              {searchQuery ? t('noNotesFound') : t('noNotesYet')}
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`px-4 py-3 cursor-pointer border-b border-border hover:bg-accent transition-colors group ${ 
                selectedNoteId === note.id ? 'bg-accent border-l-4 border-l-primary' : ''
              }`}
              onClick={() => onNoteSelect(note)}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate text-foreground">
                    {note.title || t('untitledNote')}
                  </h3>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(note.updatedAt)}
                  </span>
                  {note.isPublic && (
                    <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                      {t('shared')}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteNote(e, note.id)}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}