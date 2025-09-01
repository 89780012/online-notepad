'use client';

import { useState, useEffect, useCallback } from 'react';
import { NoteMode, NOTE_MODES } from '@/types/note-modes';

export interface LocalNote {
  id: string;
  title: string;
  content: string;
  mode: NoteMode; // 新增：笔记编辑模式
  createdAt: string;
  updatedAt: string;
  customSlug?: string;
  isPublic?: boolean;
  shareToken?: string; // 云端笔记的分享令牌
  cloudNoteId?: string; // 云端笔记ID，用于更新操作
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

  // 保存笔记到 localStorage
  const saveNotes = useCallback((notesToSave: LocalNote[]) => {
    if (typeof window !== 'undefined') {
      const sortedNotes = notesToSave.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedNotes));
      setNotes(sortedNotes);
      return sortedNotes; // 返回已排序的笔记
    }
    return [];
  }, [setNotes]);

  const getNodeById = useCallback((existingId: string) => {
      const currentNotes = [...notes];
      const index = currentNotes.findIndex(note => note.id === existingId);
      return currentNotes[index];
  }, [notes])

  // 添加或更新笔记
  const saveNote = useCallback((noteData: Omit<LocalNote, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => {
    const now = new Date().toISOString();
    const currentNotes = [...notes];
    
    if (existingId) {
      // 更新现有笔记
      const index = currentNotes.findIndex(note => note.id === existingId);
      if (index !== -1) {
        currentNotes[index] = {
          ...currentNotes[index],
          ...noteData,
          updatedAt: now
        };
      }
    } else {
      // 创建新笔记
      const newNote: LocalNote = {
        id: crypto.randomUUID(),
        ...noteData,
        mode: noteData.mode || NOTE_MODES.PLAIN_TEXT, // 默认使用纯文本模式
        createdAt: now,
        updatedAt: now
      };
      currentNotes.unshift(newNote);
    }

    const updatedNotes = saveNotes(currentNotes);
    const newOrUpdatedNote = updatedNotes.find(note =>
      existingId ? note.id === existingId : note.createdAt === now
    );
    return newOrUpdatedNote;
  }, [notes, saveNotes]);

  // 删除笔记
  const deleteNote = useCallback((id: string) => {
    const filteredNotes = notes.filter(note => note.id !== id);
    saveNotes(filteredNotes);
  }, [notes, saveNotes]);

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