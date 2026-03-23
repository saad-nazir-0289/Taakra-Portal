import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { chat as api } from '../lib/api';

export default function Inbox() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.threads().then((d) => setThreads(d.threads || [])).catch(() => setThreads([])).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-100 mb-4">Inbox</h1>
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : threads.length === 0 ? (
        <div className="card p-6 text-slate-400">No threads yet.</div>
      ) : (
        <div className="space-y-2">
          {threads.map((t) => (
            <Link key={t._id} to={`/inbox/${t._id}`} className="card p-4 block hover:border-sky-500/60 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-100">{t.userId?.name || t.userId?.email || 'User'}</p>
                <p className="text-sm text-slate-400 truncate max-w-md">{t.lastMessagePreview || 'No messages'}</p>
              </div>
              {t.unread > 0 && <span className="rounded-full bg-sky-500 text-slate-900 text-xs px-2 py-0.5">{t.unread}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
