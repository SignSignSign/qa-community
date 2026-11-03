import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import request from '../api/request';
import { Question } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MarkdownEditor from '../components/MarkdownEditor';
import TagBadge from '../components/TagBadge';

// 提问 / 编辑问题页（编辑模式：/ask?edit=问题id）
export default function AskPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(!!editId);

  // 编辑模式：加载原问题内容并校验作者身份
  useEffect(() => {
    if (!editId || !user) return;
    request
      .get<Question>(`/questions/${editId}`)
      .then((q) => {
        if (q.author_id !== user.id) {
          toast.show('只能编辑自己发布的问题', 'error');
          navigate(`/question/${editId}`, { replace: true });
          return;
        }
        setTitle(q.title);
        setContent(q.content);
        setTags(q.tags);
      })
      .catch((err) => {
        toast.show(err.message, 'error');
        navigate('/', { replace: true });
      })
      .finally(() => setLoadingEdit(false));
  }, [editId, user]);

  // 标签输入：回车或逗号添加，最多 5 个
  const addTag = () => {
    const t = tagInput.trim().replace(/,/g, '');
    if (!t) return;
    if (tags.includes(t)) {
      toast.show('标签已存在', 'info');
    } else if (tags.length >= 5) {
      toast.show('最多添加 5 个标签', 'error');
    } else {
      setTags([...tags, t]);
    }
    setTagInput('');
  };

  const submit = async () => {
    if (!title.trim()) return toast.show('请输入问题标题', 'error');
    if (title.trim().length > 200) return toast.show('标题不能超过 200 个字符', 'error');
    if (!content.trim()) return toast.show('请填写问题描述', 'error');

    setSubmitting(true);
    try {
      if (editId) {
        await request.put(`/questions/${editId}`, { title: title.trim(), content, tags });
        toast.show('问题已更新', 'success');
        navigate(`/question/${editId}`);
      } else {
        const q = await request.post<Question>('/questions', { title: title.trim(), content, tags });
        toast.show('发布成功，积分 -5', 'success');
        refreshUser();
        navigate(`/question/${q.id}`);
      }
    } catch (err) {
      toast.show((err as Error).message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingEdit) {
    return (
      <div className="py-24 text-center text-sky-400">
        <span className="text-3xl">☁️</span>
        <p className="mt-2 text-sm">加载中…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-xl font-bold text-slate-700">{editId ? '✏️ 编辑问题' : '🌤️ 发布新问题'}</h1>
        {!editId && <p className="mt-1 text-sm text-slate-400">发布问题将扣除 5 积分</p>}

        {/* 标题 */}
        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-slate-600">问题标题</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="一句话描述你的问题，例如：如何实现蓝天白云主题的卡片组件？"
            maxLength={200}
            className="w-full rounded-xl border border-sky-100 bg-sky-50/40 px-4 py-2.5 text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
          />
        </div>

        {/* 标签 */}
        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-slate-600">
            标签 <span className="text-xs font-normal text-slate-400">（回车或逗号添加，最多 5 个）</span>
          </label>
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addTag();
              }
            }}
            onBlur={addTag}
            placeholder="例如：React、MySQL…"
            className="w-full rounded-xl border border-sky-100 bg-sky-50/40 px-4 py-2.5 text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
          />
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <TagBadge key={t} tag={`${t} ×`} active onClick={() => setTags(tags.filter((x) => x !== t))} />
              ))}
            </div>
          )}
        </div>

        {/* 内容 */}
        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-slate-600">问题描述（Markdown）</label>
          <MarkdownEditor value={content} onChange={setContent} minHeight={260} />
        </div>

        {/* 操作 */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full border border-slate-200 px-6 py-2 text-sm text-slate-400 transition hover:bg-slate-50"
          >
            取消
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="rounded-full bg-sky-500 px-8 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-50"
          >
            {submitting ? '提交中…' : editId ? '保存修改' : '发布问题'}
          </button>
        </div>
      </div>
    </div>
  );
}
