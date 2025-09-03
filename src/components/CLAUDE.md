[根目录](../../CLAUDE.md) > **src/components**

# React 组件库模块

## 模块职责

React 组件库是 Online Notepad 的核心 UI 层，负责提供所有用户界面组件，包括 Markdown 编辑器、笔记管理、主题切换、国际化控制等功能组件。采用现代 React 19 特性和 Tailwind CSS 设计系统。

## 入口与启动

### 核心编辑器组件
- **`NewMarkdownEditor.tsx`** - 主要的 Markdown 编辑器，集成 @uiw/react-md-editor
- **`NoteList.tsx`** - 笔记列表管理，支持搜索、删除、分享操作
- **`MarketingContent.tsx`** - 首页营销内容和功能介绍

### 对话框与弹窗
- **`SharePopup.tsx`** - 笔记分享功能弹窗
- **`SaveAsDialog.tsx`** - 文件另存为对话框
- **`MarkdownPreview.tsx`** - Markdown 内容预览组件

## 对外接口

### 编辑器接口 (NewMarkdownEditor)
```typescript
interface NewMarkdownEditorProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onSave?: () => void;
  onShare?: () => void;
  onOpenFile?: (title: string, content: string) => void;
  onSaveAs?: (title: string, content: string) => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
  isAutoSaving?: boolean;
  onClearMarkdown?: () => void;
  onUseTemplate?: () => void;
}
```

### 笔记列表接口 (NoteList)
```typescript
interface NoteListProps {
  notes: LocalNote[];
  deleteNote: (id: string) => void;
  onNoteSelect: (note: LocalNote) => void;
  onNewNote: () => void;
  onNoteDelete: (noteId: string) => void;
  onNoteUnshare: (noteId: string) => void;
  selectedNoteId?: string;
  onCloseSidebar: () => void;
}
```

### 主题切换接口 (ThemeToggle)
```typescript
// 使用 ThemeContext 提供的方法
const { theme, setTheme, resolvedTheme } = useTheme();
// 支持: 'light' | 'dark' | 'system'
```

### 语言切换接口 (LanguageToggle)
```typescript
// 基于 next-intl 的国际化
import { useLocale, useRouter } from 'next-intl';
// 支持: 'en' | 'zh'
```

## 关键依赖与配置

### 核心依赖
```json
{
  "@uiw/react-md-editor": "^4.0.8",    // Markdown编辑器核心
  "@radix-ui/react-dropdown-menu": "^2.1.16",
  "@radix-ui/react-label": "^2.1.7",
  "@radix-ui/react-slot": "^1.2.3",
  "lucide-react": "^0.542.0",          // 图标库
  "react-markdown": "^10.1.0",         // Markdown渲染
  "rehype-highlight": "^7.0.2",        // 代码高亮
  "rehype-katex": "^7.0.1",           // 数学公式
  "remark-gfm": "^4.0.1",             // GitHub Flavored Markdown
  "katex": "^0.16.22"                 // KaTeX数学公式
}
```

### Tailwind CSS 设计系统
```typescript
// 主题变量 (globals.css)
:root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(222.2 84% 4.9%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(222.2 84% 4.9%);
  // ... 更多CSS变量
}

[data-theme="dark"] {
  --background: hsl(222.2 84% 4.9%);
  --foreground: hsl(210 40% 98%);
  // ... 暗色主题变量
}
```

### 组件配置 (components.json)
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

## 数据模型

### 笔记数据接口
```typescript
interface LocalNote {
  id: string;
  title: string;
  content: string;
  mode: NoteMode;
  createdAt: string;
  updatedAt: string;
  customSlug?: string;
  isPublic?: boolean;
  shareToken?: string;
  cloudNoteId?: string;
}

type NoteMode = 'markdown'; // 当前仅支持Markdown模式
```

### 主题状态模型
```typescript
type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}
```

### 编辑器状态模型
```typescript
interface EditorState {
  title: string;
  content: string;
  isAutoSaving: boolean;
  isFocusMode: boolean;
  showSidebar: boolean;
  selectedNote: LocalNote | null;
}
```

## 测试与质量

### 当前状态: ⚠️ 缺少测试覆盖

**急需的测试用例:**

