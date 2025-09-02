'use client';

import { useState } from 'react';
import { FileText, Hash, Plus, Download, Settings, Circle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NoteMode, NOTE_MODES } from '@/types/note-modes';

interface VerticalToolbarProps {
  currentMode: NoteMode;
  onModeChange: (mode: NoteMode) => void;
  onNewNote?: () => void;
  onExport?: () => void;
  className?: string;
}

export default function VerticalToolbar({ 
  currentMode, 
  onModeChange, 
  onNewNote,
  onExport,
  className = '' 
}: VerticalToolbarProps) {
  const [showModeMenu, setShowModeMenu] = useState(false);
  
  const modes = [
    {
      id: NOTE_MODES.PLAIN_TEXT,
      icon: FileText,
      title: '文本模式',
      description: '纯文本编辑'
    },
    {
      id: NOTE_MODES.MARKDOWN,
      icon: Hash,
      title: 'Markdown',
      description: '支持Markdown语法'
    }
  ];
  
  const currentModeInfo = modes.find(m => m.id === currentMode);

  return (
    <div className={`absolute right-4 top-1/2 -translate-y-1/2 z-30 ${className}`}>
      <div className="flex flex-col bg-card/90 text-center backdrop-blur-sm border border-border rounded-lg shadow-lg p-2 space-y-2 min-w-[48px]">
        {/* 模式切换圆形按钮 */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowModeMenu(!showModeMenu)}
            className="w-10 h-10 rounded-full p-0 hover:bg-accent/50 border border-border/50"
            title="切换模式"
          >
            <Circle className="h-5 w-5 text-primary fill-primary/20" />
          </Button>
          
          {/* 模式切换菜单 */}
          {showModeMenu && (
            <div className="absolute right-full top-0 mr-2 bg-card border border-border rounded-lg shadow-lg p-1 min-w-[160px]">
              <div className="text-xs text-muted-foreground p-2 border-b border-border">
                选择编辑模式
              </div>
              {modes.map((mode) => {
                const Icon = mode.icon;
                const isActive = mode.id === currentMode;
                
                return (
                  <Button
                    key={mode.id}
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      onModeChange(mode.id);
                      setShowModeMenu(false);
                    }}
                    className={`
                      w-full justify-start gap-2 py-2 px-2 h-auto my-1
                      ${isActive 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'hover:bg-accent/50 text-foreground'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex flex-col items-start text-left flex-1">
                      <span className="text-sm font-medium leading-none">{mode.title}</span>
                      <span className={`text-xs mt-0.5 ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {mode.description}
                      </span>
                    </div>
                  </Button>
                );
              })}
            </div>
          )}
        </div>
        
        {/* 新建按钮 */}
        {onNewNote && (
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNewNote}
              className="w-10 h-10 rounded-full p-0 hover:bg-accent/50 border border-border/50"
              title="新建笔记"
            >
              <Plus className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        )}
        
        {/* 导出按钮 */}
        {onExport && (
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={onExport}
              className="w-10 h-10 rounded-full p-0 hover:bg-accent/50 border border-border/50"
              title="导出笔记"
            >
              <Download className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        )}
        
        {/* 当前模式指示 */}
        <div className="text-center pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {currentModeInfo?.icon && <currentModeInfo.icon className="h-3 w-3 mx-auto mb-1" />}
            <div className="text-[10px] leading-tight">
              {currentModeInfo?.title}
            </div>
          </div>
        </div>
      </div>
      
      {/* 点击外部关闭菜单 */}
      {showModeMenu && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowModeMenu(false)}
        />
      )}
    </div>
  );
}