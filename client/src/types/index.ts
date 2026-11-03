// 与后端接口对应的数据类型

export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  points: number;
  created_at: string;
}

export interface Question {
  id: number;
  title: string;
  content: string;
  tags: string[];
  author_id: number;
  author_name: string;
  author_avatar: string | null;
  views: number;
  answers_count: number;
  votes: number;
  is_solved: 0 | 1;
  isVoted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: number;
  content: string;
  author_id: number;
  author_name: string;
  author_avatar: string | null;
  question_id: number;
  votes: number;
  is_accepted: 0 | 1;
  isVoted: boolean;
  created_at: string;
  updated_at: string;
  question_title?: string;
}

export interface Paginated<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface VoteResult {
  voted: boolean;
  votes: number;
}

export type SortType = 'latest' | 'hot' | 'unsolved';
