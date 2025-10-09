/**
 * 打印工具函数
 * 用于将 Markdown 内容转换为 HTML 并打印，无需打开新窗口
 */

interface PrintOptions {
  title: string;
  htmlContent: string;
  onError?: (error: Error) => void;
}

/**
 * 打印 Markdown 内容（优化版：使用隐藏 iframe，无需打开新窗口）
 * @param options 打印选项
 */
export function printMarkdownContent({ title, htmlContent, onError }: PrintOptions): void {
  let iframe: HTMLIFrameElement | null = null;
  let timeoutId: NodeJS.Timeout | null = null;
  let isProcessing = false;

  // 清理函数
  const cleanup = (delay = 100) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    
    setTimeout(() => {
      if (iframe && iframe.parentNode) {
        try {
          document.body.removeChild(iframe);
        } catch (e) {
          console.warn('清理 iframe 失败:', e);
        }
      }
      iframe = null;
    }, delay);
  };

  // 打印函数
  const executePrint = () => {
    if (isProcessing || !iframe) return;
    isProcessing = true;

    try {
      const iframeWindow = iframe.contentWindow;
      if (!iframeWindow) {
        console.warn('无法访问 iframe 窗口');
        cleanup(0);
        return;
      }

      // 聚焦并打印
      iframeWindow.focus();
      iframeWindow.print();
      
      // 打印对话框关闭后清理（延迟清理以确保打印完成）
      // 用户无论是打印还是取消，都是正常操作，不需要错误提示
      cleanup(1000);
      
    } catch (error) {
      // 静默处理打印错误，因为可能是用户取消操作
      console.warn('打印被取消或中断:', error);
      cleanup(0);
    }
  };

  try {
    // 创建隐藏的 iframe
    iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error('无法访问 iframe 文档');
    }

    // 构建打印页面的 HTML
    const printContent = generatePrintHTML(title, htmlContent);

    // 写入内容到 iframe
    iframeDoc.open();
    iframeDoc.write(printContent);
    iframeDoc.close();

    // 方案1: 使用 iframe.onload
    iframe.onload = () => {
      // 额外延迟确保内容完全渲染
      setTimeout(() => {
        executePrint();
      }, 100);
    };

    // 方案2: 使用 contentWindow 的 load 事件（更可靠）
    if (iframe.contentWindow) {
      iframe.contentWindow.addEventListener('load', () => {
        setTimeout(() => {
          executePrint();
        }, 100);
      }, { once: true });
    }

    // 方案3: 立即执行（降级方案，因为 document.close() 后内容已经准备好）
    // 如果 onload 没触发，这个会作为备用
    setTimeout(() => {
      if (!isProcessing && iframe) {
        console.log('使用降级打印方案');
        executePrint();
      }
    }, 500);

    // 设置超时保护（增加到10秒）
    timeoutId = setTimeout(() => {
      if (!isProcessing && iframe?.parentNode) {
        console.warn('打印加载超时，执行清理');
        cleanup(0);
        // 不再显示错误，因为可能已经在降级方案中执行了打印
      }
    }, 10000);

  } catch (error) {
    console.error('打印初始化失败:', error);
    cleanup(0);
    // 只在真正的初始化失败时才显示错误（如无法创建iframe等）
    if (onError && error instanceof Error) {
      onError(error);
    }
  }
}

/**
 * 生成打印页面的 HTML 内容
 * @param title 文档标题
 * @param htmlContent HTML 内容
 * @returns 完整的 HTML 字符串
 */
function generatePrintHTML(title: string, htmlContent: string): string {
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(title)}</title>
        <style>
          ${getPrintStyles()}
        </style>
      </head>
      <body>
        <div class="print-container">
          <h1 class="print-title">${escapeHtml(title)}</h1>
          <div class="print-content">
            ${htmlContent}
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * 获取打印样式
 * @returns CSS 样式字符串
 */
function getPrintStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                   'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
                   'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
                   'Noto Color Emoji';
      line-height: 1.6;
      color: #333;
      background: white;
    }
    
    .print-container {
      padding: 2cm;
      max-width: 21cm;
      margin: 0 auto;
    }
    
    .print-title {
      font-size: 2em;
      font-weight: 700;
      margin-bottom: 0.5em;
      padding-bottom: 0.3em;
      border-bottom: 2px solid #e5e7eb;
      color: #111827;
    }
    
    .print-content {
      margin-top: 1em;
    }
    
    /* 标题样式 */
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1em;
      margin-bottom: 0.5em;
      font-weight: 600;
      line-height: 1.25;
      color: #1f2937;
    }
    
    h1 { font-size: 2em; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.2em; }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1.1em; }
    h5 { font-size: 1em; }
    h6 { font-size: 0.9em; color: #6b7280; }
    
    /* 段落样式 */
    p {
      margin-bottom: 1em;
      color: #374151;
    }
    
    /* 列表样式 */
    ul, ol {
      margin-left: 2em;
      margin-bottom: 1em;
      padding-left: 0.5em;
    }
    
    li {
      margin-bottom: 0.3em;
      color: #374151;
    }
    
    ul ul, ul ol, ol ul, ol ol {
      margin-bottom: 0.3em;
      margin-top: 0.3em;
    }
    
    /* 代码样式 */
    code {
      background: #f3f4f6;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: 'Consolas', 'Monaco', 'Courier New', Courier, monospace;
      font-size: 0.875em;
      color: #dc2626;
      border: 1px solid #e5e7eb;
    }
    
    pre {
      background: #f9fafb;
      padding: 1em;
      border-radius: 6px;
      overflow-x: auto;
      margin-bottom: 1em;
      border: 1px solid #e5e7eb;
    }
    
    pre code {
      background: none;
      padding: 0;
      border: none;
      color: #374151;
      font-size: 0.875em;
      line-height: 1.6;
    }
    
    /* 引用样式 */
    blockquote {
      border-left: 4px solid #d1d5db;
      padding-left: 1em;
      margin-left: 0;
      margin-bottom: 1em;
      color: #6b7280;
      font-style: italic;
      background: #f9fafb;
      padding: 0.75em 1em;
      border-radius: 0 4px 4px 0;
    }
    
    /* 表格样式 */
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 1em;
      border: 1px solid #e5e7eb;
    }
    
    th, td {
      border: 1px solid #e5e7eb;
      padding: 0.75em 1em;
      text-align: left;
    }
    
    th {
      background: #f9fafb;
      font-weight: 600;
      color: #1f2937;
    }
    
    tr:nth-child(even) {
      background: #f9fafb;
    }
    
    /* 图片样式 */
    img {
      max-width: 100%;
      height: auto;
      margin-bottom: 1em;
      border-radius: 4px;
      display: block;
    }
    
    /* 水平线样式 */
    hr {
      border: none;
      border-top: 2px solid #e5e7eb;
      margin: 2em 0;
    }
    
    /* 链接样式 */
    a {
      color: #2563eb;
      text-decoration: none;
      word-wrap: break-word;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    /* 任务列表样式 */
    input[type="checkbox"] {
      margin-right: 0.5em;
    }
    
    /* 强调样式 */
    strong {
      font-weight: 600;
      color: #111827;
    }
    
    em {
      font-style: italic;
    }
    
    /* 删除线 */
    del {
      text-decoration: line-through;
      color: #6b7280;
    }
    
    /* 打印媒体查询 */
    @media print {
      body {
        padding: 0;
      }
      
      .print-container {
        padding: 0;
        max-width: 100%;
      }
      
      @page {
        margin: 2cm;
        size: A4;
      }
      
      /* 避免分页打断 */
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
      }
      
      pre, blockquote, table {
        page-break-inside: avoid;
      }
      
      img {
        page-break-inside: avoid;
      }
      
      /* 打印时显示链接 URL */
      a[href]:after {
        content: " (" attr(href) ")";
        font-size: 0.8em;
        color: #6b7280;
      }
      
      /* 不显示锚点链接的 URL */
      a[href^="#"]:after {
        content: "";
      }
    }
  `;
}

/**
 * HTML 转义函数，防止 XSS
 * @param unsafe 不安全的字符串
 * @returns 转义后的字符串
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

