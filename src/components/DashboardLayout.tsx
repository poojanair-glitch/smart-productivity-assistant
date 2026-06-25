'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, CheckSquare, FileText, Bell, Calendar, 
  BarChart3, Settings, Search, Mic, MicOff, Sun, Moon, 
  Send, Sparkles, Cpu, User, Menu, X, Plus, Clock, MessageSquare,
  AlertCircle, CheckCircle2, ChevronRight, LogOut
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface UserProfile {
  full_name: string;
  email: string;
  avatar_url: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Theme & Navigation States
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Notification states
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; description: string; type: string }>>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Global Search states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ tasks: any[]; notes: any[]; reminders: any[] }>({ tasks: [], notes: [], reminders: [] });
  const [isSearching, setIsSearching] = useState(false);

  // Voice capturing state
  const [isRecording, setIsRecording] = useState(false);
  const [speechStatus, setSpeechStatus] = useState('');

  // Floating Chatbot States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; parts: string }>>([
    { role: 'model', parts: 'Hi! I am your Smart AI Assistant. I can check your tasks, retrieve notes, create reminders, or answer productivity questions. Ask me anything!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const supabase = createClient();

  // User details
  const [userProfile, setUserProfile] = useState<UserProfile>({
    full_name: 'Smart User',
    email: 'user@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
  });

  // Fetch real notifications/reminders
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/reminders');
      const data = await res.json();
      const activeReminders = (data.reminders || []).filter((r: any) => r.status === 'active');
      
      const mappedNotifications = activeReminders.map((r: any) => ({
        id: r.id,
        title: r.title,
        description: `Scheduled: ${new Date(r.remind_at).toLocaleDateString()} at ${new Date(r.remind_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        type: 'reminder'
      }));

      setNotifications(mappedNotifications);
      setNotificationCount(mappedNotifications.length);
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await Promise.all(
        notifications.map((n) =>
          fetch(`/api/reminders?id=${n.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'dismissed' }),
          })
        )
      );
      setNotifications([]);
      setNotificationCount(0);
      triggerToast('Notifications Cleared', 'All alerts have been dismissed.', 'success');
    } catch (e) {
      console.error(e);
    }
  };

  // Sync profile details
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch profiles metadata
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setUserProfile({
          full_name: profile?.full_name || user.user_metadata?.full_name || 'Smart User',
          email: user.email || '',
          avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
        });

        // Load active notifications
        fetchNotifications();
      }
    };

    fetchUser();

    // Listen to changes in authentication states
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUserProfile({
          full_name: profile?.full_name || session.user.user_metadata?.full_name || 'Smart User',
          email: session.user.email || '',
          avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
        });

        fetchNotifications();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    }
  };

  // Global Toast Notification State
  const [toast, setToast] = useState<{ show: boolean; title: string; message: string; type: 'success' | 'info' | 'error' }>({
    show: false,
    title: '',
    message: '',
    type: 'success'
  });

  // Trigger toast notification
  const triggerToast = (title: string, message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ show: true, title, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5500);
  };

  // Sync theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme as 'light' | 'dark');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Web Speech recognition function
  const startVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      triggerToast(
        'Speech Support Error',
        'Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.',
        'error'
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      setSpeechStatus('Listening...');
      triggerToast('Voice Capture Active', 'Speak clearly into your microphone...', 'info');
    };

    recognition.onerror = (e: any) => {
      console.error(e);
      setIsRecording(false);
      setSpeechStatus('Error capturing audio');
      triggerToast('Audio Capture Failed', 'Could not record voice. Check microphone permissions.', 'error');
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSpeechStatus(`Captured: "${transcript}"`);
      triggerToast('Text Transcribed', `Processing: "${transcript}"`, 'info');
      await submitNLIParsing(transcript);
    };

    recognition.start();
  };

  // Submit parsed voice/text item
  const submitNLIParsing = async (text: string) => {
    setSpeechStatus('Processing with Gemini...');
    try {
      const res = await fetch('/api/gemini/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      
      if (data.success) {
        setSpeechStatus('');
        triggerToast(
          'AI Capture Successful',
          `Automatically created a ${data.parsed.type}: "${data.parsed.title}"`,
          'success'
        );
        // Refresh server components to pull in new DB item
        router.refresh();
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      console.error(e);
      setSpeechStatus('');
      triggerToast('AI Capture Failed', e.message || 'Error parsing capture input', 'error');
    }
  };

  // Global Semantic Search implementation
  useEffect(() => {
    if (!querySearchDebounce) return;
    const timer = setTimeout(() => {
      performSearch(querySearchDebounce);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [querySearchDebounce, setQuerySearchDebounce] = useState('');
  useEffect(() => {
    setQuerySearchDebounce(searchQuery);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults({ tasks: [], notes: [], reminders: [] });
      return;
    }
    setIsSearching(true);
    try {
      // Execute local search filters
      const [tRes, nRes, rRes] = await Promise.all([
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/notes').then(r => r.json()),
        fetch('/api/reminders').then(r => r.json())
      ]);

      const tasks = (tRes.tasks || []).filter((t: any) => 
        t.title.toLowerCase().includes(query.toLowerCase()) || 
        t.description.toLowerCase().includes(query.toLowerCase()) ||
        t.category.toLowerCase().includes(query.toLowerCase())
      );
      
      const notes = (nRes.notes || []).filter((n: any) => 
        n.title.toLowerCase().includes(query.toLowerCase()) || 
        n.content.toLowerCase().includes(query.toLowerCase()) ||
        n.category.toLowerCase().includes(query.toLowerCase())
      );

      const reminders = (rRes.reminders || []).filter((r: any) => 
        r.title.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults({ tasks, notes, reminders });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  // AI Chat Bot request handler
  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', parts: userMsg }]);
    setIsChatLoading(true);

    try {
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
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      setChatMessages(prev => [...prev, { role: 'model', parts: `Failed to connect to Gemini: ${e.message || 'Unknown network error.'}` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Nav configuration
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', path: '/tasks', icon: ChevronRight }, // We'll structure these nicely
    { name: 'To-Do', path: '/todos', icon: CheckSquare },
    { name: 'Notes', path: '/notes', icon: FileText },
    { name: 'Reminders', path: '/reminders', icon: Clock },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-[#F8FAFC] bg-grid-pattern relative overflow-x-hidden font-sans">
      
      {/* GLOBAL TOAST */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 p-4 rounded-xl shadow-2xl glass-panel border border-[#6D5DFC]/20 animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm">
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
          {toast.type === 'info' && <Sparkles className="w-5 h-5 text-[#6D5DFC] shrink-0" />}
          <div>
            <h4 className="font-semibold text-sm">{toast.title}</h4>
            <p className="text-xs text-[#6D5DFC] dark:text-[#A78BFA] mt-0.5">{toast.message}</p>
          </div>
        </div>
      )}

      {/* MOBILE HEADER BAR */}
      <div className="md:hidden w-full bg-[#0F172A] text-white p-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          <Cpu className="w-6 h-6 text-[#A78BFA]" />
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">Smart Productivity</span>
        </div>
        <button 
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} 
          className="p-1 rounded-lg bg-slate-800 text-slate-200"
        >
          {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* LEFT SIDEBAR (Dark Gradient Sidebar) */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-[#0F172A] to-[#090D1A] text-slate-300 p-6 flex flex-col justify-between border-r border-[#1E293B] transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20 md:p-3'}
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:relative
      `}>
        {/* Top Branding Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#6D5DFC] to-[#8B5CF6] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#6D5DFC]/20">
                <Cpu className="w-5 h-5" />
              </div>
              {isSidebarOpen && (
                <span className="font-bold text-lg tracking-tight text-white bg-gradient-to-r from-white to-[#A78BFA] bg-clip-text text-transparent">
                  Smart Productivity
                </span>
              )}
            </div>
            {/* Collapse button on Desktop */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:block p-1 rounded-lg hover:bg-[#1E293B] text-slate-400 hover:text-white"
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#6D5DFC]/20 to-[#8B5CF6]/10 text-white font-medium border-l-2 border-[#6D5DFC]' 
                      : 'hover:bg-slate-800/50 hover:text-slate-100'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#6D5DFC]' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  {isSidebarOpen && <span className="text-sm">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Panel Section */}
        <div className="space-y-4">
          {/* AI Assistant Promo Widget */}
          {isSidebarOpen && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#6D5DFC]/10 to-[#8B5CF6]/5 border border-[#6D5DFC]/20 shadow-inner">
              <div className="flex items-center gap-2 text-white mb-2">
                <Sparkles className="w-4 h-4 text-[#A78BFA]" />
                <span className="text-xs font-semibold uppercase tracking-wider">AI Assistant</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                Need high priority updates or weekly analysis? Chat directly with Gemini.
              </p>
              <button 
                onClick={() => setIsChatOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#6D5DFC] to-[#8B5CF6] hover:from-[#5C4EEB] hover:to-[#7C4BEA] text-white text-xs font-medium shadow-md shadow-[#6D5DFC]/20 transition-all flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Ask Assistant
              </button>
            </div>
          )}

          {/* User Profile Footer */}
          <div className={`flex ${isSidebarOpen ? 'items-center justify-between' : 'flex-col items-center gap-2'} pt-4 border-t border-[#1E293B] overflow-hidden`}>
            <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : 'gap-0'} min-w-0`}>
              <img 
                src={userProfile.avatar_url} 
                alt={userProfile.full_name} 
                className="w-10 h-10 rounded-full border border-slate-700 object-cover shrink-0" 
              />
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{userProfile.full_name}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{userProfile.email}</p>
                </div>
              )}
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-all shrink-0"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* TOP HEADER */}
        <header className="sticky top-0 z-20 glass-panel border-b border-slate-200 dark:border-slate-800/80 px-6 py-4 flex items-center justify-between gap-4">
          {/* Greeting */}
          <div className="hidden sm:block">
            <h2 className="text-lg font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
              Good Morning, {userProfile.full_name.split(' ')[0]} 👋
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">What would you like to accomplish today?</p>
          </div>

          {/* Global Search Bar */}
          <div className="relative flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Global Search tasks, notes, reminders..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value) setIsSearchOpen(true);
                }}
                className="w-full pl-10 pr-10 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6D5DFC] focus:border-transparent text-sm transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Global Search Results Overlay */}
            {isSearchOpen && searchQuery.trim() !== '' && (
              <div className="absolute top-full left-0 right-0 mt-2 p-4 rounded-2xl glass-panel shadow-2xl border border-slate-200 dark:border-slate-800/80 max-h-96 overflow-y-auto z-50">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold uppercase text-[#6D5DFC] tracking-wider">Search Results</span>
                  <button onClick={() => setIsSearchOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>
                </div>
                
                {isSearching ? (
                  <div className="py-8 text-center text-xs text-slate-400">Searching items...</div>
                ) : (
                  <div className="space-y-4">
                    {/* Tasks match */}
                    {searchResults.tasks.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tasks</h4>
                        <div className="space-y-1.5">
                          {searchResults.tasks.map(t => (
                            <Link 
                              key={t.id} 
                              href="/tasks" 
                              onClick={() => setIsSearchOpen(false)}
                              className="block p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-left"
                            >
                              <div className="font-medium truncate">{t.title}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">Status: {t.status} | Priority: {t.priority}</div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes match */}
                    {searchResults.notes.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notes</h4>
                        <div className="space-y-1.5">
                          {searchResults.notes.map(n => (
                            <Link 
                              key={n.id} 
                              href="/notes" 
                              onClick={() => setIsSearchOpen(false)}
                              className="block p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-left"
                            >
                              <div className="font-medium truncate">{n.title}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">Category: {n.category}</div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reminders match */}
                    {searchResults.reminders.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reminders</h4>
                        <div className="space-y-1.5">
                          {searchResults.reminders.map(r => (
                            <Link 
                              key={r.id} 
                              href="/reminders" 
                              onClick={() => setIsSearchOpen(false)}
                              className="block p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-left"
                            >
                              <div className="font-medium truncate">{r.title}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">Time: {new Date(r.remind_at).toLocaleString()}</div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchResults.tasks.length === 0 && searchResults.notes.length === 0 && searchResults.reminders.length === 0 && (
                      <div className="py-8 text-center text-xs text-slate-400">No matching items found.</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2">
            {/* Voice Input Button */}
            <button 
              onClick={startVoiceInput}
              className={`p-2 rounded-xl border transition-all ${
                isRecording 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 animate-pulse' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-[#6D5DFC] hover:border-[#6D5DFC]/30'
              }`}
              title="Voice Input (Capture Task/Note/Reminder)"
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-[#6D5DFC]"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-[#6D5DFC] relative"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 p-4 rounded-2xl glass-panel shadow-2xl border border-slate-200 dark:border-slate-800 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Notifications</h4>
                    <button 
                      onClick={clearAllNotifications} 
                      className="text-[10px] text-[#6D5DFC] hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">No new alerts.</div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map(n => (
                        <div key={n.id} className="text-xs text-left">
                          <h5 className="font-semibold">{n.title}</h5>
                          <p className="text-[10px] text-slate-400">{n.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CHILD ROUTE CONTENTS */}
        <main className="flex-1 p-6 z-10">
          {speechStatus && (
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#6D5DFC]/10 to-[#8B5CF6]/5 border border-[#6D5DFC]/25 flex items-center gap-3 animate-pulse">
              <Sparkles className="w-5 h-5 text-[#6D5DFC]" />
              <span className="text-sm font-semibold">{speechStatus}</span>
            </div>
          )}
          {children}
        </main>
      </div>

      {/* FLOATING CHATBOT ASSISTANT (Powered by Gemini) */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
        {/* Chat Window */}
        {isChatOpen && (
          <div className="w-96 h-[500px] mb-4 rounded-3xl glass-panel shadow-2xl border border-[#6D5DFC]/20 flex flex-col justify-between overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-[#6D5DFC] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Gemini AI Assistant</h3>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online Context
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)} 
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Pane */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8FAFC]/50 dark:bg-[#0B0F19]/50">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed
                    ${msg.role === 'user' 
                      ? 'bg-gradient-to-br from-[#6D5DFC] to-[#8B5CF6] text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-tl-none text-slate-800 dark:text-slate-100 shadow-sm'
                    }
                  `}>
                    <p className="whitespace-pre-line">{msg.parts}</p>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6D5DFC] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6D5DFC] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6D5DFC] animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Ask about your high-priority tasks..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#6D5DFC]"
              />
              <button 
                onClick={sendChatMessage}
                disabled={isChatLoading || !chatInput.trim()}
                className="p-2 rounded-xl bg-gradient-to-r from-[#6D5DFC] to-[#8B5CF6] text-white hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Bubble Button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="p-4 rounded-full bg-gradient-to-br from-[#6D5DFC] to-[#8B5CF6] text-white shadow-2xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center relative group"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
          <span className="absolute right-full mr-3 py-1.5 px-3 rounded-xl bg-slate-900 text-white text-[10px] font-medium tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
            Chat with Gemini AI
          </span>
        </button>
      </div>

    </div>
  );
}
