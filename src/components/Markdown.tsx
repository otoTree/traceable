"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
  content: string;
  className?: string;
}

const MARKDOWN_COMPONENTS = {
  p: ({ children }: any) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }: any) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
  li: ({ children }: any) => <li className="mb-1">{children}</li>,
  code: ({ children }: any) => (
    <code className="bg-black/5 px-1 rounded text-xs font-mono">{children}</code>
  ),
  pre: ({ children }: any) => (
    <pre className="bg-black/5 p-2 rounded-lg overflow-x-auto my-2 text-xs font-mono">
      {children}
    </pre>
  ),
  a: ({ children, href }: any) => (
    <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

const REMARK_PLUGINS = [remarkGfm];

export const Markdown = React.memo(({ content, className = "" }: MarkdownProps) => {
  return (
    <div className={`prose prose-sm max-w-none break-words ${className}`}>
      <ReactMarkdown 
        remarkPlugins={REMARK_PLUGINS}
        components={MARKDOWN_COMPONENTS}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

Markdown.displayName = "Markdown";
