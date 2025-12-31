# Requirements Document

## Introduction

为 Markdown 笔记应用添加"纸张颜色"主题功能，让用户可以选择不同的纸张背景色来获得更舒适的书写和阅读体验。纸张颜色主题模拟真实纸张的质感，如护眼黄、复古牛皮纸、淡蓝色等，独立于明暗模式运作。

## Glossary

- **Paper_Color_Theme**: 纸张颜色主题，定义编辑器和内容区域的背景色调
- **Theme_System**: 现有的明暗主题系统（light/dark/system）
- **Color_Preset**: 预设的纸张颜色选项
- **Theme_Context**: React Context 用于管理主题状态
- **CSS_Variables**: CSS 自定义属性，用于定义颜色值

## Requirements

### Requirement 1: 纸张颜色预设

**User Story:** As a user, I want to choose from predefined paper colors, so that I can find a comfortable background for writing and reading.

#### Acceptance Criteria

1. THE Paper_Color_Theme SHALL provide at least 5 predefined color presets including: default white, eye-care yellow, vintage sepia, light blue, and light green
2. WHEN a user selects a paper color preset, THE Theme_System SHALL apply the corresponding background color to the editor and content areas
3. THE Paper_Color_Theme SHALL work independently from the light/dark mode toggle
4. WHEN in dark mode, THE Paper_Color_Theme SHALL adjust the paper colors to darker variants that maintain the color tone

### Requirement 2: 纸张颜色切换界面

**User Story:** As a user, I want an intuitive interface to switch paper colors, so that I can easily change the background without disrupting my workflow.

#### Acceptance Criteria

1. THE Theme_System SHALL display a paper color selector in the settings or toolbar area
2. WHEN a user clicks on a color option, THE Theme_System SHALL immediately preview the color change
3. THE Paper_Color_Theme selector SHALL show color swatches with visual indicators for the currently selected color
4. THE Paper_Color_Theme selector SHALL be accessible via keyboard navigation

### Requirement 3: 纸张颜色持久化

**User Story:** As a user, I want my paper color preference to be saved, so that I don't have to reselect it every time I use the app.

#### Acceptance Criteria

1. WHEN a user selects a paper color, THE Theme_System SHALL persist the selection to localStorage
2. WHEN the application loads, THE Theme_System SHALL restore the previously selected paper color
3. IF no paper color preference exists, THEN THE Theme_System SHALL default to the standard white/dark background

### Requirement 4: 纸张颜色与明暗模式协调

**User Story:** As a user, I want paper colors to adapt to dark mode, so that I can enjoy colored backgrounds without eye strain at night.

#### Acceptance Criteria

1. WHEN dark mode is active, THE Paper_Color_Theme SHALL apply darker variants of each paper color
2. THE Paper_Color_Theme SHALL maintain sufficient contrast between text and background in both light and dark modes
3. WHEN switching between light and dark modes, THE Paper_Color_Theme SHALL smoothly transition the paper color variant

### Requirement 5: 纸张颜色 CSS 变量系统

**User Story:** As a developer, I want paper colors defined as CSS variables, so that the theme can be easily maintained and extended.

#### Acceptance Criteria

1. THE Paper_Color_Theme SHALL define all paper colors using CSS custom properties
2. THE CSS_Variables SHALL follow the existing naming convention (e.g., --paper-background, --paper-foreground)
3. WHEN a paper color is selected, THE Theme_System SHALL update the CSS variables on the document root
4. THE Paper_Color_Theme CSS_Variables SHALL be compatible with the existing Tailwind CSS configuration
