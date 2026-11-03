import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

// 云朵 Logo
const CloudLogo = () => (
  <svg viewBox="0 0 100 100" className="h-9 w-9">
    <circle cx="50" cy="50" r="46" fill="#38BDF8" />
    <g fill="#ffffff">
      <ellipse cx="38" cy="58" rx="18" ry="12" />
      <ellipse cx="58" cy="49" rx="16" ry="13" />
      <ellipse cx="71" cy="59" rx="13" ry="9" />
    </g>
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-sky-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <CloudLogo />
          <span className="text-xl font-bold tracking-wide text-sky-500">蓝天问答</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/ask"
            className="rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-600"
          >
            + 提问
          </Link>

          {user ? (
            <>
              <span className="hidden items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-600 sm:inline-flex">
                ☁️ {user.points} 分
              </span>
              <Link to="/profile" title="个人中心" className="transition hover:opacity-80">
                <Avatar username={user.username} avatar={user.avatar} size={36} />
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-sm text-slate-400 transition hover:text-sky-500"
              >
                退出
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-sky-500 hover:text-sky-600">
                登录
              </Link>
              <Link
                to="/register"
                className="rounded-full border border-sky-200 px-4 py-2 text-sm font-medium text-sky-500 transition hover:bg-sky-50"
              >
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
