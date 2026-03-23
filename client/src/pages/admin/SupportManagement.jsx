import React, { useState, useEffect } from 'react';
import { admin as api } from '../../lib/api';

export default function AdminSupport() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.users().then((d) => setList(d.users || [])).catch(() => setList([])).finally(() => setLoading(false));
  }, []);

  const setRole = async (user, role) => {
    try {
      await api.setUserRole(user._id, role);
      setList((l) => l.map((u) => (u._id === user._id ? { ...u, role } : u)));
    } catch (err) {
      alert(err.message);
    }
  };

  const supportUsers = list.filter((u) => u.role === 'SUPPORT' || u.role === 'ADMIN');

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-100 mb-4">Support management</h1>
      <p className="text-slate-400 text-sm mb-4">Promote users to SUPPORT or demote to USER. Only ADMIN can change roles.</p>
      {loading ? <p className="text-slate-400">Loading...</p> : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800/80 text-left text-sm text-slate-300">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Set role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-800">
              {list.map((u) => (
                <tr key={u._id}>
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-sky-500/30 text-sky-300 text-sm">{u.role}</span></td>
                  <td className="p-3">
                    <select value={u.role} onChange={(e) => setRole(u, e.target.value)} className="text-sm border rounded px-2 py-1">
                      <option value="USER">USER</option>
                      <option value="SUPPORT">SUPPORT</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
