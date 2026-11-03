import axios, { AxiosRequestConfig } from 'axios';

const instance = axios.create({ baseURL: '/api', timeout: 10000 });

// 请求拦截器：自动携带 token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：统一错误提示格式；401 清理登录态并广播
instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || '网络错误，请稍后重试';
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(new Error(message));
  }
);

// 泛型封装，让调用处拿到正确的返回类型
const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.get(url, config) as unknown as Promise<T>;
  },
  post<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return instance.post(url, data, config) as unknown as Promise<T>;
  },
  put<T = any>(url: string, data?: unknown): Promise<T> {
    return instance.put(url, data) as unknown as Promise<T>;
  },
  delete<T = any>(url: string): Promise<T> {
    return instance.delete(url) as unknown as Promise<T>;
  }
};

export default request;
