'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { LocalNote } from './useLocalNotes';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { generateNoteId } from '@/lib/id-utils';
import { NOTE_MODES } from '@/types';

export interface SyncConflict {
  noteId: string;
  localNote: LocalNote;
  cloudNote: LocalNote;
  conflictType: 'content' | 'title' | 'both';
}

export interface CloudNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  contentHash: string;
  noteMode: string;
  localId?: string;
}

export function useCloudSync() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'conflict'>('idle');
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const t = useTranslations();

  // 计算内容哈希
  const calculateHash = useCallback((note: Pick<LocalNote, 'title' | 'content' >) => {
    const content = `${note.title}|${note.content}`;
    // 使用简单的哈希算法
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }, []);

  // 上传本地笔记到云端
  const uploadToCloud = useCallback(async (note: LocalNote): Promise<LocalNote | null> => {
    if (!user) return null;

    try {
      const contentHash = calculateHash(note);
      
      console.log('上传笔记到云端:', note.title, {
        localHash: contentHash,
        storedHash: note.contentHash,
        cloudNoteId: note.cloudNoteId
      });
      
      const response = await fetch('/api/notes/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: note.title,
          content: note.content,
          noteMode: note.mode,
          contentHash,
          localId: note.id,
          cloudNoteId: note.cloudNoteId
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('上传成功，返回结果:', {
          cloudId: result.id,
          cloudHash: result.contentHash,
          localId: note.id
        });
        
        return {
          ...note,
          cloudNoteId: result.id,
          cloudUpdatedAt: result.updatedAt,
          syncStatus: 'synced',
          lastSyncAt: new Date().toISOString(),
          contentHash: result.contentHash || contentHash, // 使用服务器返回的hash或本地计算的hash
          userId: user.id
        };
      } else {
        const error = await response.json();
        console.error('Upload to cloud failed:', error);
        toast({
          variant: "destructive",
          title: t('uploadFailed'),
          description: error.error || t('sync.uploadFailedToCloud'),
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Upload to cloud failed:', error);
      toast({
        variant: "destructive",
        title: t('uploadFailed'),
        description: t('sync.networkError'),
        duration: 4000
      });
    }
    return null;
  }, [user, calculateHash, toast, t]);

  // 从云端下载笔记
  const downloadFromCloud = useCallback(async (): Promise<LocalNote[]> => {
    if (!user) return [];

    try {
      const response = await fetch('/api/notes/sync', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const { notes } = await response.json();
        return notes.map((note: CloudNote) => ({
          id: note.localId || generateNoteId(),
          title: note.title,
          content: note.content,
          mode: (note.noteMode as keyof typeof NOTE_MODES) || NOTE_MODES.MARKDOWN,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
          cloudNoteId: note.id,
          cloudUpdatedAt: note.updatedAt,
          userId: note.userId,
          contentHash: note.contentHash,
          syncStatus: 'synced' as const,
          lastSyncAt: new Date().toISOString(),
          isPublic: false
        }));
      } else {
        const error = await response.json();
        console.error('Download from cloud failed:', error);
        toast({
          variant: "destructive",
          title: t('sync.syncFailed'),
          description: error.error || t('sync.downloadFailedFromCloud'),
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Download from cloud failed:', error);
      toast({
        variant: "destructive",
        title: t('sync.syncFailed'),
        description: t('sync.networkError'),
        duration: 4000
      });
    }
    return [];
  }, [user, toast, t]);

  // 检测冲突
  const detectConflicts = useCallback((localNotes: LocalNote[], cloudNotes: LocalNote[]): SyncConflict[] => {
    const conflicts: SyncConflict[] = [];

    localNotes.forEach(localNote => {
      if (!localNote.cloudNoteId) return;

      const cloudNote = cloudNotes.find(n => n.cloudNoteId === localNote.cloudNoteId);
      if (!cloudNote) return;

      // 比较内容哈希和更新时间
      const localHash = calculateHash(localNote);
      const cloudHash = cloudNote.contentHash || calculateHash(cloudNote);
      
      // 比较更新时间
      const localUpdatedAt = new Date(localNote.updatedAt).getTime();
      const cloudUpdatedAt = new Date(cloudNote.updatedAt).getTime();
      
      console.log('冲突检测:', localNote.title, {
        localHash,
        cloudHash,
        localUpdatedAt: new Date(localNote.updatedAt).toISOString(),
        cloudUpdatedAt: new Date(cloudNote.updatedAt).toISOString(),
        hashMatch: localHash === cloudHash,
        timeMatch: Math.abs(localUpdatedAt - cloudUpdatedAt) < 5000 // 5秒内认为是同一次更新
      });

      // 只有在内容真正不同且时间差异较大时才认为是冲突
      if (localHash !== cloudHash && Math.abs(localUpdatedAt - cloudUpdatedAt) > 5000) {
        let conflictType: 'content' | 'title' | 'both' = 'content';
        
        if (localNote.title !== cloudNote.title && localNote.content !== cloudNote.content) {
          conflictType = 'both';
        } else if (localNote.title !== cloudNote.title) {
          conflictType = 'title';
        }

        console.log('发现真实冲突:', localNote.title, conflictType);
        
        conflicts.push({
          noteId: localNote.id,
          localNote,
          cloudNote,
          conflictType
        });
      }
    });

    return conflicts;
  }, [calculateHash]);

  // 删除云端笔记
  const deleteFromCloud = useCallback(async (cloudNoteId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch(`/api/notes/sync?id=${cloudNoteId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        return true;
      } else {
        const error = await response.json();
        console.error('Delete from cloud failed:', error);
        toast({
          variant: "destructive",
          title: t('sync.syncFailed'),
          description: error.error || t('sync.deleteFailedFromCloud'),
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Delete from cloud failed:', error);
      toast({
        variant: "destructive",
        title: t('sync.syncFailed'),
        description: t('sync.networkError'),
        duration: 4000
      });
    }
    return false;
  }, [user, toast, t]);

  return {
    syncStatus,
    setSyncStatus,
    conflicts,
    setConflicts,
    uploadToCloud,
    downloadFromCloud,
    detectConflicts,
    deleteFromCloud,
    calculateHash
  };
}
