# Implementation Plan: Paper Color Theme

## Overview

实现纸张颜色主题功能，包括类型定义、Context 创建、UI 组件、CSS 变量集成和国际化支持。

## Tasks

- [x] 1. 创建类型定义和颜色预设数据
  - [x] 1.1 创建 `src/types/paper-color.ts` 类型定义文件
    - 定义 PaperColorId 类型
    - 定义 PaperColorPreset 接口
    - 定义 PaperColorContextType 接口
    - _Requirements: 1.1, 5.1, 5.2_
  - [x] 1.2 创建 `src/data/paper-colors.ts` 颜色预设数据
    - 实现 5 种颜色预设（default, eye-care, sepia, light-blue, light-green）
    - 每种颜色包含 light 和 dark 变体
    - _Requirements: 1.1, 1.4_
  - [x] 1.3 编写属性测试：颜色预设完整性
    - **Property 1: Color Presets Completeness**
    - **Validates: Requirements 1.1, 1.4**

- [x] 2. 实现 PaperColorContext
  - [x] 2.1 创建 `src/contexts/PaperColorContext.tsx`
    - 实现 paperColor 状态管理
    - 实现 setPaperColor 方法
    - 实现 localStorage 持久化
    - 实现 CSS 变量更新逻辑
    - _Requirements: 1.2, 3.1, 3.2, 3.3, 5.3_
  - [x] 2.2 编写属性测试：持久化往返一致性
    - **Property 4: Persistence Round-Trip**
    - **Validates: Requirements 3.1, 3.2**
  - [x] 2.3 编写属性测试：纸张颜色与主题模式独立性
    - **Property 3: Paper Color Independence from Theme Mode**
    - **Validates: Requirements 1.3**

- [x] 3. 更新 CSS 变量系统
  - [x] 3.1 更新 `src/app/globals.css` 添加纸张颜色 CSS 变量
    - 添加 --paper-background, --paper-foreground, --paper-muted 变量
    - 添加过渡动画支持
    - _Requirements: 5.1, 5.2, 5.4, 4.3_
  - [x] 3.2 编写属性测试：CSS 变量命名规范
    - **Property 6: CSS Variable Naming Convention**
    - **Validates: Requirements 5.1, 5.2**

- [x] 4. Checkpoint - 核心功能验证
  - 确保所有测试通过，如有问题请询问用户

- [x] 5. 实现 PaperColorSelector 组件
  - [x] 5.1 创建 `src/components/PaperColorSelector.tsx`
    - 实现颜色色块显示
    - 实现当前选中指示器
    - 实现点击切换功能
    - 实现键盘导航支持
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 5.2 编写属性测试：颜色选择更新 CSS 变量
    - **Property 2: Color Selection Updates CSS Variables**
    - **Validates: Requirements 1.2, 2.2, 5.3**

- [x] 6. 添加国际化支持
  - [x] 6.1 更新 `src/messages/*.json` 添加纸张颜色相关翻译
    - 添加 paperColor.default, paperColor.eyeCare 等翻译键
    - 支持中文和英文
    - _Requirements: 2.1_

- [x] 7. 集成到应用
  - [x] 7.1 更新 `src/app/[locale]/layout.tsx` 添加 PaperColorProvider
    - 在 ThemeProvider 内部包裹 PaperColorProvider
    - _Requirements: 1.3_
  - [x] 7.2 更新 `src/components/TUIMarkdownEditor.tsx` 集成纸张颜色选择器
    - 在工具栏添加 PaperColorSelector
    - _Requirements: 2.1_
  - [x] 7.3 更新编辑器样式应用纸张颜色变量
    - 使用 --paper-background 替代固定背景色
    - _Requirements: 1.2, 4.1_

- [x] 8. Checkpoint - 集成验证
  - 确保所有测试通过，如有问题请询问用户

- [x] 9. 编写对比度合规性测试
  - [x] 9.1 编写属性测试：WCAG 对比度合规
    - **Property 5: Contrast Ratio Compliance**
    - **Validates: Requirements 4.2**

- [x] 10. Final Checkpoint - 完整功能验证
  - 所有 36 个测试通过 ✅

## Notes

- 所有任务都是必须完成的
- 每个任务都引用了具体的需求条款以便追溯
- 属性测试使用 fast-check 库实现
- Checkpoint 任务用于增量验证
