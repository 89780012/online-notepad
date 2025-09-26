'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2,
  Clock
} from 'lucide-react';

interface SyncStatusIndicatorProps {
  isOnline: boolean;
  syncInProgress: boolean;
  lastSyncTime: string | null;
  conflictCount: number;
  onSync: () => void;
  onShowConflicts?: () => void;
}

export function SyncStatusIndicator({
  isOnline,
  syncInProgress,
  lastSyncTime,
  conflictCount,
  onSync,
  onShowConflicts
}: SyncStatusIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslations();

  // 当有同步活动或冲突时显示指示器，或者刚完成同步时短暂显示
  useEffect(() => {
    const shouldShow = syncInProgress || conflictCount > 0 || !isOnline;
    setIsVisible(shouldShow);
    
    // 如果刚完成同步，显示3秒后自动隐藏
    if (!syncInProgress && lastSyncTime && isOnline && conflictCount === 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [syncInProgress, conflictCount, isOnline, lastSyncTime]);

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return t('sync.neverSynced');
    
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return t('sync.justNow');
    if (minutes < 60) return t('sync.minutesAgo', { minutes });
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('sync.hoursAgo', { hours });
    
    const days = Math.floor(hours / 24);
    return t('sync.daysAgo', { days });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-card border rounded-lg shadow-lg p-3 min-w-[280px]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* 在线状态图标 */}
          {isOnline ? (
            <Cloud className="h-4 w-4 text-blue-500" />
          ) : (
            <CloudOff className="h-4 w-4 text-gray-400" />
          )}
          
          <span className="font-medium text-sm">
            {t('sync.pageTitle')}
          </span>
          
          {/* 状态标识 */}
          {syncInProgress && (
            <Badge variant="secondary" className="text-xs">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              {t('sync.syncing')}
            </Badge>
          )}
          
          {conflictCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {t('sync.conflictsCount', { count: conflictCount })}
            </Badge>
          )}
          
          {!syncInProgress && conflictCount === 0 && isOnline && lastSyncTime && (
            <Badge variant="secondary" className="text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
              {t('sync.autoSync')}
            </Badge>
          )}
        </div>
        
        {/* 关闭按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="h-6 w-6 p-0"
        >
          ×
        </Button>
      </div>
      
      {/* 详细信息 */}
      <div className="space-y-2">
        {/* 最后同步时间 */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatLastSync(lastSyncTime)}
        </div>
        
        {/* 操作按钮 */}
        <div className="flex gap-2">
          {isOnline && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSync}
              disabled={syncInProgress}
              className="flex-1 text-xs"
            >
              {syncInProgress ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  {t('sync.syncing')}
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {t('sync.syncNow')}
                </>
              )}
            </Button>
          )}
          
          {conflictCount > 0 && onShowConflicts && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onShowConflicts}
              className="flex-1 text-xs"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              {t('sync.resolveConflicts')}
            </Button>
          )}
        </div>
        
        {/* 离线提示 */}
        {!isOnline && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            {t('sync.offlineMessage')}
          </div>
        )}
      </div>
    </div>
  );
}
