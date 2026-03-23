import React, { useState, useEffect } from 'react';
import { admin as api } from '../../lib/api';

export default function AdminRegistrations() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.registrations().then((d) => setList(d.registrations || [])).catch(() => setList([])).finally(() => setLoading(false));
  }, []);

  const setStatus = async (id, status) => {
    try {
      await api.updateRegistration(id, status);
      setList((l) => l.map((r) => (r._id === id ? { ...r, status } : r)));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-100 mb-4">Registrations</h1>
      {loading ? <p className="text-slate-500">Loading...</p> : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800/80 text-left text-sm text-slate-300">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Competition</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-800">
              {list.map((r) => (
                <tr key={r._id}>
                  <td className="p-3">{r.userId?.name} ({r.userId?.email})</td>
                  <td className="p-3">{r.competitionId?.title}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded text-sm ${r.status === 'approved' ? 'bg-green-100' : r.status === 'rejected' ? 'bg-red-100' : 'bg-amber-100'}`}>{r.status}</span></td>
                  <td className="p-3 text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    {r.status !== 'approved' && <button type="button" onClick={() => setStatus(r._id, 'approved')} className="text-green-600 text-sm mr-2">Approve</button>}
                    {r.status !== 'rejected' && <button type="button" onClick={() => setStatus(r._id, 'rejected')} className="text-red-600 text-sm">Reject</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <p className="p-4 text-slate-500">No registrations</p>}
        </div>
      )}
    </div>
  );
}
