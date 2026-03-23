import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, LayoutDashboard, Calendar, User, Bot, Inbox, Users, Trophy, FolderOpen, ClipboardList, Settings } from 'lucide-react';
import clsx from 'clsx';

const userNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/support', label: 'Support', icon: MessageCircle },
  { to: '/chatbot', label: 'Chatbot', icon: Bot },
];

const supportNav = [
  { to: '/inbox', label: 'Inbox', icon: Inbox },
];

const adminNav = [
  { to: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/competitions', label: 'Competitions', icon: Trophy },
  { to: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { to: '/admin/registrations', label: 'Registrations', icon: ClipboardList },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/support', label: 'Support', icon: Settings },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = [
    ...userNav,
    ...(user?.role === 'SUPPORT' || user?.role === 'ADMIN' ? supportNav : []),
    ...(user?.role === 'ADMIN' ? adminNav : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex">
      <aside className={clsx(
        'fixed lg:static inset-y-0 left-0 z-40 w-56 bg-slate-900/95 border-r border-blue-900 transform transition lg:transform-none',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-blue-900">
          <Link to="/" className="font-bold text-sky-400">Taakra</Link>
          <button type="button" className="lg:hidden p-2 text-slate-300" onClick={() => setSidebarOpen(false)}>×</button>
        </div>
        <nav className="p-2 space-y-1">
          <Link to="/competitions" className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-sky-500/20 hover:text-sky-400">
            <Trophy className="w-4 h-4" /> Competitions
          </Link>
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg',
                location.pathname === to || location.pathname.startsWith(to + '/')
                  ? 'bg-sky-500/25 text-sky-300 font-medium'
                  : 'text-slate-300 hover:bg-sky-500/20 hover:text-sky-400'
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-blue-900 bg-slate-900/90 backdrop-blur flex items-center justify-between px-4">
          <button type="button" className="lg:hidden p-2 text-slate-300" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300">{user?.name}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-sky-500/30 text-sky-300">{user?.role}</span>
            <button type="button" onClick={handleLogout} className="text-sm text-slate-400 hover:text-red-400">Logout</button>
          </div>
        </header>
        <main className="flex-1 p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
