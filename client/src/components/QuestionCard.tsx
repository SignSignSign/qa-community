import { Link } from 'react-router-dom';
import { Question } from '../types';
import { excerpt, formatTime } from '../utils/format';
import Avatar from './Avatar';
import TagBadge from './TagBadge';

// 首页问题卡片
export default function QuestionCard({ question }: { question: Question }) {
  return (
    <Link
      to={`/question/${question.id}`}
      className="group block rounded-2xl border border-sky-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 flex-1 text-base font-semibold leading-snug text-slate-700 transition group-hover:text-sky-500">
          {question.title}
        </h3>
        {!!question.is_solved && (
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-500">
            ✓ 已解决
          </span>
        )}
      </div>

      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">
        {excerpt(question.content)}
      </p>

      {question.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {question.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Avatar username={question.author_name} avatar={question.author_avatar} size={22} />
          <span className="font-medium text-slate-500">{question.author_name}</span>
          <span>{formatTime(question.created_at)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span title="点赞">👍 {question.votes}</span>
          <span title="回答">💬 {question.answers_count}</span>
          <span title="浏览">👀 {question.views}</span>
        </div>
      </div>
    </Link>
  );
}
