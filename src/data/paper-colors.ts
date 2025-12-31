/**
 * 纸张颜色预设数据
 * 每种颜色包含 light 和 dark 两个变体
 */

import type { PaperColorPreset, PaperColorId } from '@/types/paper-color';

export const PAPER_COLOR_PRESETS: PaperColorPreset[] = [
  {
    id: 'default',
    name: 'paperColor.default',
    light: {
      background: 'oklch(1 0 0)',           // 纯白
      foreground: 'oklch(0.15 0.005 240)',  // 深灰色文字
      muted: 'oklch(0.96 0.005 240)',       // 浅灰色
    },
    dark: {
      background: 'oklch(0.08 0.015 240)',  // GitHub 深色背景
      foreground: 'oklch(0.92 0.005 240)',  // 高对比度白色文字
      muted: 'oklch(0.16 0.02 240)',        // 深灰色
    },
  },
  {
    id: 'eye-care',
    name: 'paperColor.eyeCare',
    light: {
      background: 'oklch(0.97 0.03 85)',    // 护眼黄 - 温暖的米黄色
      foreground: 'oklch(0.2 0.02 60)',     // 深棕色文字
      muted: 'oklch(0.93 0.04 85)',         // 稍深的米黄色
    },
    dark: {
      background: 'oklch(0.15 0.03 85)',    // 深色护眼 - 深棕黄色
      foreground: 'oklch(0.88 0.02 85)',    // 浅米色文字
      muted: 'oklch(0.2 0.04 85)',          // 中等深度棕黄
    },
  },
  {
    id: 'sepia',
    name: 'paperColor.sepia',
    light: {
      background: 'oklch(0.95 0.04 60)',    // 牛皮纸色 - 复古棕褐色
      foreground: 'oklch(0.25 0.05 45)',    // 深棕色文字
      muted: 'oklch(0.9 0.05 60)',          // 稍深的牛皮纸色
    },
    dark: {
      background: 'oklch(0.12 0.04 60)',    // 深色牛皮纸 - 深棕色
      foreground: 'oklch(0.85 0.04 60)',    // 浅棕色文字
      muted: 'oklch(0.18 0.05 60)',         // 中等深度棕色
    },
  },
  {
    id: 'light-blue',
    name: 'paperColor.lightBlue',
    light: {
      background: 'oklch(0.97 0.02 230)',   // 淡蓝色 - 清新蓝
      foreground: 'oklch(0.2 0.03 240)',    // 深蓝灰色文字
      muted: 'oklch(0.93 0.03 230)',        // 稍深的淡蓝色
    },
    dark: {
      background: 'oklch(0.12 0.03 230)',   // 深蓝色背景
      foreground: 'oklch(0.88 0.02 230)',   // 浅蓝色文字
      muted: 'oklch(0.18 0.04 230)',        // 中等深度蓝色
    },
  },
  {
    id: 'light-green',
    name: 'paperColor.lightGreen',
    light: {
      background: 'oklch(0.97 0.03 145)',   // 淡绿色 - 自然绿
      foreground: 'oklch(0.2 0.04 150)',    // 深绿色文字
      muted: 'oklch(0.93 0.04 145)',        // 稍深的淡绿色
    },
    dark: {
      background: 'oklch(0.12 0.03 145)',   // 深绿色背景
      foreground: 'oklch(0.88 0.03 145)',   // 浅绿色文字
      muted: 'oklch(0.18 0.04 145)',        // 中等深度绿色
    },
  },
];

/**
 * 根据 ID 获取纸张颜色预设
 */
export function getPaperColorPreset(id: PaperColorId): PaperColorPreset | undefined {
  return PAPER_COLOR_PRESETS.find(preset => preset.id === id);
}

/**
 * 验证是否为有效的纸张颜色 ID
 */
export function isValidPaperColorId(id: string): id is PaperColorId {
  return PAPER_COLOR_PRESETS.some(preset => preset.id === id);
}

/**
 * 获取所有纸张颜色 ID 列表
 */
export function getAllPaperColorIds(): PaperColorId[] {
  return PAPER_COLOR_PRESETS.map(preset => preset.id);
}
