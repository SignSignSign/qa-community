import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import request from '../api/request';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  // 刷新当前用户信息（积分变动后调用）
  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const data = await request.get<User>('/users/me');
      setUser(data);
    } catch {
      /* 静默失败，token 失效时拦截器已处理 */
    }
  }, []);

  // 初始化：有 token 则恢复登录状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    request
      .get<User>('/users/me')
      .then((data) => setUser(data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  // 监听 401 过期事件，自动登出
  useEffect(() => {
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, [logout]);

  const setAuth = useCallback((token: string, u: User) => {
    localStorage.setItem('token', token);
    setUser(u);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setAuth, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用');
  return ctx;
};
