import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import request from '../api/request';
import { AuthResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuth();
  const toast = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 登录成功后回跳来源页（如被路由守卫拦截来的页面）
  const from = (location.state as { from?: string } | null)?.from || '/';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      return toast.show('请输入用户名和密码', 'error');
    }
    setSubmitting(true);
    try {
      const res = await request.post<AuthResponse>('/auth/login', {
        username: username.trim(),
        password
      });
      setAuth(res.token, res.user);
      toast.show(`欢迎回来，${res.user.username}`, 'success');
      navigate(from, { replace: true });
    } catch (err) {
      toast.show((err as Error).message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md pt-8">
      <div className="rounded-2xl border border-sky-100 bg-white p-8 shadow-sm">
        <div className="text-center">
          <span className="text-4xl">☁️</span>
          <h1 className="mt-2 text-2xl font-bold text-slate-700">登录蓝天问答</h1>
          <p className="mt-1 text-sm text-slate-400">回到这片蓝天，继续问答之旅</p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">用户名</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              autoComplete="username"
              className="w-full rounded-xl border border-sky-100 bg-sky-50/40 px-4 py-2.5 outline-none transition placeholder:text-slate-300 focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              autoComplete="current-password"
              className="w-full rounded-xl border border-sky-100 bg-sky-50/40 px-4 py-2.5 outline-none transition placeholder:text-slate-300 focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-sky-500 py-2.5 font-medium text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-50"
          >
            {submitting ? '登录中…' : '登 录'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-400">
          还没有账号？
          <Link to="/register" className="font-medium text-sky-500 hover:underline">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}
