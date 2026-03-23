import React, { useState, useEffect } from 'react';
import { admin as api } from '../../lib/api';

export default function AdminCompetitions() {
  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', rules: '', prizes: '', categoryId: '', deadlineStart: '', deadlineEnd: '' });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.categories().then((d) => setCategories(d.categories || [])).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    api.competitions().then((d) => setList(d.competitions || [])).catch(() => setList([])).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.updateCompetition(editing._id, { ...form, categoryId: form.categoryId || editing.categoryId?._id });
      } else {
        await api.createCompetition(form);
      }
      const d = await api.competitions();
      setList(d.competitions || []);
      setForm({ title: '', description: '', rules: '', prizes: '', categoryId: '', deadlineStart: '', deadlineEnd: '' });
      setEditing(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this competition?')) return;
    try {
      await api.deleteCompetition(id);
      setList((l) => l.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const toDate = (d) => (d ? new Date(d).toISOString().slice(0, 16) : '');

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-100 mb-4">Competitions</h1>
      <div className="card p-4 mb-6">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="grid sm:grid-cols-2 gap-2">
            <input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="px-3 py-2 border rounded-lg" required />
            <select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} className="px-3 py-2 border rounded-lg" required>
              <option value="">Category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" rows={2} />
          <div className="grid sm:grid-cols-2 gap-2">
            <input type="datetime-local" placeholder="Start" value={form.deadlineStart} onChange={(e) => setForm((f) => ({ ...f, deadlineStart: e.target.value }))} className="px-3 py-2 border rounded-lg" required />
            <input type="datetime-local" placeholder="End" value={form.deadlineEnd} onChange={(e) => setForm((f) => ({ ...f, deadlineEnd: e.target.value }))} className="px-3 py-2 border rounded-lg" required />
          </div>
          <textarea placeholder="Rules" value={form.rules} onChange={(e) => setForm((f) => ({ ...f, rules: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" rows={1} />
          <textarea placeholder="Prizes" value={form.prizes} onChange={(e) => setForm((f) => ({ ...f, prizes: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" rows={1} />
          <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm({ title: '', description: '', rules: '', prizes: '', categoryId: '', deadlineStart: '', deadlineEnd: '' }); }} className="btn-secondary ml-2">Cancel</button>}
        </form>
      </div>
      {loading ? <p className="text-slate-400">Loading...</p> : (
        <ul className="space-y-2">
          {list.map((c) => (
            <li key={c._id} className="card p-4 flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-sm text-slate-400">{c.categoryId?.name} · {c.registrationsCount} reg.</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setEditing(c); setForm({ title: c.title, description: c.description || '', rules: c.rules || '', prizes: c.prizes || '', categoryId: c.categoryId?._id || '', deadlineStart: toDate(c.deadlines?.start), deadlineEnd: toDate(c.deadlines?.end) }); }} className="btn-secondary text-sm">Edit</button>
                <button type="button" onClick={() => remove(c._id)} className="text-red-600 text-sm">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
