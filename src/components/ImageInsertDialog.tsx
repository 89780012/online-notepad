'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, Loader2, Check, X, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';

export interface ImageConfig {
  url: string;
  alt: string;
  title?: string;
  width?: number;
  height?: number;
  align: 'left' | 'center' | 'right';
  size: 'small' | 'medium' | 'large' | 'custom';
}

interface ImageInsertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (markdown: string) => void;
}

interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  result?: {
    url: string;
    filename: string;
    size: number;
  };
}

const SIZE_PRESETS = {
  small: 300,
  medium: 600,
  large: 900,
  custom: 0,
};

export default function ImageInsertDialog({
  isOpen,
  onClose,
  onInsert,
}: ImageInsertDialogProps) {
  const t = useTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 状态管理
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [sizeMode, setSizeMode] = useState<'small' | 'medium' | 'large' | 'custom'>('medium');
  const [customWidth, setCustomWidth] = useState([600]);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);

  // 重置状态
  const resetState = useCallback(() => {
    setImageUrl('');
    setImageAlt('');
    setImageTitle('');
    setAlignment('center');
    setSizeMode('medium');
    setCustomWidth([600]);
    setUploadState({ status: 'idle', progress: 0 });
    setPreviewUrl('');
    setIsValidUrl(false);
    setActiveTab('url');
  }, []);

  // URL 验证
  const validateImageUrl = useCallback(async (url: string) => {
    if (!url) {
      setIsValidUrl(false);
      setPreviewUrl('');
      return;
    }

    try {
      // 简单的 URL 格式验证
      // const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i;
      // if (!urlPattern.test(url)) {
      //   setIsValidUrl(false);
      //   setPreviewUrl('');
      //   return;
      // }

      setPreviewUrl(url);
      setIsValidUrl(true);

      // 如果 alt 为空，尝试从 URL 提取文件名
      // if (!imageAlt) {
      //   const filename = url.split('/').pop()?.split('?')[0]?.replace(/\\.[^/.]+$/, '');
      //   if (filename) {
      //     setImageAlt(filename);
      //   }
      // }
      setImageAlt("");
    } catch {
      setIsValidUrl(false);
      setPreviewUrl('');
    }
  }, []);

  // URL 输入变化处理
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateImageUrl(imageUrl);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [imageUrl, validateImageUrl]);

  // 文件上传处理
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: '不支持的文件格式。请选择 JPG、PNG、WebP 或 GIF 格式的图片。',
      });
      return;
    }

    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: '文件大小超过 5MB 限制。',
      });
      return;
    }

    setUploadState({ status: 'uploading', progress: 0 });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify({
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 85,
        format: 'webp',
      }));

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + Math.random() * 30, 90),
        }));
      }, 200);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      const result = await response.json();

      if (result.success) {
        setUploadState({
          status: 'success',
          progress: 100,
          result: result.data,
        });

        // 设置预览和表单数据
        setPreviewUrl(result.data.url);
        setImageUrl(result.data.url);
        setIsValidUrl(true);

        if (!imageAlt) {
          const filename = result.data.filename.split('/').pop()?.split('.')[0];
          if (filename) {
            setImageAlt(filename);
          }
        }
      } else {
        setUploadState({
          status: 'error',
          progress: 0,
          error: result.error || '上传失败，请重试。',
        });
      }
    } catch (error) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : '上传失败，请检查网络连接。',
      });
    }
  }, [imageAlt]);

  // 文件选择处理
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // 拖拽上传处理
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const files = Array.from(event.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileUpload(imageFile);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  // 生成 Markdown 代码
  const generateMarkdown = useCallback((): string => {
    if (!imageUrl || !isValidUrl) return '';

    const width = sizeMode === 'custom' ? customWidth[0] : SIZE_PRESETS[sizeMode];
    const alt = imageAlt || '图片';
    const title = imageTitle ? ` "${imageTitle}"` : '';

    // 基础语法
    if (alignment === 'left' && sizeMode === 'medium') {
      return `![${alt}](${imageUrl}${title})`;
    }

    // 使用 HTML 语法支持更多样式
    const styles = [];
    
    if (width > 0) {
      styles.push(`width: ${width}px`);
    }
    
    if (alignment === 'center') {
      styles.push('display: block', 'margin: 0 auto');
    } else if (alignment === 'right') {
      styles.push('float: right', 'margin-left: 1rem');
    }

    const styleAttr = styles.length > 0 ? ` style="${styles.join('; ')}"` : '';
    const titleAttr = imageTitle ? ` title="${imageTitle}"` : '';

    return `<img src="${imageUrl}" alt="${alt}"${titleAttr}${styleAttr} />`;
  }, [imageUrl, isValidUrl, imageAlt, imageTitle, alignment, sizeMode, customWidth]);

  // 插入图片
  const handleInsert = () => {
    const markdown = generateMarkdown();
    if (markdown) {
      onInsert(markdown);
      resetState();
      onClose();
    }
  };

  // 对话框关闭处理
  const handleClose = () => {
    resetState();
    onClose();
  };

  // 重试上传
  const handleRetry = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <div className="space-y-6 break-words overflow-wrap-anywhere">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            {t('insertImage')}
          </DialogTitle>
          <DialogDescription>
            {t('insertImageDescription')}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'url' | 'upload')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              {t('imageUrl')}
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {t('uploadFile')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">{t('imageUrl')}</Label>
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className={`${isValidUrl ? 'border-green-500' : imageUrl && !isValidUrl ? 'border-red-500' : ''} break-all`}
                style={{
                  wordBreak: 'break-all',
                  overflowWrap: 'anywhere'
                }}
              />
              {/* 显示URL预览信息 */}
              {imageUrl && imageUrl.length > 50 && (
                <div className="text-xs text-gray-500 p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                  <div className="font-mono break-all">{imageUrl}</div>
                </div>
              )}
              {imageUrl && !isValidUrl && (
                <p className="text-sm text-red-500">{t('invalidImageUrl')}</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center space-y-4 hover:border-gray-400 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {uploadState.status === 'idle' && (
                <>
                  <Upload className="w-12 h-12 mx-auto text-gray-400" />
                  <div>
                    <p className="text-lg font-medium">{t('dragDropText')}</p>
                    <p className="text-sm text-gray-500">{t('orClickToSelect')}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {t('supportedFormats')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t('selectFile')}
                  </Button>
                </>
              )}

              {uploadState.status === 'uploading' && (
                <div className="space-y-4">
                  <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-500" />
                  <div>
                    <p className="text-lg font-medium">{t('uploading')}</p>
                    <Progress value={uploadState.progress} className="mt-2" />
                    <p className="text-sm text-gray-500 mt-1">
                      {uploadState.progress.toFixed(0)}%
                    </p>
                  </div>
                </div>
              )}

              {uploadState.status === 'success' && (
                <div className="space-y-4">
                  <Check className="w-12 h-12 mx-auto text-green-500" />
                  <div>
                    <p className="text-lg font-medium text-green-600">{t('uploadSuccess')}</p>
                    <p className="text-sm text-gray-500">
                      {t('fileSize')}: {(uploadState.result!.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t('selectOtherFile')}
                  </Button>
                </div>
              )}

              {uploadState.status === 'error' && (
                <div className="space-y-4">
                  <X className="w-12 h-12 mx-auto text-red-500" />
                  <div>
                    <p className="text-lg font-medium text-red-600">{t('uploadFailed')}</p>
                    <p className="text-sm text-red-500 mt-1">
                      {uploadState.error}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {t('retry')}
                  </Button>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileSelect}
              className="hidden"
            />
          </TabsContent>
        </Tabs>

        {/* 图片预览 */}
        {previewUrl && isValidUrl && (
          <div className="space-y-4">
            <Label>{t('imagePreview')}</Label>
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={imageAlt || '预览'}
                className="max-w-full max-h-48 mx-auto rounded"
                style={{
                  textAlign: alignment,
                  width: sizeMode === 'custom' ? `${customWidth[0]}px` : 
                         sizeMode === 'small' ? '300px' :
                         sizeMode === 'large' ? '600px' : '400px'
                }}
              />
            </div>
          </div>
        )}

        {/* 样式配置 */}
        {isValidUrl && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="imageAlt">{t('imageAlt')} (Alt)</Label>
              <Input
                id="imageAlt"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="图片描述"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageTitle">{t('imageTitle')} ({t('optional')})</Label>
              <Input
                id="imageTitle"
                value={imageTitle}
                onChange={(e) => setImageTitle(e.target.value)}
                placeholder="图片标题"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('imageAlignment')}</Label>
              <div className="flex gap-2">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <Button
                    key={align}
                    variant={alignment === align ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAlignment(align)}
                  >
                    {align === 'left' ? t('alignLeft') : 
                     align === 'center' ? t('alignCenter') : t('alignRight')}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label>{t('imageSize')}</Label>
              <div className="flex gap-2 flex-wrap">
                {(['small', 'medium', 'large', 'custom'] as const).map((size) => (
                  <Button
                    key={size}
                    variant={sizeMode === size ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSizeMode(size)}
                  >
                    {size === 'small' ? t('sizeSmall') :
                     size === 'medium' ? t('sizeMedium') :
                     size === 'large' ? t('sizeLarge') : t('sizeCustom')}
                  </Button>
                ))}
              </div>

              {sizeMode === 'custom' && (
                <div className="space-y-2">
                  <Label>{t('width')}: {customWidth[0]}px</Label>
                  <Slider
                    value={customWidth}
                    onValueChange={setCustomWidth}
                    min={100}
                    max={1200}
                    step={50}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Markdown 预览 */}
            <div className="space-y-2">
              <Label>{t('markdownPreview')}</Label>
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm break-all overflow-hidden">
                <div className="whitespace-pre-wrap break-all overflow-wrap-anywhere">
                  {generateMarkdown()}
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleInsert}
            disabled={!isValidUrl}
            className="min-w-[100px]"
          >
            {t('insertButton')}
          </Button>
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}