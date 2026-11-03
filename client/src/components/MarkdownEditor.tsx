import { useState } from 'react';
import Markdown from './Markdown';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

// 简易 Markdown 编辑器：编辑 / 预览双 Tab
export default function MarkdownEditor({
  value,
  onChange,
  placeholder = '支持 Markdown 语法，例如 **加粗**、`代码`、## 标题…',
  minHeight = 200
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');

  const tabBtn = 'rounded-t-lg px-4 py-2 text-sm font-medium transition';

  return (
    <div className="overflow-hidden rounded-xl border border-sky-100 bg-white">
      <div className="flex border-b border-sky-100 bg-sky-50/60">
        <button
          type="button"
          className={`${tabBtn} ${tab === 'edit' ? 'bg-white text-sky-600' : 'text-slate-400 hover:text-sky-500'}`}
          onClick={() => setTab('edit')}
        >
          ✏️ 编辑
        </button>
        <button
          type="button"
          className={`${tabBtn} ${tab === 'preview' ? 'bg-white text-sky-600' : 'text-slate-400 hover:text-sky-500'}`}
          onClick={() => setTab('preview')}
        >
          👀 预览
        </button>
      </div>

      {tab === 'edit' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ minHeight }}
          className="w-full resize-y bg-white p-4 font-mono text-sm leading-relaxed text-slate-700 outline-none placeholder:text-slate-300"
        />
      ) : (
        <div className="p-4" style={{ minHeight }}>
          {value.trim() ? (
            <Markdown>{value}</Markdown>
          ) : (
            <p className="text-sm text-slate-300">暂无内容，切换到编辑 Tab 开始编写…</p>
          )}
        </div>
      )}
    </div>
  );
}
