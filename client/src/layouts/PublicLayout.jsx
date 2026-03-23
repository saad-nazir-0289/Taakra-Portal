import React from 'react';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-blue-900">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl text-sky-400">Taakra</Link>
          <nav className="flex items-center gap-4">
            <Link to="/competitions" className="text-slate-300 hover:text-sky-400">Competitions</Link>
            {user ? (
              <Link to="/dashboard" className="btn-primary text-sm">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="text-slate-300 hover:text-sky-400">Login</Link>
                <Link to="/signup" className="btn-primary text-sm">Sign up</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
