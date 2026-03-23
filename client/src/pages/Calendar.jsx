import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { users as api } from '../lib/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';

export default function Calendar() {
  const [current, setCurrent] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.calendar(current.getMonth() + 1, current.getFullYear()).then((d) => setEvents(d.events || [])).catch(() => setEvents([]));
  }, [current.getMonth(), current.getFullYear()]);

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const padStart = monthStart.getDay();

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-100 mb-4">Calendar</h1>
      <div className="flex items-center gap-4 mb-4">
        <button type="button" onClick={() => setCurrent(subMonths(current, 1))} className="btn-secondary text-sm">Prev</button>
        <span className="font-medium">{format(current, 'MMMM yyyy')}</span>
        <button type="button" onClick={() => setCurrent(addMonths(current, 1))} className="btn-secondary text-sm">Next</button>
      </div>
      <div className="card overflow-hidden">
        <div className="grid grid-cols-7 text-center text-sm font-medium text-slate-400 border-b border-blue-800">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="p-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: padStart }, (_, i) => <div key={`pad-${i}`} className="min-h-[80px] border-b border-r border-blue-800" />)}
          {days.map((day) => {
            const dayEvents = events.filter((e) => e.end && isSameMonth(new Date(e.end), current) && format(new Date(e.end), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
            return (
              <div key={day.toISOString()} className={`min-h-[80px] border-b border-r border-blue-800 p-1 ${!isSameMonth(day, current) ? 'bg-slate-800/50' : ''}`}>
                <span className={`text-sm ${isToday(day) ? 'font-bold text-sky-400' : 'text-slate-400'}`}>{format(day, 'd')}</span>
                <div className="mt-1 space-y-0.5">
                  {dayEvents.map((ev) => (
                    <Link key={ev.id} to={`/competitions/${ev.id}`} className="block text-xs truncate rounded bg-sky-500/30 text-sky-300 px-1" title={ev.title}>
                      {ev.title}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-6">
        <h2 className="font-medium text-slate-100 mb-2">Upcoming deadlines</h2>
        <ul className="space-y-2">
          {events.slice(0, 10).map((ev) => (
            <li key={ev.id}>
              <Link to={`/competitions/${ev.id}`} className="text-sky-400 hover:underline">{ev.title}</Link>
              <span className="text-slate-400 text-sm ml-2">— {format(new Date(ev.end), 'MMM d, yyyy')}</span>
            </li>
          ))}
          {events.length === 0 && <li className="text-slate-400">No upcoming deadlines</li>}
        </ul>
      </div>
    </div>
  );
}
