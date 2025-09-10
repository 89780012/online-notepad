import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { ICommand, ExecuteState, TextAreaTextApi } from '@uiw/react-md-editor';
import { type ContextStore } from '@uiw/react-md-editor';

/**
 * 自定义图片命令
 * 替换默认的图片命令，提供增强的图片插入功能
 */
export const customImageCommand: ICommand = {
  name: 'custom-image',
  keyCommand: 'image',
  shortcuts: 'ctrlcmd+shift+i',
  prefix: '',
  suffix: '',
  buttonProps: {
    'aria-label': '插入图片 (Ctrl+Shift+I)',
    title: '插入图片 (Ctrl+Shift+I)',
  },
  icon: (
    <ImageIcon className="w-4 h-4" />
  ),
  execute: (
    state: ExecuteState,
    api: TextAreaTextApi,
    dispatch?: React.Dispatch<ContextStore>
  ) => {
    // 触发自定义图片插入对话框
    if (dispatch) {
      dispatch({
        type: 'custom',
        payload: {
          action: 'OPEN_IMAGE_DIALOG',
          data: {
            selection: state.selection,
            selectedText: state.selectedText,
          }
        }
      });
    }

    // 如果没有 dispatch，回退到简单的 Markdown 插入
    if (!dispatch) {
      const placeholder = state.selectedText || 'image';
      const imageMarkdown = `![${placeholder}](url)`;
      
      api.replaceSelection(imageMarkdown);
      
      // 选中 'url' 部分让用户输入
      const newSelection = {
        start: state.selection.start + imageMarkdown.length - 4,
        end: state.selection.start + imageMarkdown.length - 1,
      };
      
      api.setSelectionRange(newSelection);
    }
  },
};

/**
 * 图片命令工厂函数
 * 创建带有自定义回调的图片命令
 */
export function createImageCommand(
  onImageDialogOpen?: (selection: { start: number; end: number }, selectedText: string) => void
): ICommand {
  return {
    ...customImageCommand,
    execute: (state: ExecuteState, api: TextAreaTextApi) => {
      // 如果提供了回调函数，调用它来打开对话框
      if (onImageDialogOpen) {
        onImageDialogOpen(state.selection, state.selectedText);
        return;
      }

      // 否则使用默认的简单插入
      const placeholder = state.selectedText || '图片描述';
      const imageMarkdown = `![${placeholder}](请输入图片链接)`;
      
      api.replaceSelection(imageMarkdown);
      
      // 选中链接部分
      const linkStart = state.selection.start + placeholder.length + 3;
      const linkEnd = linkStart + '请输入图片链接'.length;
      
      setTimeout(() => {
        api.setSelectionRange({
          start: linkStart,
          end: linkEnd,
        });
      }, 0);
    },
  };
}

/**
 * 增强的图片插入工具
 * 提供多种图片插入模式的 Markdown 生成
 */
export class ImageMarkdownGenerator {
  /**
   * 生成标准的 Markdown 图片语法
   */
  static generateBasic(url: string, alt: string, title?: string): string {
    const titleAttr = title ? ` "${title}"` : '';
    return `![${alt}](${url}${titleAttr})`;
  }

  /**
   * 生成带样式的 HTML 图片标签
   */
  static generateStyled(
    url: string,
    alt: string,
    options: {
      title?: string;
      width?: number;
      height?: number;
      align?: 'left' | 'center' | 'right';
      className?: string;
    } = {}
  ): string {
    const { title, width, height, align, className } = options;
    
    const attributes: string[] = [];
    
    attributes.push(`src="${url}"`);
    attributes.push(`alt="${alt}"`);
    
    if (title) {
      attributes.push(`title="${title}"`);
    }
    
    if (className) {
      attributes.push(`class="${className}"`);
    }

    // 构建样式
    const styles: string[] = [];
    
    if (width) {
      styles.push(`width: ${width}px`);
    }
    
    if (height) {
      styles.push(`height: ${height}px`);
    }
    
    if (align === 'center') {
      styles.push('display: block', 'margin: 0 auto');
    } else if (align === 'right') {
      styles.push('float: right', 'margin-left: 1rem');
    } else if (align === 'left') {
      styles.push('float: left', 'margin-right: 1rem');
    }

    if (styles.length > 0) {
      attributes.push(`style="${styles.join('; ')}"`);
    }

    return `<img ${attributes.join(' ')} />`;
  }

