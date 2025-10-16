# 键盘快捷键说明

## 📋 完整快捷键列表

### 文件操作
| 功能 | 快捷键 | 说明 |
|------|--------|------|
| 新建笔记 | `Alt + N` | 创建新笔记 |
| 打开文件 | `Alt + O` | 从本地打开Markdown文件 |
| 保存 | `Ctrl + S` (Win) / `⌘ S` (Mac) | 手动保存当前笔记 |
| 打印 | `Ctrl + P` (Win) / `⌘ P` (Mac) | 打印当前笔记 |

### 视图操作
| 功能 | 快捷键 | 说明 |
|------|--------|------|
| 专注模式 | `F11` | 切换全屏专注模式 |
| 切换侧边栏 | `Ctrl + B` (Win) / `⌘ B` (Mac) | 显示/隐藏笔记列表侧边栏 |

### 其他操作
| 功能 | 快捷键 | 说明 |
|------|--------|------|
| 分享笔记 | `Ctrl + Shift + S` (Win) / `⌘ ⇧ S` (Mac) | 生成分享链接 |
| 快捷键帮助 | `Ctrl + /` (Win) / `⌘ /` (Mac) | 显示快捷键帮助对话框 |

---

## ⚠️ 为什么使用 Alt 组合键？

### 问题背景
某些快捷键（如 `Ctrl+N`、`Ctrl+O`）是浏览器的**系统级快捷键**，浏览器会在事件传递到网页之前就拦截它们：

| 快捷键 | 浏览器默认行为 | 能否被网页阻止？ |
|--------|--------------|----------------|
| `Ctrl + N` | 打开新窗口 | ❌ 不能 |
| `Ctrl + T` | 新建标签页 | ❌ 不能 |
| `Ctrl + W` | 关闭标签页 | ❌ 不能 |
| `Ctrl + O` | 打开文件对话框 | ⚠️ 部分浏览器可以 |
| `Ctrl + P` | 打印页面 | ✅ 通常可以 |
| `Ctrl + S` | 保存页面 | ✅ 通常可以 |

### 解决方案
为了避免与浏览器快捷键冲突，我们采用以下策略：

1. **文件操作使用 Alt 组合**
   - `Alt + N` 新建笔记（替代 `Ctrl+N`）
   - `Alt + O` 打开文件（替代 `Ctrl+O`）
   
2. **保留常用的 Ctrl 快捷键**
   - `Ctrl + S` 保存（浏览器通常允许拦截）
   - `Ctrl + P` 打印（浏览器通常允许拦截）

3. **使用功能键作为备选**
   - `F11` 专注模式（避免使用 `Ctrl+F11`）

---

## 💡 TUI Editor 内置快捷键

编辑器本身还支持以下Markdown编辑快捷键：

| 功能 | 快捷键 (Windows/Linux) | 快捷键 (Mac) |
|------|----------------------|-------------|
| 加粗 | `Ctrl + B` | `⌘ B` |
| 斜体 | `Ctrl + I` | `⌘ I` |
| 删除线 | `Ctrl + S` | `⌘ S` |
| 代码 | `Ctrl + Shift + C` | `⌘ ⇧ C` |
| 代码块 | `Ctrl + Shift + P` | `⌘ ⇧ P` |
| 链接 | `Ctrl + K` | `⌘ K` |
| 撤销 | `Ctrl + Z` | `⌘ Z` |
| 重做 | `Ctrl + Y` / `Ctrl + Shift + Z` | `⌘ Y` / `⌘ ⇧ Z` |

> **注意：** 部分快捷键可能与应用快捷键冲突。编辑器会根据上下文智能判断。

---

## 🔧 技术实现细节

### 快捷键监听
```typescript
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? event.metaKey : event.ctrlKey;

    // Alt+N: 新建笔记
    if (event.altKey && !modKey && !event.shiftKey && event.key === 'n') {
      event.preventDefault();
      onNewNote();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [onNewNote]);
```

### 关键点
1. **平台检测**: 区分 Mac (metaKey) 和 Windows/Linux (ctrlKey)
2. **preventDefault**: 阻止浏览器默认行为
3. **精确匹配**: 检查所有修饰键的状态，避免误触发
4. **清理监听器**: 组件卸载时移除事件监听器

---

## 📚 参考资料

- [MDN - KeyboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
- [Browser Default Keyboard Shortcuts](https://support.google.com/chrome/answer/157179)
- [TUI Editor Documentation](https://github.com/nhn/tui.editor)

---

## 🎯 未来优化方向

1. **自定义快捷键**: 允许用户自定义快捷键映射
2. **快捷键冲突检测**: 自动检测并提示冲突
3. **快捷键学习模式**: 在操作时显示快捷键提示
4. **快捷键录制**: 允许用户录制自己的快捷键组合

---

> **更新时间**: 2025-01-16  
> **维护者**: AI Assistant  
> **版本**: v2.0

