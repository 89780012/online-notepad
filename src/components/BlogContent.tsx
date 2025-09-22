import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import Image from 'next/image';
import 'highlight.js/styles/github-dark.css';
import type { BlogPostArgument } from '@/types/blog';

interface BlogContentProps {
  content: BlogPostArgument[];
}

export default function BlogContent({ content }: BlogContentProps) {
  return (
    <div className="blog-content space-y-12">
      {content.map((section, index) => (
        <section key={index} className="border-b border-border last:border-b-0 pb-12 last:pb-0">
          {/* 段落介绍 */}
          {section.introduce && (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-md border-l-4 border-primary/30">
                {section.introduce}
              </p>
            </div>
          )}

          {/* 段落标题 */}
          {section.title && (
            <h2 className="text-3xl font-bold text-foreground mb-8 scroll-m-20" id={`section-${index}`}>
              {section.title}
            </h2>
          )}

          {/* Markdown 内容 */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
              components={{
                // 自定义标题渲染
                h1: ({ children, ...props }) => (
                  <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground" {...props}>
                    {children}
                  </h1>
                ),
                h2: ({ children, ...props }) => (
                  <h2 className="text-2xl font-semibold mt-6 mb-3 text-foreground" {...props}>
                    {children}
                  </h2>
                ),
                h3: ({ children, ...props }) => (
                  <h3 className="text-xl font-medium mt-4 mb-2 text-foreground" {...props}>
                    {children}
                  </h3>
                ),

                // 自定义段落
                p: ({ children, ...props }) => (
                  <p className="mb-4 leading-relaxed text-foreground" {...props}>
                    {children}
                  </p>
                ),

                // 自定义代码块
                pre: ({ children, ...props }) => (
                  <pre className="bg-muted rounded-lg p-4 overflow-x-auto my-6 border" {...props}>
                    {children}
                  </pre>
                ),

                // 自定义行内代码
                code: ({ children, className, ...props }) => {
                  // 检查是否是代码块中的code（有className）
                  if (className) {
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                  // 行内代码
                  return (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  );
                },

                // 自定义链接
                a: ({ children, href, ...props }) => (
                  <a
                    href={href}
                    className="text-primary hover:text-primary/80 underline decoration-primary/30 hover:decoration-primary transition-colors"
                    target={href?.startsWith('http') ? '_blank' : '_self'}
                    rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    {...props}
                  >
                    {children}
                  </a>
                ),

                // 自定义列表
                ul: ({ children, ...props }) => (
                  <ul className="list-disc list-inside space-y-2 mb-4" {...props}>
                    {children}
                  </ul>
                ),
                ol: ({ children, ...props }) => (
                  <ol className="list-decimal list-inside space-y-2 mb-4" {...props}>
                    {children}
                  </ol>
                ),
                li: ({ children, ...props }) => (
                  <li className="text-foreground" {...props}>
                    {children}
                  </li>
                ),

                // 自定义引用
                blockquote: ({ children, ...props }) => (
                  <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground bg-muted/50 p-4 rounded-r-md my-6" {...props}>
                    {children}
                  </blockquote>
                ),

                // 自定义表格
                table: ({ children, ...props }) => (
                  <div className="overflow-x-auto my-6">
                    <table className="w-full border-collapse border border-border rounded-lg" {...props}>
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children, ...props }) => (
                  <th className="border border-border bg-muted p-3 text-left font-semibold" {...props}>
                    {children}
                  </th>
                ),
                td: ({ children, ...props }) => (
                  <td className="border border-border p-3" {...props}>
                    {children}
                  </td>
                ),

                // 自定义图片
                img: ({ src, alt, ...props }) => (
                  <Image
                    src={src || ''}
                    alt={alt || ''}
                    width={800}
                    height={600}
                    className="rounded-lg shadow-md max-w-full h-auto my-6"
                    {...props}
                  />
                ),

                // 自定义分割线
                hr: ({ ...props }) => (
                  <hr className="border-border my-8" {...props} />
                ),
              }}
            >
              {section.content}
            </ReactMarkdown>
          </div>
        </section>
      ))}
    </div>
  );
}