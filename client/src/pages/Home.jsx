import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Zap, Calendar } from 'lucide-react';

export default function Home() {
  const [videoError, setVideoError] = useState(false);
  const heroVideo = '/hero.mp4';

  return (
    <div>
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {!videoError ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src={heroVideo}
            onError={() => setVideoError(true)}
          />
        ) : null}
        <div className="absolute inset-0 " />
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-100 mb-4">
            Compete. Win. <span className="text-sky-400">Shine.</span>
          </h1>
          <p className="text-lg text-slate-300 mb-8">
            Join trending competitions, hit deadlines, and show the world what you've got.
          </p>
          <Link to="/competitions" className="btn-primary text-lg px-8 py-3 inline-block">
            Browse Competitions
          </Link>
        </div>
      </section>

      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-100 mb-8 text-center">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-sky-500/30 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 text-sky-400" />
            </div>
            <h3 className="font-semibold text-slate-100 mb-2">Browse & Register</h3>
            <p className="text-slate-400 text-sm">Pick a competition, read the rules, and register in one click.</p>
          </div>
          <div className="card p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-sky-500/30 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-sky-400" />
            </div>
            <h3 className="font-semibold text-slate-100 mb-2">Meet Deadlines</h3>
            <p className="text-slate-400 text-sm">Track your calendar and submit before the deadline.</p>
          </div>
          <div className="card p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-sky-500/30 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-sky-400" />
            </div>
            <h3 className="font-semibold text-slate-100 mb-2">Win & Shine</h3>
            <p className="text-slate-400 text-sm">Get approved, compete, and climb the leaderboard.</p>
          </div>
        </div>
      </section>

      <TrendingPreview />
      <CategoryPreview />

      <section className="py-12 px-4 bg-blue-900/30 border-t border-blue-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold text-slate-100 mb-2">Ready to compete?</h2>
          <p className="text-slate-400 mb-4">Create an account and register for your first competition.</p>
          <Link to="/signup" className="btn-primary">Get started</Link>
        </div>
      </section>
    </div>
  );
}

function TrendingPreview() {
  const [list, setList] = React.useState([]);
  React.useEffect(() => {
    fetch('/api/competitions/trending', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setList(d.competitions || []))
      .catch(() => setList([]));
  }, []);
  if (list.length === 0) return null;
  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-100 mb-6">Trending now</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.slice(0, 6).map((c) => (
          <Link key={c._id} to={`/competitions/${c._id}`} className="card p-4 block hover:border-sky-500/60 transition">
            <h3 className="font-semibold text-slate-100">{c.title}</h3>
            <p className="text-sm text-slate-400">{c.categoryId?.name} · {c.registrationsCount} registrations</p>
          </Link>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link to="/competitions?sort=trending" className="btn-secondary">View all</Link>
      </div>
    </section>
  );
}

function CategoryPreview() {
  const [list, setList] = React.useState([]);
  React.useEffect(() => {
    fetch('/api/competitions/categories', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setList(d.categories || []))
      .catch(() => setList([]));
  }, []);
  if (list.length === 0) return null;
  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-100 mb-6">Categories</h2>
      <div className="flex flex-wrap gap-3">
        {list.map((cat) => (
          <Link
            key={cat._id}
            to={`/competitions?categoryId=${cat._id}`}
            className="px-4 py-2 rounded-lg bg-slate-800/80 border border-blue-800 hover:border-sky-500 hover:bg-sky-500/20 text-slate-200 transition"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
