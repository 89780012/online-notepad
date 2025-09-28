'use client';

import { useState, useCallback, useEffect } from 'react';
import { LocalNote } from './useLocalNotes';
import { useAuth } from '@/contexts/AuthContext';
import { useCloudSync, SyncConflict } from './useCloudSync';
import { useToast } from '@/components/ui/use-toast';

export function useNoteSyncManager(
  notes: LocalNote[],
  saveNote: (noteData: Omit<LocalNote, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => LocalNote
) {
  const { user } = useAuth();
  const { 
    uploadToCloud, 
    downloadFromCloud, 
    detectConflicts, 
    deleteFromCloud,
    calculateHash
  } = useCloudSync();
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isInitialSyncDone, setIsInitialSyncDone] = useState(false);

  // 当用户信息加载完成时，从localStorage恢复同步状态
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const userLastSyncTime = localStorage.getItem(`lastSyncTime_${user.id}`);
      const userIsInitialSyncDone = localStorage.getItem(`isInitialSyncDone_${user.id}`) === 'true';
      
      setLastSyncTime(userLastSyncTime);
      setIsInitialSyncDone(userIsInitialSyncDone);
      
      console.log(`用户 ${user.username} 的同步状态:`, {
        lastSyncTime: userLastSyncTime,
        isInitialSyncDone: userIsInitialSyncDone
      });
    } else if (!user) {
      // 用户退出时清除内存状态，但保留localStorage数据供下次登录使用
      setLastSyncTime(null);
      setIsInitialSyncDone(false);
    }
  }, [user]);

  // 提供清除用户同步数据的函数（可在需要时调用）
  const clearUserSyncData = useCallback((userId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`lastSyncTime_${userId}`);
      localStorage.removeItem(`isInitialSyncDone_${userId}`);
      console.log(`已清除用户 ${userId} 的同步数据`);
    }
  }, []);
  const { toast } = useToast();

  // 无冲突合并 - 使用 LocalNote 的 id 作为唯一标识
  const mergeNotesWithoutConflicts = useCallback(async (cloudNotes: LocalNote[]) => {
    // 使用笔记的 id 作为唯一标识创建映射
    const localNotesById = new Map(notes.map(n => [n.id, n]));

    // 创建云端笔记ID集合，用于快速查找
    const cloudNoteIds = new Set(cloudNotes.map(n => n.id));

    // 添加云端独有的笔记（本地没有相同 id 的笔记）
    for (const cloudNote of cloudNotes) {
      if (!localNotesById.has(cloudNote.id)) {
        console.log('添加云端独有笔记:', cloudNote.title, 'id:', cloudNote.id);
        saveNote({
          title: cloudNote.title,
          content: cloudNote.content,
          mode: cloudNote.mode,
          customSlug: cloudNote.customSlug || '',
          isPublic: cloudNote.isPublic || false,
          shareToken: cloudNote.shareToken,
          cloudNoteId: cloudNote.cloudNoteId,
          userId: cloudNote.userId,
          cloudUpdatedAt: cloudNote.cloudUpdatedAt,
          syncStatus: 'synced' as const,
          lastSyncAt: cloudNote.lastSyncAt,
          contentHash: cloudNote.contentHash
        }, cloudNote.id); // 使用云端笔记的 id 作为 existingId
      } else {
        // 云端和本地都有相同 id 的笔记，更新为已同步状态
        const localNote = localNotesById.get(cloudNote.id);
        if (localNote && localNote.syncStatus !== 'synced') {
          console.log('更新已存在笔记为同步状态:', localNote.title, 'id:', localNote.id);
          saveNote({
            ...localNote,
            // 保留云端的最新数据
            title: cloudNote.title,
            content: cloudNote.content,
            mode: cloudNote.mode,
            customSlug: cloudNote.customSlug || localNote.customSlug,
            isPublic: cloudNote.isPublic || localNote.isPublic,
            shareToken: cloudNote.shareToken || localNote.shareToken,
            cloudNoteId: cloudNote.cloudNoteId,
            userId: cloudNote.userId,
            cloudUpdatedAt: cloudNote.cloudUpdatedAt,
            syncStatus: 'synced' as const,
            lastSyncAt: new Date().toISOString(),
            contentHash: calculateHash(cloudNote)
          }, localNote.id);
        }
      }
    }

    // 处理本地独有的笔记（云端没有相同 id 的笔记）
    for (const localNote of notes) {
      if (!cloudNoteIds.has(localNote.id)) {
        console.log('发现本地独有笔记，准备上传:', localNote.title, 'id:', localNote.id);
        
        // 标记为本地独有状态
        saveNote({
          ...localNote,
          syncStatus: 'local_only' as const,
          contentHash: calculateHash(localNote)
        }, localNote.id);

        // 尝试上传到云端
        console.log('上传本地独有笔记:', localNote.title);
        const uploadedNote = await uploadToCloud(localNote);
        if (uploadedNote) {
          saveNote(uploadedNote, localNote.id);
        }
      }
    }
  }, [notes, saveNote, uploadToCloud, calculateHash]);
  

  // 执行完整同步（仅在首次登录或手动触发时使用）
  const performFullSync = useCallback(async () => {
    if (!user || syncInProgress) return;

    setSyncInProgress(true);
    
    try {
      console.log('开始执行完整同步...');
      
      // 1. 下载云端笔记
      const cloudNotes = await downloadFromCloud();
      console.log('从云端下载了', cloudNotes.length, '个笔记');
      
      // 2. 检测冲突
      const detectedConflicts = detectConflicts(notes, cloudNotes);
      console.log('检测到', detectedConflicts.length, '个冲突');
      
      if (detectedConflicts.length > 0) {
        setConflicts(detectedConflicts);
        toast({
          variant: "default",
          title: "发现同步冲突",
          description: `发现 ${detectedConflicts.length} 个笔记存在冲突，需要手动解决`,
          duration: 5000
        });
        return;
      }

      // 3. 合并笔记（无冲突情况）
      await mergeNotesWithoutConflicts(cloudNotes);
      
      const now = new Date().toISOString();
      setLastSyncTime(now);
      setIsInitialSyncDone(true);
      
      // 保存同步状态到localStorage，按用户区分
      if (typeof window !== 'undefined' && user) {
        localStorage.setItem(`lastSyncTime_${user.id}`, now);
        localStorage.setItem(`isInitialSyncDone_${user.id}`, 'true');
      }
      
      toast({
        variant: "default",
        title: "同步完成",
        description: "笔记已成功同步",
        duration: 3000
      });

    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        variant: "destructive",
        title: "同步失败",
        description: "请检查网络连接后重试",
        duration: 4000
      });
    } finally {
      setSyncInProgress(false);
    }
  }, [user, notes, downloadFromCloud, detectConflicts, syncInProgress, toast,mergeNotesWithoutConflicts]);


  // 解决单个冲突
  const resolveConflict = useCallback(async (
    noteId: string, 
    resolution: 'local' | 'cloud' | 'merge'
  ) => {
    const conflict = conflicts.find(c => c.noteId === noteId);
    if (!conflict) return;

    try {
      let resolvedNote: LocalNote | null = null;

      switch (resolution) {
        case 'local':
          // 使用本地版本覆盖云端
          console.log('使用本地版本覆盖云端:', conflict.localNote.title);
          
          // 重新计算hash确保一致性
          const localHash = calculateHash(conflict.localNote);
          const noteToUpload = {
            ...conflict.localNote,
            contentHash: localHash,
            syncStatus: 'local_only' as const
          };
          
          const uploadedNote = await uploadToCloud(noteToUpload);
          if (uploadedNote) {
            resolvedNote = uploadedNote;
            saveNote(uploadedNote, conflict.localNote.id);
            console.log('本地版本已同步到云端，hash:', uploadedNote.contentHash);
          }
          break;

        case 'cloud':
          // 使用云端版本覆盖本地，同时确保云端是最新的
          console.log('使用云端版本覆盖本地:', conflict.cloudNote.title);
          
          // 重新计算云端版本的hash
          const cloudHash = calculateHash(conflict.cloudNote);
          const cloudNoteToSave = {
            title: conflict.cloudNote.title,
            content: conflict.cloudNote.content,
            mode: conflict.cloudNote.mode,
            customSlug: conflict.cloudNote.customSlug || '',
            isPublic: conflict.cloudNote.isPublic || false,
            shareToken: conflict.cloudNote.shareToken,
            cloudNoteId: conflict.cloudNote.cloudNoteId,
            userId: conflict.cloudNote.userId,
            cloudUpdatedAt: conflict.cloudNote.cloudUpdatedAt,
            syncStatus: 'synced' as const,
            lastSyncAt: new Date().toISOString(),
            contentHash: cloudHash
          };
          
          resolvedNote = saveNote(cloudNoteToSave, conflict.localNote.id);
          console.log('云端版本已保存到本地，hash:', cloudHash);
          
          // 确保云端也有最新的hash（可选，通常云端已经是正确的）
          if (resolvedNote && cloudHash !== conflict.cloudNote.contentHash) {
            console.log('更新云端hash以确保一致性');
            await uploadToCloud(resolvedNote);
          }
          break;

        case 'merge':
          // 创建合并版本并同步到云端
          console.log('创建合并版本:', conflict.localNote.title);
          const mergedTitle = `${conflict.localNote.title} (合并)`;
          const mergedContent = `# ${conflict.localNote.title} (合并版本)\n\n## 本地版本 (${new Date(conflict.localNote.updatedAt).toLocaleString()})\n${conflict.localNote.content}\n\n## 云端版本 (${new Date(conflict.cloudNote.updatedAt).toLocaleString()})\n${conflict.cloudNote.content}`;
          
          const mergedNote = {
            title: mergedTitle,
            content: mergedContent,
            mode: conflict.localNote.mode,
            customSlug: conflict.localNote.customSlug || '',
            isPublic: conflict.localNote.isPublic || false,
            shareToken: conflict.localNote.shareToken,
            cloudNoteId: conflict.localNote.cloudNoteId,
            userId: conflict.localNote.userId,
            syncStatus: 'local_only' as const,
            contentHash: calculateHash({ 
              title: mergedTitle, 
              content: mergedContent, 
            })
          };
          
          // 先保存到本地
          resolvedNote = saveNote(mergedNote, conflict.localNote.id);
          
          // 然后同步到云端
          if (resolvedNote) {
            console.log('合并版本已保存，开始同步到云端...');
            const uploadedMergedNote = await uploadToCloud(resolvedNote);
            if (uploadedMergedNote) {
              // 更新本地笔记状态为已同步
              resolvedNote = saveNote(uploadedMergedNote, conflict.localNote.id);
              console.log('合并版本已同步到云端，hash:', uploadedMergedNote.contentHash);
            }
          }
          break;
      }

      // 移除已解决的冲突
      setConflicts(prev => prev.filter(c => c.noteId !== noteId));
      
      // 更新最后同步时间
      const now = new Date().toISOString();
      setLastSyncTime(now);
      if (typeof window !== 'undefined' && user) {
        localStorage.setItem(`lastSyncTime_${user.id}`, now);
      }
      
      toast({
        variant: "default",
        title: "冲突已解决",
        description: `笔记 "${conflict.localNote.title}" 的冲突已解决并同步到云端`,
        duration: 3000
      });

    } catch (error) {
      console.error('解决冲突失败:', error);
      toast({
        variant: "destructive",
        title: "解决冲突失败",
        description: "请稍后重试",
        duration: 4000
      });
    }
  }, [conflicts, saveNote, uploadToCloud, calculateHash, user, toast]);

  // 上传单个笔记（增量同步）
  const syncNoteToCloud = useCallback(async (note: LocalNote) => {
    if (!user || !isInitialSyncDone) return null;

    // 检查是否真的需要同步
    const currentHash = calculateHash(note);
    if (note.contentHash === currentHash && note.syncStatus === 'synced') {
      console.log('笔记内容未变化，跳过同步:', note.title);
      return note;
    }

    console.log('同步单个笔记到云端:', note.title, {
      currentHash,
      storedHash: note.contentHash,
      syncStatus: note.syncStatus
    });
    
    const uploadedNote = await uploadToCloud(note);
    if (uploadedNote) {
      saveNote(uploadedNote, note.id);
      
      // 更新最后同步时间
      const now = new Date().toISOString();
      setLastSyncTime(now);
      if (typeof window !== 'undefined' && user) {
        localStorage.setItem(`lastSyncTime_${user.id}`, now);
      }
      
      return uploadedNote;
    }
    return null;
  }, [user, isInitialSyncDone, uploadToCloud, saveNote, calculateHash]);

  // 自动同步已修改的笔记
  const autoSyncModifiedNotes = useCallback(async () => {
    if (!user || !isInitialSyncDone || syncInProgress) return;

    // 查找需要同步的笔记（本地修改但未同步到云端的）
    const notesToSync = notes.filter(note => {
      // 如果没有cloudNoteId，说明是新笔记，需要同步
      if (!note.cloudNoteId) return true;
      
      // 如果有cloudNoteId但同步状态不是synced，需要同步
      if (note.syncStatus !== 'synced') return true;
      
      // 如果内容hash不匹配，需要同步
      const currentHash = calculateHash(note);
      if (currentHash !== note.contentHash) return true;
      
      return false;
    });

    if (notesToSync.length > 0) {
      console.log('发现', notesToSync.length, '个笔记需要同步');
      
      // 逐个同步笔记，避免并发冲突
      for (const note of notesToSync) {
        await syncNoteToCloud(note);
      }
    }
  }, [user, isInitialSyncDone, syncInProgress, notes, calculateHash, syncNoteToCloud]);

  // 从云端删除笔记
  const deleteNoteFromCloud = useCallback(async (note: LocalNote) => {
    if (!note.cloudNoteId) return true;

    console.log('正在删除云端笔记:', note.title, 'cloudNoteId:', note.cloudNoteId);
    const success = await deleteFromCloud(note.cloudNoteId);
    
    if (success) {
      console.log('云端笔记删除成功，更新本地状态');
      // 注意：删除时不需要更新本地笔记状态，因为本地笔记也会被删除
      // 这里只是确保云端删除成功
    } else {
      console.error('云端笔记删除失败');
    }
    
    return success;
  }, [deleteFromCloud]);

  // 定期检查并自动同步修改的笔记（降低频率，主要作为兜底机制）
  useEffect(() => {
    if (!user || !isInitialSyncDone) return;

    const interval = setInterval(() => {
      console.log('定期检查需要同步的笔记...');
      autoSyncModifiedNotes();
    }, 60000); // 每60秒检查一次，作为兜底机制

    return () => clearInterval(interval);
  }, [user, isInitialSyncDone, autoSyncModifiedNotes]);

  return {
    syncInProgress,
    conflicts,
    lastSyncTime,
    isInitialSyncDone,
    performFullSync,
    resolveConflict,
    syncNoteToCloud,
    deleteNoteFromCloud,
    autoSyncModifiedNotes,
    clearUserSyncData,
    setConflicts
  };
}
