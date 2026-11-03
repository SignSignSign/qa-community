import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import request from '../api/request';
import { AuthResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const toast = useToast();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const name = username.trim();
    if (name.length < 3 || name.length > 20) return toast.show('用户名需为 3-20 个字符', 'error');
    if (!EMAIL_RE.test(email.trim())) return toast.show('邮箱格式不正确', 'error');
    if (password.length < 6) return toast.show('密码长度不能少于 6 位', 'error');
    if (password !== confirm) return toast.show('两次输入的密码不一致', 'error');

    setSubmitting(true);
    try {
      const res = await request.post<AuthResponse>('/auth/register', {
        username: name,
        email: email.trim(),
        password
      });
      setAuth(res.token, res.user);
      toast.show('注册成功，已赠送 100 初始积分', 'success');
      navigate('/', { replace: true });
    } catch (err) {
      toast.show((err as Error).message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-sky-100 bg-sky-50/40 px-4 py-2.5 outline-none transition placeholder:text-slate-300 focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100';

  return (
    <div className="mx-auto max-w-md pt-8">
      <div className="rounded-2xl border border-sky-100 bg-white p-8 shadow-sm">
        <div className="text-center">
          <span className="text-4xl">🌤️</span>
          <h1 className="mt-2 text-2xl font-bold text-slate-700">加入蓝天问答</h1>
          <p className="mt-1 text-sm text-slate-400">注册即送 100 积分，开启问答之旅</p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">用户名（3-20 字符）</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="起一个喜欢的名字"
              autoComplete="username"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">密码（至少 6 位）</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="设置登录密码"
              autoComplete="new-password"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">确认密码</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="再次输入密码"
              autoComplete="new-password"
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-sky-500 py-2.5 font-medium text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-50"
          >
            {submitting ? '注册中…' : '注 册'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-400">
          已有账号？
          <Link to="/login" className="font-medium text-sky-500 hover:underline">
            直接登录
          </Link>
        </p>
      </div>
    </div>
  );
}
