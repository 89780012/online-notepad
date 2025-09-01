'use client';

import { useState } from 'react';
import { FileText, Hash, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NoteMode, getAvailableModes, getModeConfig } from '@/types/note-modes';

// 图标映射
const iconMap = {
  FileText,
  Hash,
};

interface ModeSelectorProps {
  currentMode: NoteMode;
  onModeChange: (mode: NoteMode) => void;
  className?: string;
}

export default function ModeSelector({ currentMode, onModeChange, className = '' }: ModeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const availableModes = getAvailableModes();
  const currentConfig = getModeConfig(currentMode);

  const handleModeSelect = (mode: NoteMode) => {
    onModeChange(mode);
    setIsOpen(false);
  };

  const CurrentIcon = iconMap[currentConfig.icon as keyof typeof iconMap];

  return (
    <div className={`relative ${className}`}>
      {/* 当前模式按钮 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border-border hover:bg-accent/80"
      >
        <CurrentIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{currentConfig.name}</span>
      </Button>

      {/* 模式选择下拉菜单 */}
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 下拉菜单 */}
          <div className="absolute top-full left-0 mt-1 bg-card/95 backdrop-blur-sm border border-border rounded-md shadow-xl z-50 min-w-48">
            <div className="p-1">
              {availableModes.map((modeConfig) => {
                const Icon = iconMap[modeConfig.icon as keyof typeof iconMap];
                const isSelected = modeConfig.id === currentMode;
                
                return (
                  <button
                    key={modeConfig.id}
                    onClick={() => handleModeSelect(modeConfig.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 text-left rounded-sm transition-colors
                      hover:bg-accent/50 focus:outline-none focus:bg-accent/50
                      ${isSelected ? 'bg-accent text-accent-foreground' : 'text-foreground'}
                    `}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{modeConfig.name}</div>
                      <div className="text-xs text-muted-foreground">{modeConfig.description}</div>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}