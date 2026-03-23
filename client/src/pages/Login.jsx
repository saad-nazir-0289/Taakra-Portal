import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth as authApi } from '../lib/api';

const DEMO = [
  { label: 'Admin', email: 'admin@taakra.dev', password: 'Admin@12345' },
  { label: 'Support', email: 'support@taakra.dev', password: 'Support@12345' },
  { label: 'User', email: 'user@taakra.dev', password: 'User@12345' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const [oauthConfig, setOauthConfig] = useState({ google: false, github: false });
  React.useEffect(() => {
    authApi.oauthConfig().then(setOauthConfig).catch(() => setOauthConfig({ google: false, github: false }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      login(data);
      navigate(userLanding(data.user));
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (d) => {
    setEmail(d.email);
    setPassword(d.password);
    setShowDemo(false);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-slate-100 mb-6">Log in</h1>
        <button
          type="button"
          className="text-sm text-sky-400 hover:underline mb-4"
          onClick={() => setShowDemo(true)}
        >
          Use demo credentials
        </button>
        {showDemo && (
          <div className="mb-4 p-3 rounded-lg bg-slate-800/80 border border-blue-800">
            <p className="text-xs text-slate-400 mb-2">Click to fill form:</p>
            {DEMO.map((d) => (
              <button
                key={d.label}
                type="button"
                className="block w-full text-left py-1 px-2 rounded hover:bg-slate-700 text-sm text-slate-200"
                onClick={() => fillDemo(d)}
              >
                {d.label}: {d.email} / {d.password}
              </button>
            ))}
            <button type="button" className="text-xs text-slate-400 mt-2" onClick={() => setShowDemo(false)}>Close</button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-blue-800 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-blue-800 rounded-lg"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {oauthConfig.google ? (
            <a href="/api/auth/google" className="btn-secondary text-sm flex items-center gap-2">
              Google
            </a>
          ) : (
            <span className="text-xs text-slate-400" title="OAuth not configured">Google</span>
          )}
          {oauthConfig.github ? (
            <a href="/api/auth/github" className="btn-secondary text-sm flex items-center gap-2">
              GitHub
            </a>
          ) : (
            <span className="text-xs text-slate-400" title="OAuth not configured">GitHub</span>
          )}
          {!oauthConfig.google && !oauthConfig.github && (
            <span className="text-xs text-slate-400" title="OAuth not configured">OAuth not configured</span>
          )}
        </div>
        <p className="mt-4 text-sm text-slate-400">
          No account? <Link to="/signup" className="text-sky-400 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

function userLanding(user) {
  if (user?.role === 'ADMIN') return '/admin/overview';
  if (user?.role === 'SUPPORT') return '/inbox';
  return '/dashboard';
}
