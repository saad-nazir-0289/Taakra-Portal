import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { admin as api } from '../../lib/api';

export default function AdminOverview() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.analytics().then(setData).catch(() => setData(null));
  }, []);

  if (!data) return <p className="text-slate-400">Loading...</p>;

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-100 mb-4">Admin overview</h1>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-slate-400 text-sm">Users</p>
          <p className="text-2xl font-bold text-sky-400">{data.userCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-slate-400 text-sm">Competitions</p>
          <p className="text-2xl font-bold text-sky-400">{data.competitionCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-slate-400 text-sm">Registrations</p>
          <p className="text-2xl font-bold text-sky-400">{data.registrationCount}</p>
        </div>
      </div>
      <h2 className="font-medium text-slate-100 mb-2">Top 5 by registrations</h2>
      <div className="card overflow-hidden">
        <ul className="divide-y divide-blue-800">
          {(data.topCompetitions || []).map((c) => (
            <li key={c._id} className="p-4 flex justify-between">
              <Link to={`/competitions/${c._id}`} className="text-sky-400 hover:underline">{c.title}</Link>
              <span className="text-slate-400">{c.registrationsCount} registrations</span>
            </li>
          ))}
          {(!data.topCompetitions || data.topCompetitions.length === 0) && <li className="p-4 text-slate-400">None yet</li>}
        </ul>
      </div>
    </div>
  );
}
