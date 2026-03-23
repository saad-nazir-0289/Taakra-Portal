import React, { useState, useEffect, useRef } from 'react';
import { chat as chatApi } from '../lib/api';
import { useSocket } from '../context/SocketContext';

export default function SupportChat() {
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const bottomRef = useRef(null);

  useEffect(() => {
    chatApi.myThread().then((d) => {
      setThread(d.thread);
      if (d.thread) loadMessages(d.thread._id);
    }).catch(() => setThread(null)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!thread || !socket) return;
    const onMsg = (msg) => {
      if (msg.threadId?.toString() === thread._id) setMessages((m) => [...m, msg]);
    };
    socket.on('chat:message', onMsg);
    return () => socket.off('chat:message', onMsg);
  }, [thread, socket]);

  const loadMessages = (threadId) => {
    chatApi.messages(threadId).then((d) => setMessages(d.messages || []));
    chatApi.markRead(threadId).catch(() => {});
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const ensureThread = async () => {
    if (thread) return thread._id;
    const d = await chatApi.createThread();
    setThread(d.thread);
    return d.thread._id;
  };

  const send = async () => {
    if (!text.trim()) return;
    const tid = await ensureThread();
    if (socket) {
      socket.emit('chat:message', { threadId: tid, text: text.trim() });
      setText('');
      return;
    }
    try {
      const d = await chatApi.send(tid, text.trim());
      setMessages((m) => [...m, d.message]);
      setText('');
    } catch {}
  };

  if (loading) return <p className="text-slate-400">Loading...</p>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl">
      <h1 className="text-xl font-bold text-slate-100 mb-4">Support chat</h1>
      <div className="card flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.length === 0 && <p className="text-slate-400 text-sm">Start the conversation. We'll respond soon.</p>}
          {messages.map((m) => (
            <div key={m._id} className={`flex ${m.senderRole === 'USER' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 ${m.senderRole === 'USER' ? 'bg-sky-500 text-slate-900' : 'bg-slate-700 text-slate-100'}`}>
                <p className="text-sm">{m.text}</p>
                <p className="text-xs opacity-75 mt-1">{new Date(m.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="p-4 border-t border-blue-800 flex gap-2">
          <input type="text" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Type a message..." className="flex-1 px-3 py-2 border border-blue-800 rounded-lg" />
          <button type="button" onClick={send} className="btn-primary">Send</button>
        </div>
      </div>
    </div>
  );
}