  /**
   * 生成图片与文字的组合布局
   */
  static generateWithCaption(
    url: string,
    alt: string,
    caption: string,
    align: 'left' | 'center' | 'right' = 'center'
  ): string {
    const alignClass = align === 'center' ? 'text-center' : 
                      align === 'right' ? 'text-right' : 'text-left';
    
    return `
<figure class="${alignClass}" style="margin: 1rem 0;">
  <img src="${url}" alt="${alt}" style="max-width: 100%; height: auto;" />
  <figcaption style="font-style: italic; color: #666; margin-top: 0.5rem;">
    ${caption}
  </figcaption>
</figure>
`.trim();
  }

  /**
   * 生成响应式图片
   */
  static generateResponsive(
    url: string,
    alt: string,
    breakpoints: { width: number; url: string }[]
  ): string {
    if (breakpoints.length === 0) {
      return this.generateBasic(url, alt);
    }

    const srcset = breakpoints
      .map(bp => `${bp.url} ${bp.width}w`)
      .join(', ');
    
    const sizes = breakpoints
      .map((bp, index) => {
        if (index === breakpoints.length - 1) {
          return `${bp.width}px`;
        }
        return `(max-width: ${bp.width}px) ${bp.width}px`;
      })
      .join(', ');

    return `<img src="${url}" alt="${alt}" srcset="${srcset}" sizes="${sizes}" style="max-width: 100%; height: auto;" />`;
  }

  /**
   * 生成图片网格布局
   */
  static generateGrid(
    images: { url: string; alt: string; title?: string }[],
    columns: number = 2
  ): string {
    const gridStyle = `display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 1rem; margin: 1rem 0;`;
    
    const imageElements = images.map(img => 
      `  <img src="${img.url}" alt="${img.alt}"${img.title ? ` title="${img.title}"` : ''} style="width: 100%; height: auto; border-radius: 4px;" />`
    ).join('\\n');

    return `<div style="${gridStyle}">
${imageElements}
</div>`;
  }
}

/**
 * 图片命令配置选项
 */
export interface ImageCommandConfig {
  enableUpload?: boolean;
  enableUrlInput?: boolean;
  enableStyleControls?: boolean;
  defaultAlignment?: 'left' | 'center' | 'right';
  defaultSize?: 'small' | 'medium' | 'large' | 'custom';
  maxFileSize?: number;
  allowedTypes?: string[];
  uploadEndpoint?: string;
}

/**
 * 创建完整的图片命令配置
 */
export function createAdvancedImageCommand(
  config: ImageCommandConfig = {},
  onImageDialogOpen?: (selection: { start: number; end: number }, selectedText: string) => void
): ICommand {
  const {
    enableUpload = true,
    enableUrlInput = true,
    enableStyleControls = true,
    defaultAlignment = 'center',
    defaultSize = 'medium',
  } = config;

  // 这些配置变量预留给未来功能扩展使用
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const unused = { enableUpload, enableUrlInput, enableStyleControls, defaultAlignment, defaultSize };

  return {
    name: 'advanced-image',
    keyCommand: 'image',
    shortcuts: 'ctrlcmd+shift+i',
    groupName: 'image',
    buttonProps: {
      'aria-label': '插入图片 (Ctrl+Shift+I)',
      title: '插入图片 (Ctrl+Shift+I)',
    },
    icon: <ImageIcon className="w-3 h-3" />,
    execute: (state: ExecuteState, api: TextAreaTextApi) => {
      if (onImageDialogOpen) {
        // 使用专业的图片插入对话框
        onImageDialogOpen(state.selection, state.selectedText);
      } else {
        // 回退到基本插入
        const alt = state.selectedText || '图片描述';
        const markdown = ImageMarkdownGenerator.generateBasic('请输入图片链接', alt);
        api.replaceSelection(markdown);
        
        // 选中链接部分方便用户编辑
        setTimeout(() => {
          const linkStart = state.selection.start + alt.length + 3;
          const linkEnd = linkStart + '请输入图片链接'.length;
          api.setSelectionRange({
            start: linkStart,
            end: linkEnd,
          });
        }, 0);
      }
    },
  };
}