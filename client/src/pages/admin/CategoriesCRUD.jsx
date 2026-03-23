import React, { useState, useEffect } from 'react';
import { admin as api } from '../../lib/api';

export default function AdminCategories() {
  const [list, setList] = useState([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.categories().then((d) => setList(d.categories || [])).catch(() => setList([])).finally(() => setLoading(false));
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.createCategory({ name, slug: slug || name.toLowerCase().replace(/\s+/g, '-') });
      const d = await api.categories();
      setList(d.categories || []);
      setName('');
      setSlug('');
    } catch (err) {
      alert(err.message);
    }
  };

  const update = async (e) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await api.updateCategory(editing._id, { name: editing.name, slug: editing.slug });
      const d = await api.categories();
      setList(d.categories || []);
      setEditing(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.deleteCategory(id);
      setList((l) => l.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-100 mb-4">Categories</h1>
      <div className="card p-4 mb-6">
        <form onSubmit={create} className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="block text-xs text-slate-400">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-xs text-slate-400">Slug</label>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="px-3 py-2 border rounded-lg" placeholder="auto" />
          </div>
          <button type="submit" className="btn-primary">Add</button>
        </form>
      </div>
      {loading ? <p className="text-slate-400">Loading...</p> : (
        <ul className="space-y-2">
          {list.map((c) => (
            <li key={c._id} className="card p-4 flex items-center justify-between">
              {editing?._id === c._id ? (
                <form onSubmit={update} className="flex gap-2 flex-1">
                  <input type="text" value={editing.name} onChange={(e) => setEditing((x) => ({ ...x, name: e.target.value }))} className="px-2 py-1 border rounded" />
                  <input type="text" value={editing.slug} onChange={(e) => setEditing((x) => ({ ...x, slug: e.target.value }))} className="px-2 py-1 border rounded" />
                  <button type="submit" className="btn-primary text-sm">Save</button>
                  <button type="button" onClick={() => setEditing(null)} className="btn-secondary text-sm">Cancel</button>
                </form>
              ) : (
                <>
                  <span>{c.name} <code className="text-slate-400 text-sm">{c.slug}</code></span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setEditing(c)} className="btn-secondary text-sm">Edit</button>
                    <button type="button" onClick={() => remove(c._id)} className="text-red-600 text-sm">Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
