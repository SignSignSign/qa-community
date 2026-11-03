import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import request from '../api/request';
import { Answer, Question, VoteResult } from '../types';
import { formatTime } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/Avatar';
import TagBadge from '../components/TagBadge';
import VoteButton from '../components/VoteButton';
import Markdown from '../components/Markdown';
import MarkdownEditor from '../components/MarkdownEditor';

export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const load = useCallback(async () => {
    try {
      const [q, a] = await Promise.all([
        request.get<Question>(`/questions/${id}`),
        request.get<{ list: Answer[] }>(`/questions/${id}/answers`)
      ]);
      setQuestion(q);
      setAnswers(a.list);
    } catch (err) {
      toast.show((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  // 点赞（问题 / 回答通用）
  const vote = async (targetType: 'question' | 'answer', targetId: number) => {
    if (!user) {
      toast.show('请先登录后再点赞', 'info');
      navigate('/login');
      return;
    }
    try {
      const res = await request.post<VoteResult>('/votes', { target_type: targetType, target_id: targetId });
      if (targetType === 'question' && question) {
        setQuestion({ ...question, votes: res.votes, isVoted: res.voted });
      } else {
        setAnswers((prev) =>
          prev.map((a) => (a.id === targetId ? { ...a, votes: res.votes, isVoted: res.voted } : a))
        );
      }
      toast.show(res.voted ? '点赞成功' : '已取消点赞', 'success');
    } catch (err) {
      toast.show((err as Error).message, 'error');
    }
  };

  // 删除问题（仅作者）
  const removeQuestion = async () => {
    if (!question || !window.confirm('确定删除这个问题吗？相关回答会一并删除。')) return;
    try {
      await request.delete(`/questions/${question.id}`);
      toast.show('问题已删除', 'success');
      navigate('/');
    } catch (err) {
      toast.show((err as Error).message, 'error');
    }
  };

  // 提交回答
  const submitAnswer = async () => {
    if (!answerContent.trim()) {
      toast.show('回答内容不能为空', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await request.post(`/questions/${id}/answers`, { content: answerContent });
      toast.show('回答成功，积分 +10', 'success');
      setAnswerContent('');
      await Promise.all([load(), refreshUser()]);
    } catch (err) {
      toast.show((err as Error).message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 采纳最佳答案（仅提问者）
  const accept = async (answerId: number) => {
    try {
      await request.post(`/questions/${id}/answers/${answerId}/accept`);
      toast.show('采纳成功', 'success');
      await load();
    } catch (err) {
      toast.show((err as Error).message, 'error');
    }
  };

  // 保存编辑的回答
  const saveAnswer = async (answerId: number) => {
    if (!editingContent.trim()) {
      toast.show('回答内容不能为空', 'error');
      return;
    }
    try {
      await request.put(`/questions/${id}/answers/${answerId}`, { content: editingContent });
      toast.show('回答已更新', 'success');
      setEditingId(null);
      await load();
    } catch (err) {
      toast.show((err as Error).message, 'error');
    }
  };

  // 删除回答（仅作者）
  const removeAnswer = async (answerId: number) => {
    if (!window.confirm('确定删除这条回答吗？')) return;
    try {
      await request.delete(`/questions/${id}/answers/${answerId}`);
      toast.show('回答已删除', 'success');
      await load();
    } catch (err) {
      toast.show((err as Error).message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-sky-400">
        <span className="text-3xl">☁️</span>
        <p className="mt-2 text-sm">加载中…</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="rounded-2xl border border-sky-100 bg-white py-24 text-center shadow-sm">
        <span className="text-4xl">🌧️</span>
        <p className="mt-3 text-slate-400">问题不存在或已被删除</p>
        <Link to="/" className="mt-4 inline-block text-sm text-sky-500 hover:underline">返回首页</Link>
      </div>
    );
  }

  const isAuthor = user?.id === question.author_id;

  return (
    <div className="mx-auto max-w-4xl">
      {/* 问题卡片 */}
      <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold leading-snug text-slate-700 sm:text-2xl">{question.title}</h1>
          {!!question.is_solved && (
            <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-500">
              ✓ 已解决
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <Avatar username={question.author_name} avatar={question.author_avatar} size={24} />
          <span className="font-medium text-slate-500">{question.author_name}</span>
          <span>发布于 {formatTime(question.created_at)}</span>
          <span>👀 {question.views} 次浏览</span>
        </div>

        {question.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {question.tags.map((t) => (
              <TagBadge key={t} tag={t} />
            ))}
          </div>
        )}

        <div className="mt-5 border-t border-sky-50 pt-5">
          <Markdown>{question.content}</Markdown>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-sky-50 pt-5">
          <VoteButton votes={question.votes} isVoted={question.isVoted} onVote={() => vote('question', question.id)} />
          {isAuthor && (
            <div className="flex gap-2 text-sm">
              <Link
                to={`/ask?edit=${question.id}`}
                className="rounded-full border border-sky-200 px-4 py-1.5 text-sky-500 transition hover:bg-sky-50"
              >
                编辑
              </Link>
              <button
                onClick={removeQuestion}
                className="rounded-full border border-red-200 px-4 py-1.5 text-red-400 transition hover:bg-red-50"
              >
                删除
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 回答列表 */}
      <h2 className="mb-4 mt-8 text-lg font-bold text-slate-700">
        💬 全部回答 <span className="text-sky-500">({answers.length})</span>
      </h2>

      {answers.length === 0 ? (
        <div className="rounded-2xl border border-sky-100 bg-white py-16 text-center shadow-sm">
          <span className="text-3xl">🌱</span>
          <p className="mt-2 text-sm text-slate-400">还没有回答，来抢沙发~</p>
        </div>
      ) : (
        <div className="space-y-4">
          {answers.map((a) => {
            const accepted = !!a.is_accepted;
            return (
              <div
                key={a.id}
                className={`rounded-2xl bg-white p-6 shadow-sm transition ${
                  accepted ? 'border-2 border-sky-400 bg-sky-50/40' : 'border border-sky-100'
                }`}
              >
                {accepted && (
                  <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-sky-500 px-3 py-1 text-xs font-medium text-white">
                    ⭐ 最佳答案
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Avatar username={a.author_name} avatar={a.author_avatar} size={24} />
                  <span className="font-medium text-slate-500">{a.author_name}</span>
                  <span>{formatTime(a.created_at)}</span>
                </div>

                <div className="mt-4">
                  {editingId === a.id ? (
                    <div className="space-y-3">
                      <MarkdownEditor value={editingContent} onChange={setEditingContent} minHeight={120} />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveAnswer(a.id)}
                          className="rounded-full bg-sky-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-600"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded-full border border-slate-200 px-4 py-1.5 text-sm text-slate-400 hover:bg-slate-50"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Markdown>{a.content}</Markdown>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-sky-50 pt-4">
                  <VoteButton votes={a.votes} isVoted={a.isVoted} onVote={() => vote('answer', a.id)} />

                  {/* 采纳按钮：仅提问者、问题未解决、非自己的回答 */}
                  {isAuthor && !question.is_solved && a.author_id !== user?.id && (
                    <button
                      onClick={() => accept(a.id)}
                      className="rounded-full border border-emerald-200 px-4 py-1.5 text-sm font-medium text-emerald-500 transition hover:bg-emerald-50"
                    >
                      ✓ 采纳答案
                    </button>
                  )}

                  {/* 自己的回答：编辑 / 删除 */}
                  {user?.id === a.author_id && (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(a.id);
                          setEditingContent(a.content);
                        }}
                        className="rounded-full border border-sky-200 px-4 py-1.5 text-sm text-sky-500 transition hover:bg-sky-50"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => removeAnswer(a.id)}
                        className="rounded-full border border-red-200 px-4 py-1.5 text-sm text-red-400 transition hover:bg-red-50"
                      >
                        删除
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 写回答 */}
      <div className="mt-8 rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-bold text-slate-700">✍️ 写下你的回答</h3>
        {user ? (
          <div className="space-y-4">
            <MarkdownEditor value={answerContent} onChange={setAnswerContent} />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">提交回答可获得 +10 积分</span>
              <button
                onClick={submitAnswer}
                disabled={submitting}
                className="rounded-full bg-sky-500 px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-50"
              >
                {submitting ? '提交中…' : '提交回答'}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-slate-400">登录后即可参与回答，还能获得积分哦</p>
            <Link
              to="/login"
              className="mt-3 inline-block rounded-full bg-sky-500 px-6 py-2 text-sm font-medium text-white transition hover:bg-sky-600"
            >
              去登录
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
