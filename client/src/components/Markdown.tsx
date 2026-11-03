import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Markdown 渲染器（GFM 语法支持，prose 排版）
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-sky max-w-none text-slate-700 prose-headings:text-slate-700 prose-a:text-sky-500">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
