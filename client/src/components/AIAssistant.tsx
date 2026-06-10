import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Sparkles, Zap, ChartPie, AlertCircle } from 'lucide-react';

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages] = useState([
    { role: 'assistant', content: "Hello! I'm your Life Admin AI. How can I help you optimize your life today?", type: 'text' },
    { role: 'assistant', content: "Quick Insight: Your subscription costs increased by 18% this month due to Adobe Creative Cloud.", type: 'insight' },
  ]);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-96 max-h-[600px] flex flex-col glass border border-primary/20 shadow-2xl rounded-3xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary to-primary-dark text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm italic uppercase tracking-tighter">Life Admin AI</h4>
                  <p className="text-[8px] opacity-70 font-black uppercase italic tracking-widest leading-none">Online & Ready</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[400px] custom-scrollbar bg-slate-50/50 dark:bg-secondary/50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                    ? 'bg-primary text-white ml-auto rounded-tr-none' 
                    : msg.type === 'insight'
                      ? 'bg-accent-amber/10 border border-accent-amber/20 text-slate-700 dark:text-slate-200 rounded-tl-none'
                      : 'bg-white dark:bg-secondary-light shadow-sm text-slate-700 dark:text-slate-200 rounded-tl-none border border-white/5'
                  }`}>
                    {msg.type === 'insight' && <Zap className="w-3.5 h-3.5 text-accent-amber mb-1" />}
                    <p className={msg.type === 'insight' ? 'italic font-medium' : ''}>{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Suggestions */}
            <div className="p-3 flex gap-2 overflow-x-auto border-t border-white/5 bg-white/30 dark:bg-secondary/30 no-scrollbar">
              {[
                { label: 'Summarize Expenses', icon: ChartPie },
                { label: 'Bill Risks', icon: AlertCircle },
                { label: 'Cost Savings', icon: Zap },
              ].map((s, i) => (
                <button key={i} className="flex items-center gap-2 whitespace-nowrap bg-white dark:bg-secondary px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase italic text-slate-500 hover:border-primary hover:text-primary transition-all">
                  <s.icon className="w-3 h-3" />
                  {s.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-secondary border-t border-white/5">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Ask me anything..." 
                  className="w-full bg-slate-100 dark:bg-secondary-light border-none rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-primary-light text-white shadow-2xl flex items-center justify-center relative group"
      >
        {isOpen ? <X className="w-7 h-7" /> : <MessageSquare className="w-7 h-7" />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-red rounded-full border-2 border-white dark:border-secondary flex items-center justify-center text-[8px] font-bold">
            2
          </div>
        )}
      </motion.button>
    </div>
  );
};
