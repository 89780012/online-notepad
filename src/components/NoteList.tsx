'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FileText, Trash2, Plus, X, Share2 } from 'lucide-react';
import { LocalNote } from '@/hooks/useLocalNotes';

interface NoteListProps {
  notes: LocalNote[];
  deleteNote: (id: string) => void;
  onNoteSelect: (note: LocalNote) => void;
  onNewNote: () => void;
  onNoteDelete?: (noteId: string) => void;
  onNoteUnshare?: (noteId: string) => void; // 新增：取消分享回调
  selectedNoteId?: string;
  onCloseSidebar?: () => void; // 新增：关闭侧边栏的回调
}

export default function NoteList({ 
  notes, 
  deleteNote, 
  onNoteSelect, 
  onNewNote, 
  onNoteDelete,
  onNoteUnshare, 
  selectedNoteId,
  onCloseSidebar 
}: NoteListProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // 检测屏幕尺寸，判断是否为移动端
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg断点是1024px
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNoteSelect = (note: LocalNote) => {
    onNoteSelect(note);
    // 只在移动端选择笔记后关闭侧边栏
    if (isMobile) {
      onCloseSidebar?.();
    }
  };

  const handleNewNote = () => {
    onNewNote();
    // 只在移动端创建新笔记后关闭侧边栏
    if (isMobile) {
      onCloseSidebar?.();
    }
  };

  const handleDeleteNote = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (confirm(t('confirmDelete'))) {
      deleteNote(noteId);
      // 通知父组件笔记已被删除
      onNoteDelete?.(noteId);
    }
  };

  const handleUnshareNote = async (e: React.MouseEvent, note: LocalNote) => {
    e.stopPropagation();
    if (confirm(t('confirmUnshare'))) {
      try {
        // 如果笔记有云端ID，调用API取消分享
        if (note.cloudNoteId) {
          const response = await fetch('/api/notes', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: note.cloudNoteId,
              title: note.title,
              content: note.content,
              language: locale,
              isPublic: false // 设置为不公开
            })
          });

          if (response.ok) {
            // API更新成功后，删除云端记录
            await fetch(`/api/notes?id=${note.cloudNoteId}`, {
              method: 'DELETE'
            });
          }
        }
        
        // 通知父组件取消分享
        onNoteUnshare?.(note.id);
      } catch (error) {
        console.error('取消分享失败:', error);
      }
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
      return t('yesterday');
    } else if (diffDays < 7) {
      return `${diffDays}${t('daysAgo')}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="w-64 bg-sidebar/95 backdrop-blur-sm border-r border-sidebar-border flex flex-col h-full shadow-lg">
      {/* 头部：关闭按钮、新建按钮和搜索 */}
      <div className="p-4 border-b border-sidebar-border bg-sidebar-accent/30">
        {/* 移动端关闭按钮 */}
        <div className="flex justify-between items-center mb-3 lg:hidden">
          <h2 className="text-lg font-semibold text-sidebar-foreground font-serif">{t('noteList')}</h2>
          {onCloseSidebar && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCloseSidebar}
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Button 
          onClick={handleNewNote}
          className="w-full mb-3 flex items-center gap-2 bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {t('newNote')}
        </Button>
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-sidebar-foreground/50" />
          <Input
            placeholder={t('searchNotes')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-sidebar-accent/50 border-sidebar-border focus:border-sidebar-primary"
          />
        </div>
      </div>

      {/* 笔记列表 */}
      <div className="flex-1 overflow-y-auto bg-sidebar/50">
        {filteredNotes.length === 0 ? (
          <div className="p-4 text-center text-sidebar-foreground/60">
            <FileText className="w-12 h-12 mx-auto mb-2 text-sidebar-foreground/30" />
            <p className="text-sm">
              {searchQuery ? t('noNotesFound') : t('noNotesYet')}
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`px-4 py-3 cursor-pointer border-b border-sidebar-border/50 hover:bg-sidebar-accent/50 transition-colors group ${ 
                selectedNoteId === note.id ? 'bg-sidebar-accent border-l-4 border-l-sidebar-primary' : ''
              }`}
              onClick={() => handleNoteSelect(note)}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate text-sidebar-foreground">
                    {note.title || t('untitledNote')}
                  </h3>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-xs text-sidebar-foreground/60">
                    {formatDate(note.updatedAt)}
                  </span>
                  {note.isPublic && (
                    <>
                      <span className="text-xs text-sidebar-primary bg-sidebar-primary/10 px-1.5 py-0.5 rounded-full">
                        {t('shared')}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleUnshareNote(e, note)}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-600 transition-opacity"
                        title={t('unshareNote')}
                      >
                        <Share2 className="w-3 h-3" />
                      </Button>
                    </>
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