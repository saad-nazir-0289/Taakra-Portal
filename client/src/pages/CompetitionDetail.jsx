import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { competitions as api } from '../lib/api';

export default function CompetitionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [comp, setComp] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(id).then(setComp).catch(() => setComp(null));
    if (user) api.registration(id).then((d) => setRegistration(d.registration)).catch(() => setRegistration(null));
    else setRegistration(null);
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) return;
    setError('');
    setRegistering(true);
    try {
      await api.register(id);
      setRegistration({ status: 'pending' });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (!comp) return <div className="max-w-3xl mx-auto p-4">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link to="/competitions" className="text-sm text-sky-400 hover:underline mb-4 inline-block">← Back to competitions</Link>
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-slate-100">{comp.title}</h1>
        <p className="text-slate-400 mt-1">{comp.categoryId?.name}</p>
        <p className="text-slate-400 mt-4">{comp.description}</p>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-slate-300">Rules</h3>
            <p className="text-sm text-slate-400 whitespace-pre-wrap">{comp.rules || '—'}</p>
          </div>
          <div>
            <h3 className="font-medium text-slate-300">Prizes</h3>
            <p className="text-sm text-slate-400 whitespace-pre-wrap">{comp.prizes || '—'}</p>
          </div>
        </div>
        <div className="mt-4 text-sm text-slate-400">
          <strong>Deadlines:</strong> {new Date(comp.deadlines?.start).toLocaleDateString()} – {new Date(comp.deadlines?.end).toLocaleDateString()}
        </div>
        <div className="mt-4 text-sm text-slate-400">
          <strong>Registrations:</strong> {comp.registrationsCount}
        </div>
        {user && (
          <div className="mt-6">
            {registration ? (
              <p className="text-slate-400">Your status: <span className="font-medium">{registration.status}</span></p>
            ) : (
              <>
                {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
                <button type="button" onClick={handleRegister} className="btn-primary" disabled={registering}>
                  {registering ? 'Registering...' : 'Register'}
                </button>
              </>
            )}
          </div>
        )}
        {!user && (
          <p className="mt-6 text-slate-400">
            <Link to="/login" className="text-sky-400 hover:underline">Log in</Link> to register.
          </p>
        )}
      </div>
    </div>
  );
}
