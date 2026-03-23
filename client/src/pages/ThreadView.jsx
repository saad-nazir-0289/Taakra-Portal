import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { chat as api } from '../lib/api';
import { useSocket } from '../context/SocketContext';

export default function ThreadView() {
  const { threadId } = useParams();
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const bottomRef = useRef(null);

  useEffect(() => {
    api.threads().then((d) => {
      const t = (d.threads || []).find((x) => x._id === threadId);
      setThread(t || null);
    }).catch(() => setThread(null));
  }, [threadId]);

  useEffect(() => {
    if (!threadId) return;
    api.messages(threadId).then((d) => setMessages(d.messages || [])).catch(() => setMessages([]));
    api.markRead(threadId).catch(() => {});
  }, [threadId]);

  useEffect(() => {
    if (!socket) return;
    const onMsg = (msg) => {
      if (msg.threadId?.toString() === threadId) setMessages((m) => [...m, msg]);
    };
    socket.on('chat:message', onMsg);
    return () => socket.off('chat:message', onMsg);
  }, [socket, threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!text.trim()) return;
    if (socket) {
      socket.emit('chat:message', { threadId, text: text.trim() });
      setText('');
      return;
    }
    api.send(threadId, text.trim()).then((d) => setMessages((m) => [...m, d.message])).catch(() => {});
    setText('');
  };

  useEffect(() => setLoading(false), [threadId]);

  if (loading) return <p className="text-slate-400">Loading...</p>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl">
      <Link to="/inbox" className="text-sm text-sky-400 hover:underline mb-2">← Inbox</Link>
      <h1 className="text-xl font-bold text-slate-100 mb-4">{thread?.userId?.name || thread?.userId?.email || 'Thread'}</h1>
      <div className="card flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((m) => (
            <div key={m._id} className={`flex ${m.senderRole === 'USER' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 ${m.senderRole === 'USER' ? 'bg-slate-700 text-slate-100' : 'bg-sky-500 text-slate-900'}`}>
                <p className="text-sm">{m.text}</p>
                <p className="text-xs opacity-75 mt-1">{new Date(m.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="p-4 border-t border-blue-800 flex gap-2">
          <input type="text" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Reply..." className="flex-1 px-3 py-2 border border-blue-800 rounded-lg" />
          <button type="button" onClick={send} className="btn-primary">Send</button>
        </div>
      </div>
    </div>
  );
}
