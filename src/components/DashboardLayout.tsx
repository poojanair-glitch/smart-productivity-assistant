'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, CheckSquare, FileText, Bell, Calendar, 
  BarChart3, Settings, Search, Mic, MicOff, Sun, Moon, 
  Send, Sparkles, Cpu, User, Menu, X, Plus, Clock, MessageSquare,
  AlertCircle, CheckCircle2, ChevronRight, LogOut, Home, Tag, ChevronDown,
  Edit2
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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);
  
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



  const supabase = createClient();

  // User details
  const [userProfile, setUserProfile] = useState<UserProfile>({
    full_name: 'Smart User',
    email: 'user@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const handleSaveName = async () => {
    const trimmed = tempName.trim();
    if (!trimmed || trimmed === userProfile.full_name) {
      setIsEditingName(false);
      return;
    }

    // Optimistically update the UI profile
    setUserProfile((prev) => ({ ...prev, full_name: trimmed }));
    setIsEditingName(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        triggerToast('Error', 'You must be logged in to update your profile.', 'error');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: trimmed,
          avatar_url: userProfile.avatar_url,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to save profile name:', error.message);
        triggerToast('Error', 'Failed to update username: ' + error.message, 'error');
      } else {
        triggerToast('Success', 'Username updated successfully!', 'success');
        router.refresh();
      }
    } catch (err: any) {
      console.error('Failed to save profile name:', err);
      triggerToast('Error', 'An unexpected error occurred.', 'error');
    }
  };

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

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const handleLogout = async () => {
    setConfirmModal({
      show: true,
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of your account?',
      onConfirm: async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
      }
    });
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

  // Listen for global toasts and confirmations from other components
  useEffect(() => {
    const handleShowToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; message: string; type: 'success' | 'info' | 'error' }>;
      if (customEvent.detail) {
        const { title, message, type } = customEvent.detail;
        triggerToast(title, message, type);
      }
    };

    const handleShowConfirm = (e: Event) => {
      const customEvent = e as CustomEvent<{
        title: string;
        message: string;
        onConfirm: () => void;
      }>;
      if (customEvent.detail) {
        const { title, message, onConfirm } = customEvent.detail;
        setConfirmModal({
          show: true,
          title,
          message,
          onConfirm: () => {
            onConfirm();
            setConfirmModal(prev => ({ ...prev, show: false }));
          }
        });
      }
    };

    window.addEventListener('show-toast', handleShowToast);
    window.addEventListener('show-confirm', handleShowConfirm);
    return () => {
      window.removeEventListener('show-toast', handleShowToast);
      window.removeEventListener('show-confirm', handleShowConfirm);
    };
  }, []);

  // Sync theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
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



  // Nav configuration
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'To-Do', path: '/todos', icon: CheckSquare },
    { name: 'Notes', path: '/notes', icon: FileText },
    { name: 'Reminders', path: '/reminders', icon: Bell },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Tags', path: '/tasks', icon: Tag },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F5F3FF] dark:bg-[#0B0F19] text-[#111827] dark:text-[#F8FAFC] bg-grid-pattern relative overflow-x-hidden font-sans">

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

      {/* GLOBAL CONFIRMATION MODAL */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <h3 className="text-base font-bold text-slate-850 dark:text-white mb-2">{confirmModal.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{confirmModal.message}</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE HEADER BAR */}
      <div className="md:hidden w-full bg-[#14172B] text-white p-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-[#6D5DFC]" />
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-[#A78BFA] bg-clip-text text-transparent">Smart Productivity</span>
        </div>
        <button 
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} 
          className="p-1 rounded-lg bg-slate-800 text-slate-200 focus:outline-none"
        >
          {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE SIDEBAR BACKDROP */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR (Dark Premium Sidebar) */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 bg-[#14172B] text-[#E2E8F0] flex flex-col justify-between border-r border-[#1E2235]/40 transition-all duration-300 ease-in-out
        w-64 ${isSidebarOpen ? 'md:w-64' : 'md:w-20'}
        p-6 ${isSidebarOpen ? 'md:p-6' : 'md:p-3'}
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        md:relative
      `}>
        {/* Top Branding Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 rounded-xl bg-[#6D5DFC] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#6D5DFC]/20">
                <CheckSquare className="w-5 h-5" />
              </div>
              {(isSidebarOpen || isMobileSidebarOpen) && (
                <div className="flex flex-col text-left">
                  <span className="font-extrabold text-sm tracking-tight text-white leading-none">
                    Smart Productivity
                  </span>
                  <span className="text-[10px] text-white/50 font-medium">
                    Assistant
                  </span>
                </div>
              )}
            </div>
            {/* Collapse button on Desktop */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:block p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
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
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? 'bg-[#6D5DFC] text-white font-semibold shadow-md shadow-[#6D5DFC]/20' 
                      : 'hover:bg-white/5 text-white/80 hover:text-white'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-[#6B7280] group-hover:text-white'}`} />
                  {(isSidebarOpen || isMobileSidebarOpen) && <span className="text-sm">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Panel Section */}
        <div className="space-y-4">
          {/* AI Assistant Promo Widget */}
          {(isSidebarOpen || isMobileSidebarOpen) && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#6D5DFC] to-[#8B5CF6] text-white shadow-lg relative overflow-hidden mb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">AI Assistant</span>
                  <p className="text-[10px] text-white/90 leading-tight max-w-[110px]">
                    Ask anything or capture quickly!
                  </p>
                </div>
                <img 
                  src="/ai_robot_avatar.png" 
                  alt="AI Assistant" 
                  className="w-12 h-12 object-contain shrink-0 filter drop-shadow-md"
                />
              </div>
              <button 
                onClick={() => {
                  window.dispatchEvent(new Event('open-gemini-chat'));
                  setIsMobileSidebarOpen(false);
                }}
                className="w-full py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold shadow-sm transition-all"
              >
                New Chat
              </button>
            </div>
          )}

          {/* User Profile Footer */}
          <div className={`flex ${(isSidebarOpen || isMobileSidebarOpen) ? 'items-center justify-between' : 'flex-col items-center gap-2'} pt-4 border-t border-[#1E2235]/65 overflow-hidden`}>
            <div className={`flex items-center ${(isSidebarOpen || isMobileSidebarOpen) ? 'gap-3' : 'gap-0'} min-w-0 w-full`}>
              <img 
                src={userProfile.avatar_url} 
                alt={userProfile.full_name} 
                className="w-10 h-10 rounded-full border-2 border-white/20 object-cover shrink-0" 
              />
              {(isSidebarOpen || isMobileSidebarOpen) && (
                <div className="flex-1 min-w-0 text-left">
                  {isEditingName ? (
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') setIsEditingName(false);
                      }}
                      onBlur={handleSaveName}
                      className="text-xs font-bold text-white bg-white/10 px-1.5 py-0.5 rounded border border-white/20 focus:outline-none focus:ring-1 focus:ring-[#6D5DFC] w-full"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-1.5 group max-w-full">
                      <h4 
                        className="text-xs font-bold text-white truncate cursor-pointer hover:text-white/80"
                        onClick={() => {
                          setTempName(userProfile.full_name);
                          setIsEditingName(true);
                        }}
                      >
                        {userProfile.full_name}
                      </h4>
                      <button
                        onClick={() => {
                          setTempName(userProfile.full_name);
                          setIsEditingName(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-white transition-opacity p-0.5 shrink-0"
                        title="Edit Username"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-white/50 truncate">{userProfile.email}</p>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                onClick={handleLogout}
                className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all shrink-0"
                title="Log Out"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* TOP HEADER */}
        <header className="sticky top-0 z-20 glass-panel border-b border-[#E5E7EB] dark:border-slate-800/80 px-6 py-4 flex items-center justify-between gap-4">
          {/* Greeting */}
          <div className="hidden sm:block text-left">
            <h2 className="text-xl font-bold flex items-center gap-1.5 text-[#111827] dark:text-slate-100">
              Welcome to your focus zone, {userProfile.full_name.split(' ')[0]}! 
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-1">What would you like to accomplish today?</p>
          </div>

          {/* Global Search Bar */}
          <div className="relative flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value) setIsSearchOpen(true);
                }}
                className="w-full pl-10 pr-14 py-2.5 rounded-2xl bg-[#FFFFFF] dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-850 focus:outline-none focus:ring-2 focus:ring-[#6D5DFC]/20 focus:border-[#6D5DFC] text-sm text-[#111827] dark:text-white transition-all shadow-sm placeholder:text-[#6B7280]/60"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery ? (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="hidden md:inline-block text-[9px] font-bold text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50">⌘K</span>
                )}
              </div>
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
          <div className="flex items-center gap-3">
            {/* Voice Input Button */}
            <button 
              onClick={startVoiceInput}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                isRecording 
                  ? 'bg-rose-500 text-white animate-pulse' 
                  : 'bg-[#6D5DFC] text-white shadow-md shadow-[#6D5DFC]/20 hover:scale-105 active:scale-95'
              }`}
              title="Voice Input (Capture Task/Note/Reminder)"
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="w-11 h-11 rounded-full flex items-center justify-center border border-[#E5E7EB] dark:border-slate-850 bg-white dark:bg-slate-900 text-[#6B7280] hover:text-[#6D5DFC] transition-all hover:scale-105 active:scale-95"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-11 h-11 rounded-full flex items-center justify-center border border-[#E5E7EB] dark:border-slate-850 bg-white dark:bg-slate-900 text-[#6B7280] hover:text-[#6D5DFC] relative transition-all hover:scale-105 active:scale-95"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-rose-500" />
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
        <main className="flex-1 p-4 sm:p-6 z-10">
          {speechStatus && (
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#6D5DFC]/10 to-[#8B5CF6]/5 border border-[#6D5DFC]/25 flex items-center gap-3 animate-pulse">
              <Sparkles className="w-5 h-5 text-[#6D5DFC]" />
              <span className="text-sm font-semibold">{speechStatus}</span>
            </div>
          )}
          {children}
        </main>
      </div>



    </div>
  );
}
