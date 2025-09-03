// 笔记编辑模式类型定义
export const NOTE_MODES = {
  MARKDOWN: 'markdown',
  // 未来可扩展的模式
  // RICH_TEXT: 'rich-text',
  // CODE: 'code',
  // DRAWING: 'drawing',
} as const;

export type NoteMode = typeof NOTE_MODES[keyof typeof NOTE_MODES];

// 模式配置接口
export interface NoteModeConfig {
  id: NoteMode;
  name: string;
  description: string;
  icon: string; // Lucide React 图标名称
  fileExtension?: string;
  supportedFeatures: {
    preview?: boolean;
    syntax?: boolean;
    formatting?: boolean;
    export?: string[]; // 支持的导出格式
  };
}

// 默认模式配置
export const NOTE_MODE_CONFIGS: Record<NoteMode, NoteModeConfig> = {
  [NOTE_MODES.MARKDOWN]: {
    id: NOTE_MODES.MARKDOWN,
    name: 'Markdown',
    description: '支持Markdown语法的富文本编辑',
    icon: 'Hash',
    fileExtension: 'md',
    supportedFeatures: {
      preview: true,
      syntax: true,
      formatting: true,
      export: ['md', 'html', 'pdf'],
    },
  },
};

// 获取模式配置的工具函数
export const getModeConfig = (mode: NoteMode): NoteModeConfig => {
  return NOTE_MODE_CONFIGS[mode];
};

// 获取所有可用模式
export const getAvailableModes = (): NoteModeConfig[] => {
  return Object.values(NOTE_MODE_CONFIGS);
};

// 验证模式是否有效
export const isValidMode = (mode: string): mode is NoteMode => {
  return Object.values(NOTE_MODES).includes(mode as NoteMode);
};