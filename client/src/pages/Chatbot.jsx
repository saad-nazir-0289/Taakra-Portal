import React, { useState, useRef, useEffect } from 'react';
import { chatbot as api } from '../lib/api';

export default function Chatbot() {
  const [messages, setMessages] = useState([{ role: 'bot', text: "Hi! I can help with upcoming deadlines, how to register, and trending competitions. What do you need?" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const d = await api.send(userMsg);
      setMessages((m) => [...m, { role: 'bot', text: d.reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'bot', text: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl">
      <h1 className="text-xl font-bold text-slate-100 mb-4">AI Chatbot</h1>
      <div className="card flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg px-3 py-2 ${m.role === 'user' ? 'bg-sky-500 text-slate-900' : 'bg-slate-700 text-slate-100'}`}>
                <p className="text-sm whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          ))}
          {loading && <p className="text-slate-400 text-sm">Thinking...</p>}
          <div ref={bottomRef} />
        </div>
        <div className="p-4 border-t border-blue-800 flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Ask about deadlines, registration, trending..." className="flex-1 px-3 py-2 border border-blue-800 rounded-lg" />
          <button type="button" onClick={send} className="btn-primary" disabled={loading}>Send</button>
        </div>
      </div>
    </div>
  );
}
