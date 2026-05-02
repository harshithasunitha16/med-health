import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { chatWithHealthu } from '../services/ai';
import Markdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const HealthuChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await chatWithHealthu(userMsg, history);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'model', text: error.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        id="healthu-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-110 active:scale-95"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">AI</span>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[calc(100%-3rem)] max-w-sm flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-100"
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-blue-600 p-4 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-bold leading-tight">Healthu AI</h3>
                <p className="text-[10px] opacity-80 uppercase tracking-widest">Medical Assistant</p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-center gap-2 bg-amber-50 p-3 text-[10px] text-amber-700">
              <AlertTriangle size={14} className="shrink-0" />
              AI assistant, not a doctor. Use for general info only.
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Bot size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-900">Healthu Assistant</p>
                    <p className="text-xs">Securely managing your medical history.<br/>How can I help you today?</p>
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[85%] rounded-[1.5rem] p-4 text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' 
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                  }`}>
                    <Markdown>{m.text}</Markdown>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-[1.5rem] bg-white px-4 py-3 shadow-sm border border-gray-100">
                    <div className="flex gap-1.5">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-blue-200" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:0.2s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 p-4 bg-white">
              <div className="flex gap-2">
                <input
                  id="healthu-input"
                  type="text"
                  placeholder="Type your question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 rounded-xl bg-gray-50 border border-gray-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  id="healthu-send"
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
