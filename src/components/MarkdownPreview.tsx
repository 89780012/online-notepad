'use client';

import MDEditor from '@uiw/react-md-editor';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
// import 'katex/dist/katex.css';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export default function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  return (
    <div className={`markdown-preview ${className}`}>
      <MDEditor.Markdown
        source={content}
        style={{
          backgroundColor: 'transparent',
          color: 'inherit',
        }}
        rehypePlugins={[rehypeKatex]}
        remarkPlugins={[remarkMath]}
      />
    </div>
  );
}