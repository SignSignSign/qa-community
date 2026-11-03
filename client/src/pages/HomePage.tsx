import { useEffect, useMemo, useState } from 'react';
import request from '../api/request';
import { Paginated, Question, SortType } from '../types';
import QuestionCard from '../components/QuestionCard';
import Pagination from '../components/Pagination';
import TagBadge from '../components/TagBadge';
import { useToast } from '../context/ToastContext';

const SORT_TABS: { key: SortType; label: string }[] = [
  { key: 'latest', label: '最新' },
  { key: 'hot', label: '热门' },
  { key: 'unsolved', label: '未解决' }
];

// 预设热门标签（与列表中出现的标签聚合展示）
const HOT_TAGS = ['React', 'JavaScript', 'Node.js', 'MySQL', 'CSS', '前端', '后端'];

const PAGE_SIZE = 10;

export default function HomePage() {
  const toast = useToast();
  const [sort, setSort] = useState<SortType>('latest');
  const [tag, setTag] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<Question>>({ list: [], total: 0, page: 1, pageSize: PAGE_SIZE });
  const [loading, setLoading] = useState(true);

  // 标签栏：预设热门标签 + 当前列表中出现的标签，去重
  const tags = useMemo(() => {
    const set = new Set<string>(HOT_TAGS);
    data.list.forEach((q) => q.tags.forEach((t) => set.add(t)));
    return Array.from(set).slice(0, 12);
  }, [data.list]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ sort, page: String(page), pageSize: String(PAGE_SIZE) });
    if (tag) params.set('tag', tag);
    if (keyword) params.set('keyword', keyword);
    request
      .get<Paginated<Question>>(`/questions?${params.toString()}`)
      .then(setData)
      .catch((err) => toast.show(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [sort, tag, keyword, page]);

  const handleSearch = () => {
    setPage(1);
    setKeyword(inputValue.trim());
  };

  const switchSort = (s: SortType) => {
    setPage(1);
    setSort(s);
  };

  const switchTag = (t: string) => {
    setPage(1);
    setTag((prev) => (prev === t ? '' : t));
  };

  return (
    <div>
      {/* 顶部横幅 */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-sky-400 to-sky-300 p-6 text-white shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold sm:text-3xl">☁️ 蓝天问答社区</h1>
        <p className="mt-1 text-sm text-sky-50">提问 · 解答 · 分享，让每个问题都有答案</p>
      </div>

      {/* 搜索 + 排序 */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-full border border-sky-100 bg-white p-1 shadow-sm">
          {SORT_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => switchSort(t.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                sort === t.key ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-500 hover:text-sky-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="搜索问题关键词…"
            className="w-full rounded-full border border-sky-100 bg-white px-4 py-1.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-sky-300 focus:ring-2 focus:ring-sky-100 sm:w-64"
          />
          <button
            onClick={handleSearch}
            className="shrink-0 rounded-full bg-sky-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-sky-600"
          >
            搜索
          </button>
        </div>
      </div>

      {/* 标签筛选栏 */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400">🏷️ 标签筛选：</span>
        {tags.map((t) => (
          <TagBadge key={t} tag={t} active={tag === t} onClick={() => switchTag(t)} />
        ))}
      </div>

      {/* 问题列表 */}
      {loading ? (
        <div className="py-24 text-center text-sky-400">
          <span className="text-3xl">☁️</span>
          <p className="mt-2 text-sm">云朵加载中…</p>
        </div>
      ) : data.list.length === 0 ? (
        <div className="rounded-2xl border border-sky-100 bg-white py-24 text-center shadow-sm">
          <span className="text-4xl">🌤️</span>
          <p className="mt-3 text-slate-400">暂无相关问题，来发布第一个问题吧~</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.list.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}

      <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />
    </div>
  );
}
