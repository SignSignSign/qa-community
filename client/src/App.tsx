import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import CloudDecorations from './components/CloudDecorations';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import AskPage from './pages/AskPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  return (
    <div className="min-h-screen">
      <CloudDecorations />
      <Navbar />
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/question/:id" element={<QuestionDetailPage />} />
          <Route
            path="/ask"
            element={
              <ProtectedRoute>
                <AskPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="relative z-10 py-6 text-center text-sm text-sky-400">
        蓝天问答 · 让每个问题都有答案 ☁️
      </footer>
    </div>
  );
}
