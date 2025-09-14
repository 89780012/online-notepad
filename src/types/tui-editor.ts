/**
 * TUI Editor TypeScript 类型定义
 * 为 TOAST UI Editor 提供完整的类型支持
 */

// TUI Editor 实例类型 - 使用 unknown 以避免类型声明问题
export type TUIEditorInstance = unknown;

// 编辑器初始化配置选项
export interface TUIEditorOptions {
  el?: HTMLElement | string;
  height?: string | number;
  minHeight?: string | number;
  initialValue?: string;
  previewStyle?: 'vertical' | 'tab';
  initialEditType?: 'markdown' | 'wysiwyg';
  theme?: string;
  useCommandShortcut?: boolean;
  hideModeSwitch?: boolean;
  toolbarItems?: unknown[];
  plugins?: unknown[];
  viewer?: boolean;
  linkAttributes?: Record<string, string>;
}

// TUI Editor React 组件 Props 类型
export interface TUIReactEditorProps extends Omit<TUIEditorOptions, 'el'> {
  // React 组件特有的属性
  forwardedRef?: React.RefObject<unknown>;

  // 事件处理器
  onChange?: (value: string) => void;
  onFocus?: (event: unknown) => void;
  onBlur?: (event: unknown) => void;
  onLoad?: (editor: unknown) => void;

  // 样式相关
  className?: string;
  style?: React.CSSProperties;
}

// 编辑器命令类型
export type TUIEditorCommand =
  | 'bold'
  | 'italic'
  | 'strike'
  | 'hr'
  | 'quote'
  | 'ul'
  | 'ol'
  | 'task'
  | 'table'
  | 'image'
  | 'link'
  | 'code'
  | 'codeblock';

// 图片插入选项
export interface ImageInsertOptions {
  imageUrl: string;
  altText?: string;
  desc?: string;
}

// 编辑器主题类型
export type TUIEditorTheme = 'light' | 'dark';

// 预览样式类型
export type PreviewStyle = 'vertical' | 'tab';

// 编辑类型
export type EditType = 'markdown' | 'wysiwyg';

// 扩展的编辑器接口 - 兼容原有 NewMarkdownEditor 接口
export interface TUIMarkdownEditorProps {
  // 基本内容属性 - 与原组件保持一致
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;

  // 动作回调 - 与原组件保持一致
  onSave?: () => void;
  onShare?: () => void;
  onOpenFile?: (title: string, content: string) => void;
  onSaveAs?: (title: string, content: string) => void;
  onClearMarkdown?: () => void;

  // 状态控制 - 与原组件保持一致
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
  isAutoSaving?: boolean;

  // 侧边栏控制 - 与原组件保持一致
  showSidebar?: boolean;
  onToggleSidebar?: () => void;

  // TUI Editor 特有配置
  previewStyle?: PreviewStyle;
  initialEditType?: EditType;
  theme?: TUIEditorTheme;

  // 高级选项
  enableCodeSyntaxHighlight?: boolean;
  enableMath?: boolean;
  plugins?: unknown[];
}

// 编辑器引用类型
export interface TUIEditorRef {
  getInstance: () => TUIEditorInstance | undefined;
  getRootElement: () => HTMLElement | undefined;
}

// 导出常用常量
export const TUI_EDITOR_COMMANDS = {
  BOLD: 'bold',
  ITALIC: 'italic',
  STRIKE: 'strike',
  HEADING: 'heading',
  QUOTE: 'quote',
  UL: 'ul',
  OL: 'ol',
  TASK: 'task',
  TABLE: 'table',
  IMAGE: 'image',
  LINK: 'link',
  CODE: 'code',
  CODEBLOCK: 'codeblock',
  HR: 'hr',
} as const;

export const PREVIEW_STYLES = {
  VERTICAL: 'vertical',
  TAB: 'tab',
} as const;

export const EDIT_TYPES = {
  MARKDOWN: 'markdown',
  WYSIWYG: 'wysiwyg',
} as const;