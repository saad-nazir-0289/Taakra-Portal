import React, { useState, useEffect } from 'react';
import { admin as api } from '../../lib/api';

export default function AdminUsers() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.users().then((d) => setList(d.users || [])).catch(() => setList([])).finally(() => setLoading(false));
  }, []);

  const toggleBlock = async (user) => {
    try {
      await api.blockUser(user._id, !user.isBlocked);
      setList((l) => l.map((u) => (u._id === user._id ? { ...u, isBlocked: !u.isBlocked } : u)));
    } catch (err) {
      alert(err.message);
    }
  };

  const setRole = async (user, role) => {
    try {
      await api.setUserRole(user._id, role);
      setList((l) => l.map((u) => (u._id === user._id ? { ...u, role } : u)));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-100 mb-4">Users</h1>
      {loading ? <p className="text-slate-500">Loading...</p> : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800/80 text-left text-sm text-slate-300">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Blocked</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-800">
              {list.map((u) => (
                <tr key={u._id}>
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <select value={u.role} onChange={(e) => setRole(u, e.target.value)} className="text-sm border rounded px-2 py-1">
                      <option value="USER">USER</option>
                      <option value="SUPPORT">SUPPORT</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="p-3">{u.isBlocked ? 'Yes' : 'No'}</td>
                  <td className="p-3">
                    <button type="button" onClick={() => toggleBlock(u)} className={u.isBlocked ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
                      {u.isBlocked ? 'Unblock' : 'Block'}
                    </button>
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