#### 单元测试 (Jest + Testing Library)
```typescript
// NewMarkdownEditor.test.tsx
describe('NewMarkdownEditor', () => {
  it('应当正确渲染编辑器界面', () => {});
  it('应当响应内容变化并触发回调', () => {});
  it('应当正确处理专注模式切换', () => {});
  it('应当支持文件导入和导出', () => {});
  it('应当正确处理自动保存状态', () => {});
});

// NoteList.test.tsx  
describe('NoteList', () => {
  it('应当正确显示笔记列表', () => {});
  it('应当支持笔记搜索功能', () => {});
  it('应当处理笔记删除确认', () => {});
  it('应当显示分享状态', () => {});
});

// ThemeToggle.test.tsx
describe('ThemeToggle', () => {
  it('应当正确切换主题', () => {});
  it('应当持久化主题选择', () => {});
  it('应当跟随系统主题', () => {});
});
```

#### 可访问性测试
```typescript
// accessibility.test.tsx
describe('Accessibility', () => {
  it('编辑器应当支持键盘导航', () => {});
  it('按钮应当有正确的aria-label', () => {});
  it('颜色对比度应当符合WCAG标准', () => {});
  it('专注模式应当正确管理焦点', () => {});
});
```

### 代码质量指标
- **TypeScript 覆盖率**: 100% (严格模式)
- **ESLint 规则**: Next.js 推荐配置
- **组件复用性**: 高 (基于 Radix UI)
- **性能优化**: 中等 (需要懒加载)

## 常见问题 (FAQ)

### Q: 如何添加新的编辑模式？
A: 在 `src/types/note-modes.ts` 中扩展 NOTE_MODES 常量，然后在编辑器中添加对应的处理逻辑。

### Q: 如何自定义主题颜色？
A: 修改 `src/app/globals.css` 中的 CSS 变量，确保同时更新亮色和暗色主题。

### Q: Markdown 渲染性能如何优化？
A: 可以考虑：
1. 使用 `React.memo` 包装编辑器组件
2. 实现虚拟滚动处理大文档
3. 防抖处理内容变化

### Q: 如何添加新的 UI 组件？
A: 使用 shadcn/ui CLI：
```bash
npx shadcn@latest add [component-name]
```

### Q: 专注模式的 ESC 键监听如何工作？
A: 通过 `useEffect` 监听 keydown 事件，在专注模式下拦截 ESC 键并调用退出函数。

## 相关文件清单

### 核心组件文件
```
src/components/
├── NewMarkdownEditor.tsx    # 主编辑器组件 (413行)
├── NoteList.tsx            # 笔记列表组件
├── MarketingContent.tsx    # 营销页面组件
├── SharePopup.tsx          # 分享弹窗组件
├── SaveAsDialog.tsx        # 保存对话框
├── LanguageToggle.tsx      # 语言切换组件
├── ThemeToggle.tsx         # 主题切换组件
└── MarkdownPreview.tsx     # 预览组件
```

### UI 基础组件
```
src/components/ui/
├── button.tsx              # 按钮组件
├── input.tsx               # 输入框组件
├── textarea.tsx            # 文本域组件
├── card.tsx                # 卡片组件
├── label.tsx               # 标签组件
└── dropdown-menu.tsx       # 下拉菜单组件
```

### 关联配置文件
- `src/app/globals.css` - 全局样式和主题变量
- `components.json` - shadcn/ui 组件配置
- `src/contexts/ThemeContext.tsx` - 主题状态管理
- `src/hooks/useLocalNotes.ts` - 笔记数据管理

## 变更记录 (Changelog)

### 2025-09-03 当前版本
- ✅ **NewMarkdownEditor**: 集成 @uiw/react-md-editor，支持实时预览和 KaTeX
- ✅ **专注模式**: 全屏编辑体验，ESC 键退出
- ✅ **主题系统**: 完整的亮色/暗色/系统跟随支持
- ✅ **国际化**: 中英文界面完整支持
- ✅ **响应式设计**: 移动端友好的侧边栏和工具栏
- ✅ **自动保存**: 实时内容保存和状态提示
- ✅ **文件操作**: 支持导入.md/.txt文件和导出功能

### 计划改进
- [ ] **性能优化**: 实现 React.lazy 组件懒加载
- [ ] **可访问性**: 完善键盘导航和屏幕阅读器支持  
- [ ] **测试覆盖**: 建立完整的单元测试和集成测试
- [ ] **错误边界**: 添加组件级错误处理
- [ ] **更多编辑模式**: 富文本、代码编辑、绘图模式

---

> 📝 **开发提示**: 修改组件时请确保保持 TypeScript 严格类型检查，并验证主题切换和国际化功能正常工作
> 
> 🎨 **设计一致性**: 所有新组件都应该遵循现有的 Tailwind CSS 设计系统和 Radix UI 模式