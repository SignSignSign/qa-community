interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

// 分页组件
export default function Pagination({ page, pageSize, total, onChange }: PaginationProps) {
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  if (totalPages <= 1) return null;

  const btn = 'rounded-full px-4 py-1.5 text-sm font-medium transition';
  const enabled = 'border border-sky-200 bg-white text-sky-500 hover:bg-sky-50';
  const disabled = 'cursor-not-allowed border border-slate-100 bg-white text-slate-300';

  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button
        className={`${btn} ${page <= 1 ? disabled : enabled}`}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        上一页
      </button>
      <span className="text-sm text-slate-500">
        第 <span className="font-semibold text-sky-500">{page}</span> / {totalPages} 页 · 共 {total} 条
      </span>
      <button
        className={`${btn} ${page >= totalPages ? disabled : enabled}`}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        下一页
      </button>
    </div>
  );
}
