'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SyncConflict } from '@/hooks/useCloudSync';
import { Clock, FileText, AlertTriangle, Split, Eye } from 'lucide-react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';

interface ConflictResolutionDialogProps {
  conflicts: SyncConflict[];
  onResolve: (noteId: string, resolution: 'local' | 'cloud' | 'merge') => void;
  onClose: () => void;
  isOpen: boolean;
}

export function ConflictResolutionDialog({ 
  conflicts, 
  onResolve, 
  onClose, 
  isOpen 
}: ConflictResolutionDialogProps) {
  const t = useTranslations();
  const [selectedConflict, setSelectedConflict] = useState<SyncConflict | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'diff'>('diff');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getContentPreview = (content: string, maxLength = 200) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  const getConflictTypeColor = (type: SyncConflict['conflictType']) => {
    switch (type) {
      case 'title': return 'bg-yellow-100 text-yellow-800';
      case 'content': return 'bg-orange-100 text-orange-800';
      case 'both': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConflictTypeText = (type: SyncConflict['conflictType']) => {
    switch (type) {
      case 'title': return t('sync.conflictTypeTitle');
      case 'content': return t('sync.conflictTypeContent');
      case 'both': return t('sync.conflictTypeBoth');
      default: return t('sync.conflictType');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {t('sync.conflictResolution')}
          </DialogTitle>
          <DialogDescription>
            {t('sync.conflictsFoundDescription', { count: conflicts.length })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 h-[70vh]">
          {/* 左侧：冲突列表 */}
          <div className="w-1/3 border-r pr-4">
            <h3 className="font-semibold mb-3">{t('sync.conflictNotesList')}</h3>
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {conflicts.map((conflict) => (
                  <div
                    key={conflict.noteId}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent/50 ${
                      selectedConflict?.noteId === conflict.noteId ? 'bg-accent border-primary' : ''
                    }`}
                    onClick={() => setSelectedConflict(conflict)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm truncate pr-2">
                        {conflict.localNote.title}
                      </h4>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getConflictTypeColor(conflict.conflictType)}`}
                      >
                        {getConflictTypeText(conflict.conflictType)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getContentPreview(conflict.localNote.content, 80)}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* 右侧：冲突详情和解决选项 */}
          <div className="flex-1">
            {selectedConflict ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {selectedConflict.localNote.title}
                  </h3>
                  
                  {/* 视图切换按钮 */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'diff' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('diff')}
                      className="flex items-center gap-1"
                    >
                      <Split className="h-3 w-3" />
                      {t('sync.diffComparison')}
                    </Button>
                    <Button
                      variant={viewMode === 'split' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('split')}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      {t('sync.sideByView')}
                    </Button>
                  </div>
                </div>

                {/* 版本信息 */}
                <div className="flex items-center justify-between mb-4 p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-green-700">{t('sync.localVersion')}</span>
                    <Clock className="h-3 w-3 text-muted-foreground ml-2" />
                    <span className="text-muted-foreground">{formatDate(selectedConflict.localNote.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-blue-700">{t('sync.cloudVersion')}</span>
                    <Clock className="h-3 w-3 text-muted-foreground ml-2" />
                    <span className="text-muted-foreground">{formatDate(selectedConflict.cloudNote.updatedAt)}</span>
                  </div>
                </div>

                {/* 版本比较 */}
                <div className="flex-1 mb-4">
                  {viewMode === 'diff' ? (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-muted/20 p-2 border-b">
                        <h4 className="text-sm font-medium">{t('sync.contentDiffComparison')}</h4>
                      </div>
                      <div className="max-h-64 overflow-auto">
                        <ReactDiffViewer
                          oldValue={selectedConflict.cloudNote.content}
                          newValue={selectedConflict.localNote.content}
                          splitView={true}
                          compareMethod={DiffMethod.WORDS}
                          leftTitle={t('sync.cloudVersion')}
                          rightTitle={t('sync.localVersion')}
                          styles={{
                            variables: {
                              light: {
                                codeFoldGutterBackground: '#f7f7f7',
                                codeFoldBackground: '#f1f8ff',
                                addedBackground: '#e6ffed',
                                addedColor: '#24292e',
                                removedBackground: '#ffeef0',
                                removedColor: '#24292e',
                                wordAddedBackground: '#acf2bd',
                                wordRemovedBackground: '#fdb8c0',
                                addedGutterBackground: '#cdffd8',
                                removedGutterBackground: '#fdbdc8',
                                gutterBackground: '#f7f7f7',
                                gutterBackgroundDark: '#f3f4f6',
                                highlightBackground: '#fffbdd',
                                highlightGutterBackground: '#fff5b4',
                              }
                            },
                            line: {
                              fontSize: '13px',
                              lineHeight: '20px',
                            },
                            gutter: {
                              fontSize: '12px',
                            }
                          }}
                          showDiffOnly={false}
                          hideLineNumbers={false}
                        />
                      </div>
                      
                      {/* 标题差异（如果存在） */}
                      {selectedConflict.localNote.title !== selectedConflict.cloudNote.title && (
                        <>
                          <Separator />
                          <div className="p-3">
                            <h4 className="text-sm font-medium mb-2">{t('sync.titleDiffComparison')}</h4>
                            <ReactDiffViewer
                              oldValue={selectedConflict.cloudNote.title}
                              newValue={selectedConflict.localNote.title}
                              splitView={false}
                              compareMethod={DiffMethod.WORDS}
                              showDiffOnly={true}
                              hideLineNumbers={true}
                              styles={{
                                variables: {
                                  light: {
                                    addedBackground: '#e6ffed',
                                    removedBackground: '#ffeef0',
                                    wordAddedBackground: '#acf2bd',
                                    wordRemovedBackground: '#fdb8c0',
                                  }
                                },
                                line: {
                                  fontSize: '14px',
                                  padding: '8px',
                                }
                              }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {/* 本地版本 */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-green-50 p-3 border-b">
                          <h4 className="font-medium text-green-800 flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            {t('sync.localVersion')}
                          </h4>
                        </div>
                        <ScrollArea className="h-64 p-3">
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">{t('sync.syncFieldTitle')}</p>
                              <p className="text-sm bg-muted p-2 rounded">
                                {selectedConflict.localNote.title}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">{t('sync.syncFieldContent')}</p>
                              <div className="text-sm bg-muted p-2 rounded whitespace-pre-wrap">
                                {selectedConflict.localNote.content}
                              </div>
                            </div>
                          </div>
                        </ScrollArea>
                      </div>

                      {/* 云端版本 */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-blue-50 p-3 border-b">
                          <h4 className="font-medium text-blue-800 flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            {t('sync.cloudVersion')}
                          </h4>
                        </div>
                        <ScrollArea className="h-64 p-3">
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">{t('sync.syncFieldTitle')}</p>
                              <p className="text-sm bg-muted p-2 rounded">
                                {selectedConflict.cloudNote.title}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">{t('sync.syncFieldContent')}</p>
                              <div className="text-sm bg-muted p-2 rounded whitespace-pre-wrap">
                                {selectedConflict.cloudNote.content}
                              </div>
                            </div>
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                {/* 解决选项 */}
                <div className="space-y-3">
                  <h4 className="font-medium">{t('sync.chooseResolution')}</h4>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-3">
                    <p className="text-sm text-blue-800 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {t('sync.resolutionHint')}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => onResolve(selectedConflict.noteId, 'local')}
                      className="flex flex-col items-center p-4 h-auto hover:bg-green-50 hover:border-green-300"
                    >
                      <div className="w-4 h-4 bg-green-500 rounded-full mb-2"></div>
                      <span className="font-medium">{t('sync.useLocalVersion')}</span>
                      <span className="text-xs text-muted-foreground text-center mt-1">
                        {t('sync.localVersionHint')}
                      </span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => onResolve(selectedConflict.noteId, 'cloud')}
                      className="flex flex-col items-center p-4 h-auto hover:bg-blue-50 hover:border-blue-300"
                    >
                      <div className="w-4 h-4 bg-blue-500 rounded-full mb-2"></div>
                      <span className="font-medium">{t('sync.useCloudVersion')}</span>
                      <span className="text-xs text-muted-foreground text-center mt-1">
                        {t('sync.cloudVersionHint')}
                      </span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => onResolve(selectedConflict.noteId, 'merge')}
                      className="flex flex-col items-center p-4 h-auto hover:bg-purple-50 hover:border-purple-300"
                    >
                      <div className="w-4 h-4 bg-purple-500 rounded-full mb-2"></div>
                      <span className="font-medium">{t('sync.manualMergeAction')}</span>
                      <span className="text-xs text-muted-foreground text-center mt-1">
                        {t('sync.manualMergeHint')}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>{t('sync.selectConflictPrompt')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部操作栏 */}
        {/* <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            还有 {conflicts.length} 个冲突待解决
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              稍后处理
            </Button>
          </div>
        </div> */}
      </DialogContent>
    </Dialog>
  );
}
