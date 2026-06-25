'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Bell, BellRing, Check, RefreshCw, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
import { Reminder } from '@/lib/db';

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Reminder Form State
  const [title, setTitle] = useState('');
  const [remindDate, setRemindDate] = useState('');
  const [remindTime, setRemindTime] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Fetch reminders
  const fetchReminders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/reminders');
      const data = await res.json();
      setReminders(data.reminders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  // Save new reminder
  const handleSaveReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !remindDate || !remindTime) return;

    // Combine date & time into ISO string
    const remindAt = new Date(`${remindDate}T${remindTime}`).toISOString();

    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          remind_at: remindAt,
          status: 'active'
        })
      });

      if (res.ok) {
        setTitle('');
        setRemindDate('');
        setRemindTime('');
        setIsAddOpen(false);
        fetchReminders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quick Dismiss reminder
  const dismissReminder = async (id: string) => {
    try {
      const res = await fetch(`/api/reminders?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dismissed' })
      });
      if (res.ok) fetchReminders();
    } catch (e) {
      console.error(e);
    }
  };

  // Quick Snooze (snoozes for 15 minutes)
  const snoozeReminder = async (reminder: Reminder) => {
    const newRemindAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    try {
      const res = await fetch(`/api/reminders?id=${reminder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          remind_at: newRemindAt,
          status: 'active' 
        })
      });
      if (res.ok) fetchReminders();
    } catch (e) {
      console.error(e);
    }
  };

  // Delete reminder
  const deleteReminder = async (id: string) => {
    try {
      const res = await fetch(`/api/reminders?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchReminders();
    } catch (e) {
      console.error(e);
    }
  };

  const activeReminders = reminders.filter(r => r.status === 'active');
  const dismissedReminders = reminders.filter(r => r.status === 'dismissed');

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Reminders Hub</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure automated system alerts and scheduling notifications.
          </p>
        </div>
        
        <button
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#6D5DFC] to-[#8B5CF6] text-white hover:opacity-90 transition-opacity font-semibold text-xs flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Reminder
        </button>
      </div>

      {/* Quick Creator Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-sm uppercase tracking-wide">Configure Alert</h3>
                <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">Close</button>
              </div>

              <form onSubmit={handleSaveReminder} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-400">Reminder Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Call Mom, Attend standup" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-[#6D5DFC] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400">Date</label>
                    <input 
                      type="date" 
                      required
                      value={remindDate}
                      onChange={(e) => setRemindDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-[#6D5DFC] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-400">Time</label>
                    <input 
                      type="time" 
                      required
                      value={remindTime}
                      onChange={(e) => setRemindTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-[#6D5DFC] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#6D5DFC] to-[#8B5CF6] text-white hover:opacity-95 font-semibold transition-all shadow-md"
                >
                  Enable Reminder
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Grid of reminders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ACTIVE REMINDERS PANEL */}
        <div className="rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 pb-3 border-b border-slate-100 dark:border-slate-800">
            Active Alerts ({activeReminders.length})
          </h3>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading alerts...</div>
          ) : activeReminders.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No pending alerts. Voice-transcribe or create one above!
            </div>
          ) : (
            <div className="space-y-3">
              {activeReminders.map(rem => (
                <div 
                  key={rem.id} 
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/40 flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 animate-pulse">
                      <BellRing className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-white">{rem.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#6D5DFC]" />
                        {new Date(rem.remind_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at{' '}
                        {new Date(rem.remind_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => dismissReminder(rem.id)}
                      className="py-1 px-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 hover:bg-emerald-500 hover:text-white transition-all text-[10px] font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Dismiss
                    </button>
                    <button 
                      onClick={() => snoozeReminder(rem)}
                      className="py-1 px-2.5 rounded-lg bg-slate-200/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-700 hover:text-white transition-all text-[10px] font-semibold"
                    >
                      Snooze 15m
                    </button>
                    <button 
                      onClick={() => deleteReminder(rem.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DISMISSED REMINDERS PANEL */}
        <div className="rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800">
            Past/Dismissed Alerts ({dismissedReminders.length})
          </h3>

          {dismissedReminders.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No past alerts to show.</div>
          ) : (
            <div className="space-y-3 opacity-60">
              {dismissedReminders.map(rem => (
                <div 
                  key={rem.id} 
                  className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/10 border border-slate-100/50 dark:border-slate-800/20 flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-slate-200/50 dark:bg-slate-800/40 text-slate-400">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 line-through truncate max-w-[150px]">{rem.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Dismissed
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => deleteReminder(rem.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
