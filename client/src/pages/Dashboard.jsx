import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { users as api } from '../lib/api';

export default function Dashboard() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.myRegistrations().then((d) => setRegistrations(d.registrations || [])).catch(() => setRegistrations([])).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-100 mb-4">My registrations</h1>
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : registrations.length === 0 ? (
        <div className="card p-6 text-center text-slate-400">
          <p>You haven't registered for any competition yet.</p>
          <Link to="/competitions" className="btn-primary mt-4 inline-block">Browse competitions</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {registrations.map((r) => (
            <div key={r._id} className="card p-4 flex items-center justify-between flex-wrap gap-2">
              <div>
                <Link to={`/competitions/${r.competitionId?._id}`} className="font-medium text-sky-400 hover:underline">
                  {r.competitionId?.title}
                </Link>
                <p className="text-sm text-slate-400">Registered {new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-2 py-1 rounded text-sm ${r.status === 'approved' ? 'bg-green-100 text-green-800' : r.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
