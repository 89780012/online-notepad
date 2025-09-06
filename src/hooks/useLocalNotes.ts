'use client';

import { useState, useEffect, useCallback } from 'react';
import { NOTE_MODES } from '@/types';
import { generateNoteId } from '@/lib/id-utils';

// 定义 LocalNote 接口
export interface LocalNote {
  id: string;
  title: string;
  content: string;
  mode: typeof NOTE_MODES[keyof typeof NOTE_MODES];
  createdAt: string;
  updatedAt: string;
  customSlug?: string;
  isPublic?: boolean;
  shareToken?: string;
  cloudNoteId?: string;
}

const STORAGE_KEY = 'notepad_local_notes';

export function useLocalNotes() {
  const [notes, setNotes] = useState<LocalNote[]>([]);

  // 从 localStorage 加载笔记
  const loadNotes = useCallback(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsedNotes = JSON.parse(stored);
          setNotes(parsedNotes.sort((a: LocalNote, b: LocalNote) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          ));
        } catch (error) {
          console.error('Failed to parse local notes:', error);
          setNotes([]);
        }
      }
    }
  }, []);

  const getNodeById = useCallback((existingId: string) => {
      const currentNotes = [...notes];
      const index = currentNotes.findIndex(note => note.id === existingId);
      return currentNotes[index];
  }, [notes])

  // 添加或更新笔记
  const saveNote = useCallback((noteData: Omit<LocalNote, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => {
    const now = new Date().toISOString();
    let resultNote: LocalNote | undefined;
    
    setNotes(prevNotes => {
      const currentNotes = [...prevNotes];
      
      if (existingId) {
        // 更新现有笔记
        const index = currentNotes.findIndex(note => note.id === existingId);
        if (index !== -1) {
          currentNotes[index] = {
            ...currentNotes[index],
            ...noteData,
            updatedAt: now
          };
          resultNote = currentNotes[index];
        }
      } else {
        // 创建新笔记
        const newNote: LocalNote = {
          id: generateNoteId(),
          ...noteData,
          mode: noteData.mode || NOTE_MODES.MARKDOWN, // 默认使用 Markdown 模式
          createdAt: now,
          updatedAt: now
        };
        currentNotes.unshift(newNote);
        resultNote = newNote;
      }

      const sortedNotes = currentNotes.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      // 同步保存到 localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedNotes));
      }
      
      return sortedNotes;
    });
    
    return resultNote;
  }, []); // 移除所有依赖，使用函数式更新

  // 删除笔记
  const deleteNote = useCallback((id: string) => {
    setNotes(prevNotes => {
      const filteredNotes = prevNotes.filter(note => note.id !== id);
      
      // 同步保存到 localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredNotes));
      }
      
      return filteredNotes;
    });
  }, []); // 移除依赖，使用函数式更新

  // 搜索笔记
  const searchNotes = useCallback((query: string) => {
    if (!query.trim()) return notes;
    
    return notes.filter(note => 
      note.title.toLowerCase().includes(query.toLowerCase()) ||
      note.content.toLowerCase().includes(query.toLowerCase())
    );
  }, [notes]);

  // 组件挂载时加载笔记
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  return {
    notes,
    saveNote,
    deleteNote,
    searchNotes,
    loadNotes,
    getNodeById
  };
}