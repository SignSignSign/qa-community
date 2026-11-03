import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import request from '../api/request';
import { Answer, Paginated, Question, User } from '../types';
import { excerpt, formatTime } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/Avatar';
import TagBadge from '../components/TagBadge';
import Pagination from '../components/Pagination';

type TabKey = 'questions' | 'answers';
const PAGE_SIZE = 10;

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [tab, setTab] = useState<TabKey>('questions');
  const [page, setPage] = useState(1);
  const [questions, setQuestions] = useState<Paginated<Question>>({ list: [], total: 0, page: 1, pageSize: PAGE_SIZE });
  const [answers, setAnswers] = useState<Paginated<Answer>>({ list: [], total: 0, page: 1, pageSize: PAGE_SIZE });
  const [loading, setLoading] = useState(true);

  // 编辑资料
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'questions') {
        setQuestions(await request.get(`/users/me/questions?page=${page}&pageSize=${PAGE_SIZE}`));
      } else {
        setAnswers(await request.get(`/users/me/answers?page=${page}&pageSize=${PAGE_SIZE}`));
      }
    } catch (err) {
      toast.show((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const startEdit = () => {
    if (!user) return;
    setEmail(user.email);
    setAvatar(user.avatar || '');
    setEditing(true);
  };

  const saveProfile = async () => {
    try {
      await request.put<User>('/users/me', { email: email.trim(), avatar: avatar.trim() });
      toast.show('资料已更新', 'success');
      setEditing(false);
      await refreshUser();
    } catch (err) {
      toast.show((err as Error).message, 'error');
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl">
      {/* 用户卡片 */}
      <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <Avatar username={user.username} avatar={user.avatar} size={80} />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-slate-700">{user.username}</h1>
            <p className="mt-1 text-sm text-slate-400">{user.email}</p>
            <p className="mt-1 text-xs text-slate-300">注册于 {formatTime(user.created_at)}</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-2xl bg-gradient-to-br from-sky-400 to-sky-300 px-6 py-3 text-center text-white shadow-sm">
              <div className="text-2xl font-bold">{user.points}</div>
              <div className="text-xs text-sky-50">☁️ 我的积分</div>
            </div>
            {!editing && (
              <button onClick={startEdit} className="text-sm text-sky-500 hover:underline">
                编辑资料
              </button>
            )}
          </div>
        </div>

        {/* 编辑资料表单 */}
        {editing && (
          <div className="mt-6 space-y-3 rounded-xl border border-sky-100 bg-sky-50/40 p-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">邮箱</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-sky-100 bg-white px-3 py-2 text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">头像 URL</label>
              <input
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://api.dicebear.com/7.x/adventurer/svg?seed=你的名字"
                className="w-full rounded-lg border border-sky-100 bg-white px-3 py-2 text-sm outline-none placeholder:text-slate-300 focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditing(false)}
                className="rounded-full border border-slate-200 px-4 py-1.5 text-sm text-slate-400 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={saveProfile}
                className="rounded-full bg-sky-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-600"
              >
                保存
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tab 切换 */}
      <div className="mt-6 flex gap-1 rounded-full border border-sky-100 bg-white p-1 shadow-sm sm:w-fit">
        {(
          [
            { key: 'questions', label: `我的提问 (${questions.total})` },
            { key: 'answers', label: `我的回答 (${answers.total})` }
          ] as { key: TabKey; label: string }[]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setPage(1);
            }}
            className={`rounded-full px-5 py-1.5 text-sm font-medium transition ${
              tab === t.key ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-500 hover:text-sky-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 列表 */}
      <div className="mt-4">
        {loading ? (
          <div className="py-16 text-center text-sky-400">
            <span className="text-2xl">☁️</span>
            <p className="mt-2 text-sm">加载中…</p>
          </div>
        ) : tab === 'questions' ? (
          questions.list.length === 0 ? (
            <Empty text="还没有发布过问题" />
          ) : (
            <div className="space-y-3">
              {questions.list.map((q) => (
                <Link
                  key={q.id}
                  to={`/question/${q.id}`}
                  className="block rounded-2xl border border-sky-100 bg-white p-5 shadow-sm transition hover:border-sky-200 hover:shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="flex-1 font-semibold text-slate-700">{q.title}</h3>
                    {!!q.is_solved && (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-500">✓ 已解决</span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    {q.tags.map((t) => (
                      <TagBadge key={t} tag={t} />
                    ))}
                    <span className="ml-auto">
                      👍 {q.votes} · 💬 {q.answers_count} · 👀 {q.views} · {formatTime(q.created_at)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : answers.list.length === 0 ? (
          <Empty text="还没有发布过回答" />
        ) : (
          <div className="space-y-3">
            {answers.list.map((a) => (
              <Link
                key={a.id}
                to={`/question/${a.question_id}`}
                className="block rounded-2xl border border-sky-100 bg-white p-5 shadow-sm transition hover:border-sky-200 hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <h3 className="flex-1 font-semibold text-slate-700">{a.question_title}</h3>
                  {!!a.is_accepted && (
                    <span className="rounded-full bg-sky-500 px-2.5 py-0.5 text-xs text-white">⭐ 最佳答案</span>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-400">{excerpt(a.content)}</p>
                <div className="mt-2 text-xs text-slate-400">
                  👍 {a.votes} · {formatTime(a.created_at)}
                </div>
              </Link>
            ))}
          </div>
        )}

        <Pagination
          page={tab === 'questions' ? questions.page : answers.page}
          pageSize={PAGE_SIZE}
          total={tab === 'questions' ? questions.total : answers.total}
          onChange={setPage}
        />
      </div>
    </div>
  );
}

const Empty = ({ text }: { text: string }) => (
  <div className="rounded-2xl border border-sky-100 bg-white py-16 text-center shadow-sm">
    <span className="text-3xl">🌤️</span>
    <p className="mt-2 text-sm text-slate-400">{text}</p>
  </div>
);
