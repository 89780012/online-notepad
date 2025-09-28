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
  
  // 新增同步相关字段
  userId?: string;           // 所属用户ID
  cloudUpdatedAt?: string;   // 云端最后更新时间
  syncStatus?: 'synced' | 'local_only' | 'cloud_only' | 'conflict'; // 同步状态
  lastSyncAt?: string;       // 最后同步时间
  contentHash?: string;      // 内容哈希，用于快速比较
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
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ));
        } catch (error) {
          console.error('Failed to parse local notes:', error);
          setNotes([]);
        }
      }
    }
  }, []);

  // 更新笔记的同步状态，不影响其他字段
  const updateNoteSyncStatus = useCallback((noteId: string, syncStatus: 'synced' | 'local_only' | 'cloud_only' | 'conflict') => {
    setNotes(prevNotes => {
      const updatedNotes = prevNotes.map(note =>
        note.id === noteId
          ? { ...note, syncStatus }
          : note
      ).sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // 同步保存到 localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
      }

      return updatedNotes;
    });
  }, []);

  // 批量更新笔记的同步状态
  const batchUpdateSyncStatus = useCallback((updates: Array<{noteId: string, syncStatus: 'synced' | 'local_only' | 'cloud_only' | 'conflict'}>) => {
    setNotes(prevNotes => {
      const updateMap = new Map(updates.map(u => [u.noteId, u.syncStatus]));

      const updatedNotes = prevNotes.map(note =>
        updateMap.has(note.id)
          ? { ...note, syncStatus: updateMap.get(note.id)! }
          : note
      ).sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // 同步保存到 localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
      }

      return updatedNotes;
    });
  }, []);

  // 添加或更新笔记
  const saveNote = useCallback((noteData: Omit<LocalNote, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => {
    const now = new Date().toISOString();
    let resultNote: LocalNote;

    // 先创建或更新笔记对象
    if (existingId) {
      // 更新现有笔记 - 需要先获取当前笔记
      const currentNotes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const index = currentNotes.findIndex((note: LocalNote) => note.id === existingId);
      if (index !== -1) {
        resultNote = {
          ...currentNotes[index],
          ...noteData,
          updatedAt: now
        };
      } else {
        // 如果找不到现有笔记，创建新笔记
        resultNote = {
          //id: generateNoteId(),
          id: existingId,   //传递过来的表示一定是存在的
          ...noteData,
          mode: noteData.mode || NOTE_MODES.MARKDOWN,
          createdAt: now,
          updatedAt: now
        };
      }
    } else {
      // 创建新笔记
      resultNote = {
        id: generateNoteId(),
        ...noteData,
        mode: noteData.mode || NOTE_MODES.MARKDOWN,
        createdAt: now,
        updatedAt: now
      };
    }

    // 更新状态
    setNotes(prevNotes => {
      const currentNotes = [...prevNotes];

      if (existingId) {
        // 更新现有笔记
        const index = currentNotes.findIndex(note => note.id === existingId);
        if (index !== -1) {
          currentNotes[index] = resultNote;
        } else {
          // 如果找不到，添加为新笔记
          currentNotes.unshift(resultNote);
        }
      } else {
        // 添加新笔记
        currentNotes.unshift(resultNote);
      }

      const sortedNotes = currentNotes.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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

  // 手动触发重新排序
  const sortNotes = useCallback(() => {
    setNotes(prevNotes => {
      const sortedNotes = [...prevNotes].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // 同步保存到 localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedNotes));
      }

      return sortedNotes;
    });
  }, []);

  const getNodeById = useCallback((existingId: string) => {
      const currentNotes = [...notes];
      const index = currentNotes.findIndex(note => note.id === existingId);
      return currentNotes[index];
  }, [notes])

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
    getNodeById,
    updateNoteSyncStatus,
    batchUpdateSyncStatus,
    sortNotes
  };
}