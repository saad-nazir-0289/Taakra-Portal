import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth as authApi } from '../lib/api';

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthConfig, setOauthConfig] = useState({ google: false, github: false });

  React.useEffect(() => {
    authApi.oauthConfig().then(setOauthConfig).catch(() => setOauthConfig({ google: false, github: false }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.signup({ name, email, password });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-slate-100 mb-6">Sign up</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-blue-800 rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-blue-800 rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password (min 6)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-blue-800 rounded-lg" minLength={6} required />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {oauthConfig.google ? <a href="/api/auth/google" className="btn-secondary text-sm">Google</a> : <span className="text-xs text-slate-500" title="OAuth not configured">Google</span>}
          {oauthConfig.github ? <a href="/api/auth/github" className="btn-secondary text-sm">GitHub</a> : <span className="text-xs text-slate-500" title="OAuth not configured">GitHub</span>}
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Already have an account? <Link to="/login" className="text-sky-400 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
