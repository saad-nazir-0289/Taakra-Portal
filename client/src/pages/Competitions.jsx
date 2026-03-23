import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { competitions as api } from '../lib/api';

export default function Competitions() {
  const [searchParams] = useSearchParams();
  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState(searchParams.get('sort') || 'new');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [q, setQ] = useState(searchParams.get('q') || '');

  useEffect(() => {
    api.categories().then((d) => setCategories(d.categories || [])).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { sort };
    if (categoryId) params.categoryId = categoryId;
    if (q) params.q = q;
    api.list(params).then((d) => setList(d.competitions || [])).catch(() => setList([])).finally(() => setLoading(false));
  }, [sort, categoryId, q]);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Competitions</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-3 py-2 border border-blue-800 rounded-lg">
          <option value="new">New</option>
          <option value="registrations">Most Registrations</option>
          <option value="trending">Trending</option>
        </select>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="px-3 py-2 border border-blue-800 rounded-lg">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <input type="search" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} className="px-3 py-2 border border-blue-800 rounded-lg w-48" />
      </div>
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : list.length === 0 ? (
        <p className="text-slate-400">No competitions found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((c) => (
            <Link key={c._id} to={`/competitions/${c._id}`} className="card p-4 block hover:border-sky-500/60 transition">
              <h3 className="font-semibold text-slate-100">{c.title}</h3>
              <p className="text-sm text-slate-400 mt-1">{c.categoryId?.name}</p>
              <p className="text-xs text-slate-400 mt-2">{c.registrationsCount} registrations · Ends {new Date(c.deadlines?.end).toLocaleDateString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
