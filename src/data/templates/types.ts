import { LucideIcon } from 'lucide-react';

// 模板类型定义（原始模板，content 可能是函数）
export interface MarkdownTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: LucideIcon;
  content: string | ((t: (key: string) => string) => string);
  preview: string;
  tags: string[];
}

// 处理后的模板类型（content 已经是字符串）
export interface ProcessedTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: LucideIcon;
  content: string;
  preview: string;
  tags: string[];
}

// 模板分类定义
export interface TemplateCategory {
  id: string;
  name: string;
  icon: LucideIcon;
}

// 模板分类类型
export type TemplateCategoryId = 
  | 'all'
  | 'business' 
  | 'personal'
  | 'education'
  | 'technical'
  | 'creative'
  | 'productivity';