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
    <div className="blog-content space-y-16">
      {content.map((section, index) => (
        <section 
          key={index} 
          className="relative group last:border-b-0 last:pb-0"
          id={`section-${index}`}
        >
          {/* 段落编号装饰 */}
          <div className="absolute -left-8 top-0 hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 text-primary text-sm font-bold border border-primary/20">
            {String(index + 1).padStart(2, '0')}
          </div>

          {/* 段落介绍 */}
          {section.introduce && (
            <div className="mb-8">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/[0.02] to-secondary/[0.02] border border-primary/10">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/50 to-secondary"></div>
                <div className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary text-sm">💡</span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                        Section Overview
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {section.introduce}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 段落标题 */}
          {section.title && (
            <div className="mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight tracking-tight scroll-m-20 group-hover:text-primary transition-colors duration-300">
                {section.title}
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
            </div>
          )}

          {/* Markdown 内容容器 */}
          <div className="relative">
            {/* 内容装饰线 */}
            <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent opacity-30"></div>
            
            {/* Markdown 内容 */}
            <div className="prose prose-lg dark:prose-invert max-w-none pl-0">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                  // 自定义标题渲染
                  h1: ({ children, ...props }) => (
                    <div className="my-8">
                      <h1 className="text-3xl font-bold text-foreground mb-3 leading-tight" {...props}>
                        {children}
                      </h1>
                      <div className="w-12 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                    </div>
                  ),
                  h2: ({ children, ...props }) => (
                    <div className="my-7">
                      <h2 className="text-2xl font-semibold text-foreground mb-2 leading-tight" {...props}>
                        {children}
                      </h2>
                      <div className="w-8 h-0.5 bg-primary/60 rounded-full"></div>
                    </div>
                  ),
                  h3: ({ children, ...props }) => (
                    <h3 className="text-xl font-medium mt-6 mb-3 text-foreground leading-tight" {...props}>
                      {children}
                    </h3>
                  ),

                  // 自定义段落
                  p: ({ children, ...props }) => (
                    <p className="mb-6 leading-relaxed text-foreground/90 text-lg" {...props}>
                      {children}
                    </p>
                  ),

                  // 自定义代码块
                  pre: ({ children, ...props }) => (
                    <div className="relative my-8">
                      <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-muted/50 to-transparent rounded-t-xl"></div>
                      <pre className="bg-muted/80 backdrop-blur-sm rounded-xl p-6 overflow-x-auto border border-border/50 shadow-lg" {...props}>
                        {children}
                      </pre>
                    </div>
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
                      <code className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-mono border border-primary/20" {...props}>
                        {children}
                      </code>
                    );
                  },

                  // 自定义链接
                  a: ({ children, href, ...props }) => (
                    <a
                      href={href}
                      className="text-primary hover:text-primary/80 underline decoration-primary/40 hover:decoration-primary decoration-2 underline-offset-2 transition-all duration-200 font-medium"
                      target={href?.startsWith('http') ? '_blank' : '_self'}
                      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                      {...props}
                    >
                      {children}
                    </a>
                  ),

                  // 自定义列表
                  ul: ({ children, ...props }) => (
                    <ul className="space-y-3 mb-6 pl-6" {...props}>
                      {children}
                    </ul>
                  ),
                  ol: ({ children, ...props }) => (
                    <ol className="space-y-3 mb-6 pl-6" {...props}>
                      {children}
                    </ol>
                  ),
                  li: ({ children, ...props }) => (
                    <li className="text-foreground/90 leading-relaxed relative before:absolute before:-left-6 before:top-2 before:w-2 before:h-2 before:bg-primary before:rounded-full" {...props}>
                      {children}
                    </li>
                  ),

                  // 自定义引用
                  blockquote: ({ children, ...props }) => (
                    <div className="my-8">
                      <blockquote className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/[0.02] to-secondary/[0.02] border border-primary/10" {...props}>
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary"></div>
                        <div className="p-6 pl-8">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-primary text-sm">💬</span>
                            </div>
                            <div className="text-muted-foreground italic leading-relaxed">
                              {children}
                            </div>
                          </div>
                        </div>
                      </blockquote>
                    </div>
                  ),

                  // 自定义表格
                  table: ({ children, ...props }) => (
                    <div className="overflow-hidden rounded-2xl border border-border/50 shadow-lg my-8">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse bg-card" {...props}>
                          {children}
                        </table>
                      </div>
                    </div>
                  ),
                  th: ({ children, ...props }) => (
                    <th className="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 text-left font-semibold text-foreground border-b border-border/50" {...props}>
                      {children}
                    </th>
                  ),
                  td: ({ children, ...props }) => (
                    <td className="p-4 text-foreground/90 border-b border-border/30 last:border-b-0" {...props}>
                      {children}
                    </td>
                  ),

                  // 自定义图片
                  img: ({ src, alt, ...props }) => {
                    // 排除可能冲突的 width 和 height 属性
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { width: _width, height: _height, ...restProps } = props;
                    return (
                      <div className="my-10">
                        <div className="relative overflow-hidden rounded-2xl border border-border/50 shadow-xl">
                          <Image
                            src={src as string || ''}
                            alt={alt || ''}
                            width={800}
                            height={600}
                            className="w-full h-auto transition-transform duration-300 hover:scale-105"
                            {...restProps}
                          />
                          {alt && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                              <p className="text-white text-sm font-medium">{alt}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  },

                  // 自定义分割线
                  hr: ({ ...props }) => (
                    <div className="flex items-center justify-center my-12" {...props}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div className="w-16 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                        <div className="w-2 h-2 bg-secondary rounded-full"></div>
                      </div>
                    </div>
                  ),
                }}
              >
                {section.content}
              </ReactMarkdown>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}