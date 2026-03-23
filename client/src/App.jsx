import React from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

import Home from './pages/Home';
import Competitions from './pages/Competitions';
import CompetitionDetail from './pages/CompetitionDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';

import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import SupportChat from './pages/SupportChat';
import Chatbot from './pages/Chatbot';

import Inbox from './pages/Inbox';
import ThreadView from './pages/ThreadView';

import AdminOverview from './pages/admin/Overview';
import AdminCompetitions from './pages/admin/CompetitionsCRUD';
import AdminCategories from './pages/admin/CategoriesCRUD';
import AdminRegistrations from './pages/admin/Registrations';
import AdminUsers from './pages/admin/Users';
import AdminSupport from './pages/admin/SupportManagement';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const accessToken = searchParams.get('accessToken');
  const refreshToken = searchParams.get('refreshToken');
  React.useEffect(() => {
    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      login({ accessToken, refreshToken, user: {} });
      window.location.replace('/dashboard');
    } else {
      window.location.replace('/login');
    }
  }, [accessToken, refreshToken, login]);
  return <div className="min-h-screen flex items-center justify-center">Completing sign in...</div>;
}

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="competitions" element={<Competitions />} />
        <Route path="competitions/:id" element={<CompetitionDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="auth/callback" element={<AuthCallback />} />
      </Route>

      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="profile" element={<Profile />} />
        <Route path="support" element={<SupportChat />} />
        <Route path="chatbot" element={<Chatbot />} />
      </Route>

      <Route path="/" element={<ProtectedRoute roles={['SUPPORT', 'ADMIN']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="inbox" element={<Inbox />} />
        <Route path="inbox/:threadId" element={<ThreadView />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="overview" element={<AdminOverview />} />
        <Route path="competitions" element={<AdminCompetitions />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="registrations" element={<AdminRegistrations />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="support" element={<AdminSupport />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <SocketProvider>
      <AppRoutes />
    </SocketProvider>
  );
}
