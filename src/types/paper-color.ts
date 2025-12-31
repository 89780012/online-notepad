/**
 * 纸张颜色主题类型定义
 */

// 纸张颜色 ID 类型
export type PaperColorId = 
  | 'default'      // 默认白色/深色
  | 'eye-care'     // 护眼黄
  | 'sepia'        // 复古牛皮纸
  | 'light-blue'   // 淡蓝色
  | 'light-green'; // 淡绿色

// 颜色变体（明暗模式）
export interface PaperColorVariant {
  background: string;   // oklch 颜色值 - 背景色
  foreground: string;   // oklch 颜色值 - 前景色/文字色
  muted: string;        // oklch 颜色值 - 静音/次要背景色
}

// 纸张颜色预设
export interface PaperColorPreset {
  id: PaperColorId;
  name: string;           // 显示名称的 i18n key
  light: PaperColorVariant;
  dark: PaperColorVariant;
}

// PaperColorContext 类型
export interface PaperColorContextType {
  paperColor: PaperColorId;
  setPaperColor: (color: PaperColorId) => void;
  presets: PaperColorPreset[];
}

// CSS 变量名常量
export const PAPER_CSS_VARS = {
  background: '--paper-background',
  foreground: '--paper-foreground',
  muted: '--paper-muted',
} as const;

// localStorage 键名
export const PAPER_COLOR_STORAGE_KEY = 'notepad-paper-color';

// 默认纸张颜色
export const DEFAULT_PAPER_COLOR: PaperColorId = 'default';
