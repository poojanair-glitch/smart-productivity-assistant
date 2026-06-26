'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
  User, Shield, Key, Database, Cpu, Sparkles, CheckCircle2, 
  XCircle, Terminal, HelpCircle, Save, Info 
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  // Profiles
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Integrations state
  const [isDbCloud, setIsDbCloud] = useState(false);
  const [isAiConnected, setIsAiConnected] = useState(false);
  const [isCheckingConfig, setIsCheckingConfig] = useState(true);

  // Fetch real profile details
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setFullName(profile.full_name || '');
          setAvatarUrl(profile.avatar_url || '');
        } else {
          setFullName(user.user_metadata?.full_name || 'Smart User');
          setAvatarUrl(user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop');
        }
      }
    };
    fetchProfile();
  }, []);

  // Check backend config availability
  const checkConfig = async () => {
    try {
      const res = await fetch('/api/config-status');
      const data = await res.json();
      setIsDbCloud(data.isSupabaseConfigured);
      setIsAiConnected(data.isGeminiConfigured);
    } catch (e) {
      console.error('Failed to check integration status:', e);
    } finally {
      setIsCheckingConfig(false);
    }
  };

  useEffect(() => {
    checkConfig();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('You must be logged in to update your profile.');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        });

      if (error) {
        alert('Error updating profile: ' + error.message);
      } else {
        alert('Profile configurations updated successfully!');
        router.refresh();
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Modify profile preferences, examine system logs, and inspect API connection states.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Nav list left */}
        <div className="space-y-1.5 md:col-span-1">
          <button className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-[#6D5DFC]/10 to-[#8B5CF6]/5 text-[#6D5DFC] dark:text-[#A78BFA] font-bold text-xs flex items-center gap-2.5 border-l-2 border-[#6D5DFC]">
            <User className="w-4 h-4" />
            Profile Profile
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-2.5 transition-all">
            <Database className="w-4 h-4" />
            Cloud Database
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-2.5 transition-all">
            <Key className="w-4 h-4" />
            Gemini AI Settings
          </button>
        </div>

        {/* Content pane right */}
        <div className="md:col-span-2 space-y-6">
          
          {/* PROFILE FORM */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800">
              Personal Information
            </h3>

            <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
              <div className="flex items-center gap-4">
                <img 
                  src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'} 
                  alt="Avatar" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#6D5DFC] shadow-md shadow-[#6D5DFC]/10" 
                />
                {/* Hide the input box as requested by user */}
                <div className="space-y-1 flex-1 hidden">
                  <label className="font-semibold text-slate-400">Avatar Image URL</label>
                  <input 
                    type="text" 
                    value={avatarUrl} 
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    disabled={isSavingProfile}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-[#6D5DFC] focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-400">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isSavingProfile}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-[#6D5DFC] focus:outline-none disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-400">Email Address (Read-only)</label>
                <input 
                  type="email" 
                  required
                  disabled
                  value={email} 
                  className="w-full p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none opacity-60 cursor-not-allowed"
                />
              </div>

              <button 
                type="submit"
                disabled={isSavingProfile}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#6D5DFC] to-[#8B5CF6] text-white hover:opacity-95 text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#6D5DFC]/10 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSavingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* CLOUD INTEGRATIONS STATUS */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 shadow-sm space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800">
              Integrations Connection Status
            </h3>

            <div className="space-y-4">
              {/* Database status */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/40">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-[#6D5DFC]" />
                  <div>
                    <h4 className="text-xs font-bold">Supabase PostgreSQL</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {isDbCloud ? 'Connected to cloud cluster' : 'Running on local SQLite/JSON fallback'}
                    </p>
                  </div>
                </div>
                {isDbCloud ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 text-[10px] font-bold uppercase tracking-wider">Active</span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/25 text-[10px] font-bold uppercase tracking-wider">Local Fallback</span>
                )}
              </div>

              {/* Gemini AI status */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/40">
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-rose-500" />
                  <div>
                    <h4 className="text-xs font-bold">Google Gemini API</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {isAiConnected ? 'Connected to gemini-1.5-flash' : 'Running on offline regex parsing mode'}
                    </p>
                  </div>
                </div>
                {isAiConnected ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 text-[10px] font-bold uppercase tracking-wider">Active</span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/25 text-[10px] font-bold uppercase tracking-wider">Local Mode</span>
                )}
              </div>
            </div>



          </div>

        </div>
      </div>

    </div>
  );
}
