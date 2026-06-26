'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, X, Send } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function FloatingRobot() {
  const pathname = usePathname();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; parts: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const handleOpenChat = () => setIsChatOpen(true);
    window.addEventListener('open-gemini-chat', handleOpenChat);
    return () => {
      window.removeEventListener('open-gemini-chat', handleOpenChat);
    };
  }, []);

  // Load user session to customize greeting and behavior
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      
      // Initial message setting based on login status and current page
      let initialGreeting = 'Hi! I am your Smart AI Assistant. I can check your tasks, retrieve notes, create reminders, or answer productivity questions. Ask me anything!';
      
      if (!user) {
        if (pathname === '/login' || pathname === '/signup') {
          initialGreeting = "Welcome! Fill in your details to get started. Let me know if you need help with setting up your account!";
        } else {
          initialGreeting = "Hi! I am your AI Productivity Assistant. Explore our dashboard or click 'Get Started' to set up your personal workspace!";
        }
      }
      
      setChatMessages([
        { role: 'model', parts: initialGreeting }
      ]);
    };

    checkUser();
  }, [pathname]);

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', parts: userMsg }]);
    setIsChatLoading(true);

    try {
      if (!isLoggedIn) {
        // Fallback message for public/not logged in users
        setTimeout(() => {
          setChatMessages(prev => [...prev, { 
            role: 'model', 
            parts: "I'm currently running in guest mode. Please sign up or log in to connect me to your dashboard and let me manage your tasks, to-dos, and reminders!" 
          }]);
          setIsChatLoading(false);
        }, 800);
        return;
      }

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: chatMessages
        })
      });
      const data = await response.json();
      if (data.reply) {
        setChatMessages(prev => [...prev, { role: 'model', parts: data.reply }]);
      } else if (data.error === 'Unauthorized') {
        setIsLoggedIn(false);
        setChatMessages(prev => [...prev, { role: 'model', parts: 'Your session has expired. Please log in again to chat.' }]);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      setChatMessages(prev => [...prev, { role: 'model', parts: `Failed to connect to Gemini: ${e.message || 'Unknown network error.'}` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
      {/* Bobbing Floating Robot Trigger Button */}
      {!isChatOpen && (
        <div className="relative">
          {/* Tooltip speech bubble */}
          {showTooltip && (
            <div className="absolute bottom-full right-0 mb-4 p-3 rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 text-white text-[10px] font-semibold tracking-wide shadow-2xl border border-slate-800 max-w-[200px] text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="relative z-10">Hi! Click me to chat with your AI Assistant! 🚀</div>
              <div className="absolute top-full right-10 w-3 h-3 bg-slate-900/95 dark:bg-slate-950/95 border-r border-b border-slate-800 rotate-45 -mt-1.5" />
            </div>
          )}

          <button
            onClick={() => setIsChatOpen(true)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="w-24 h-24 rounded-full overflow-hidden hover:scale-105 active:scale-95 transition-all shadow-2xl border-2 border-[#8B5CF6]/50 bg-gradient-to-br from-[#1E1B4B]/80 to-[#0F172A]/80 cursor-pointer flex items-center justify-center animate-float-robot"
            style={{
              boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)'
            }}
          >
            <img 
              src="/robot.png" 
              alt="AI Robot Assistant" 
              className="w-full h-full object-cover scale-110 translate-y-0.5" 
            />
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isChatOpen && (
        <div className="w-[calc(100vw-3rem)] sm:w-96 h-[500px] mb-4 rounded-3xl glass-panel shadow-2xl border border-[#6D5DFC]/20 flex flex-col justify-between overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 bg-white/95 dark:bg-[#131B2E]/95">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#8B5CF6]/50 bg-slate-950 flex items-center justify-center shrink-0">
                <img src="/robot.png" alt="Robot" className="w-full h-full object-cover scale-110" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs tracking-wide">Gemini AI Robot Assistant</h3>
                <span className="text-[9px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isLoggedIn ? 'Online Sync' : 'Guest Mode'}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)} 
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Message Pane */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-gradient-to-br from-[#6D5DFC] to-[#8B5CF6] text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-tl-none text-slate-800 dark:text-slate-100'
                  }
                `}>
                  <p className="whitespace-pre-line">{msg.parts}</p>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-none px-4 py-2.5 text-[10px] text-slate-400 flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6D5DFC] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6D5DFC] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6D5DFC] animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-slate-150 dark:border-slate-800/80 bg-white dark:bg-[#131B2E] flex items-center gap-2">
            <input 
              type="text" 
              placeholder={isLoggedIn ? "Ask about your dashboard tasks..." : "Ask the AI assistant..."} 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#6D5DFC] text-slate-800 dark:text-slate-100"
            />
            <button 
              onClick={sendChatMessage}
              disabled={isChatLoading || !chatInput.trim()}
              className="p-2 rounded-xl bg-gradient-to-r from-[#6D5DFC] to-[#8B5CF6] text-white hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
