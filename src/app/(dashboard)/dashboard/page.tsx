'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, Mic, FileText, Upload, Calendar, ArrowRight,
  CheckSquare, Clock, CheckCircle2, ChevronRight,
  TrendingUp, Trash2, Edit2, Play, AlertCircle, AlertTriangle, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

// Types
import { Task, Note, Reminder, AISummary } from '@/lib/db';

export default function Dashboard() {
  const router = useRouter();

  // Data states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [weeklyReport, setWeeklyReport] = useState<AISummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Capture Box states
  const [captureInput, setCaptureInput] = useState('');
  const [isProcessingInput, setIsProcessingInput] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper placeholder rotation
  const placeholders = [
    "Remind me to call Alex tomorrow at 10 AM",
    "Add a note about AWS deployment strategy",
    "Create a task to finish DSA revision by Friday",
    "Buy groceries tonight",
    "Reminder: Team sync meeting on Friday at 3 PM"
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [tRes, nRes, rRes, sRes] = await Promise.all([
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/notes').then(r => r.json()),
        fetch('/api/reminders').then(r => r.json()),
        fetch('/api/gemini/weekly-report').then(r => r.json())
      ]);

      setTasks(tRes.tasks || []);
      setNotes(nRes.notes || []);
      setReminders(rRes.reminders || []);
      
      const summaries = sRes.summaries || [];
      if (summaries.length > 0) {
        setWeeklyReport(summaries[0]);
      } else {
        // Trigger first-time generation
        generateWeeklyReport();
      }
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Submit Text Capture
  const handleCaptureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captureInput.trim() || isProcessingInput) return;

    setIsProcessingInput(true);
    try {
      const res = await fetch('/api/gemini/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: captureInput })
      });
      const data = await res.json();
      if (data.success) {
        setCaptureInput('');
        fetchDashboardData();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to parse capture text');
    } finally {
      setIsProcessingInput(false);
    }
  };

  // Trigger file-based task extraction
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('Uploading & analyzing file...');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/gemini/summarize', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        setUploadStatus('');
        alert(`Successfully analyzed "${file.name}"! Created 1 Note and auto-generated ${data.tasks?.length || 0} Tasks.`);
        fetchDashboardData();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error(err);
      setUploadStatus('');
      alert(err.message || 'Error processing file upload');
    }
  };

  // Complete task
  const toggleTaskCompletion = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await fetch(`/api/tasks?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  // Weekly Report Generation
  const generateWeeklyReport = async () => {
    setIsProcessingInput(true);
    try {
      const res = await fetch('/api/gemini/weekly-report', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.summary) {
        setWeeklyReport(data.summary);
      }
    } catch (e) {
      console.error('Error generating report:', e);
    } finally {
      setIsProcessingInput(false);
    }
  };

  // Stats computation
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const pendingTodosCount = tasks.filter(t => t.category === 'Todo' && t.status === 'pending').length;
  const totalTasksCount = tasks.length;
  const totalNotesCount = notes.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. HERO CAPTURE AREA */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#090D1F] border border-indigo-900/30 p-8 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#6D5DFC]/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#8B5CF6]/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[#A78BFA] text-xs font-semibold tracking-wide uppercase mb-4 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            Natural Language Processing Active
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Capture anything...
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-2 mb-6">
            Type, speak, or upload to add tasks, notes, reminders and more.
          </p>

          <form onSubmit={handleCaptureSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                rows={2}
                value={captureInput}
                onChange={(e) => setCaptureInput(e.target.value)}
                placeholder={placeholders[placeholderIndex]}
                className="w-full bg-[#131B2E] border border-slate-800 text-white rounded-2xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#6D5DFC] focus:border-transparent text-sm md:text-base transition-all placeholder-slate-500"
              />
              <button 
                type="submit"
                disabled={isProcessingInput || !captureInput.trim()}
                className="absolute right-3.5 bottom-3.5 p-2 rounded-xl bg-gradient-to-r from-[#6D5DFC] to-[#8B5CF6] text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2.5">
                {/* Voice Record */}
                <button
                  type="button"
                  onClick={() => {
                    const btn = document.querySelector('[title="Voice Input (Capture Task/Note/Reminder)"]') as HTMLButtonElement;
                    if (btn) btn.click();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 hover:text-white text-xs font-medium flex items-center gap-2 text-slate-300 transition-all"
                >
                  <Mic className="w-4 h-4 text-rose-500" />
                  Voice Input
                </button>

                {/* Quick Note creation mock */}
                <button
                  type="button"
                  onClick={() => {
                    setCaptureInput("Add a note about: ");
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 hover:text-white text-xs font-medium flex items-center gap-2 text-slate-300 transition-all"
                >
                  <FileText className="w-4 h-4 text-[#A78BFA]" />
                  Quick Note
                </button>

                {/* File Upload parser */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.pdf,.docx" 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 hover:text-white text-xs font-medium flex items-center gap-2 text-slate-300 transition-all"
                >
                  <Upload className="w-4 h-4 text-emerald-400" />
                  Upload File
                </button>
              </div>

              {uploadStatus && (
                <span className="text-xs text-amber-400 animate-pulse font-medium">{uploadStatus}</span>
              )}
              {isProcessingInput && (
                <span className="text-xs text-[#A78BFA] animate-pulse font-medium">Gemini processing...</span>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* 2. STATISTICS CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Tasks */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 shadow-sm flex items-center justify-between glow-hover relative overflow-hidden"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Total Tasks</span>
            <h3 className="text-2xl font-black">{totalTasksCount}</h3>
          </div>
          <div className="p-3.5 rounded-xl bg-[#6D5DFC]/10 text-[#6D5DFC]">
            <TrendingUp className="w-5 h-5" />
          </div>
          {/* Sparkline chart SVG */}
          <div className="absolute bottom-0 left-0 right-0 h-1">
            <svg viewBox="0 0 100 10" className="w-full h-full stroke-[#6D5DFC] fill-none opacity-20 stroke-[2.5]">
              <path d="M 0 5 Q 20 8, 40 2 T 60 7, 80 4 T 100 8" />
            </svg>
          </div>
        </motion.div>

        {/* Pending To-Dos */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 shadow-sm flex items-center justify-between glow-hover relative overflow-hidden"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Pending To-Dos</span>
            <h3 className="text-2xl font-black text-amber-500">{pendingTodosCount}</h3>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-500">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1">
            <svg viewBox="0 0 100 10" className="w-full h-full stroke-amber-500 fill-none opacity-20 stroke-[2.5]">
              <path d="M 0 8 Q 20 2, 40 5 T 60 1, 80 8 T 100 4" />
            </svg>
          </div>
        </motion.div>

        {/* Notes Count */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 shadow-sm flex items-center justify-between glow-hover relative overflow-hidden"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Notes Count</span>
            <h3 className="text-2xl font-black text-[#A78BFA]">{totalNotesCount}</h3>
          </div>
          <div className="p-3.5 rounded-xl bg-[#A78BFA]/10 text-[#A78BFA]">
            <FileText className="w-5 h-5" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1">
            <svg viewBox="0 0 100 10" className="w-full h-full stroke-[#A78BFA] fill-none opacity-20 stroke-[2.5]">
              <path d="M 0 3 Q 20 6, 40 1 T 60 9, 80 5 T 100 2" />
            </svg>
          </div>
        </motion.div>

        {/* Completed Tasks */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 shadow-sm flex items-center justify-between glow-hover relative overflow-hidden"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Completed Tasks</span>
            <h3 className="text-2xl font-black text-emerald-500">{completedTasksCount}</h3>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1">
            <svg viewBox="0 0 100 10" className="w-full h-full stroke-emerald-500 fill-none opacity-20 stroke-[2.5]">
              <path d="M 0 9 Q 20 7, 40 9 T 60 2, 80 3 T 100 1" />
            </svg>
          </div>
        </motion.div>
      </section>

      {/* 3. MIDDLE SECTOR (Weekly summary & Reminders & Notes) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* WEEKLY REPORT WIDGET */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#6D5DFC]" />
                <h3 className="font-bold text-sm uppercase tracking-wider">AI Weekly Productivity Report</h3>
              </div>
              <button 
                onClick={generateWeeklyReport}
                disabled={isProcessingInput}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-200 transition-colors"
                title="Regenerate report"
              >
                <RefreshCw className={`w-4 h-4 ${isProcessingInput ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {weeklyReport ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                {/* Score badge */}
                <div className="md:col-span-1 flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-[#6D5DFC]/10 to-[#8B5CF6]/5 border border-[#6D5DFC]/15">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Productivity Score</span>
                  <div className="text-4xl font-extrabold text-[#6D5DFC] dark:text-[#A78BFA] mt-1.5 mb-1 select-none">
                    {weeklyReport.productivity_score}
                  </div>
                  <span className="text-[9px] text-emerald-500 font-semibold flex items-center gap-0.5">
                    +12% vs last week
                  </span>
                </div>
                {/* Score summary text */}
                <div className="md:col-span-3 text-xs leading-relaxed text-slate-500 dark:text-slate-300">
                  <p>{weeklyReport.summary_text}</p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Weekly report analysis is preparing...
              </div>
            )}
          </div>
          
          <div className="mt-6 flex items-center gap-3 py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[10px] text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Updates dynamically based on tasks completion. Last update: Just now.</span>
          </div>
        </div>

        {/* REMINDERS LIST WIDGET */}
        <div className="rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Upcoming Reminders</h3>
              </div>
              <Link href="/reminders" className="text-xs text-[#6D5DFC] hover:underline flex items-center">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {reminders.filter(r => r.status === 'active').slice(0, 3).length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No upcoming reminders set.</div>
            ) : (
              <div className="space-y-3">
                {reminders.filter(r => r.status === 'active').slice(0, 3).map(rem => (
                  <div key={rem.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/40 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold truncate">{rem.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(rem.remind_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at{' '}
                        {new Date(rem.remind_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. RECENT TASKS & RECENT NOTES */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RECENT TASKS */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Active Tasks</h3>
            </div>
            <Link href="/tasks" className="text-xs text-[#6D5DFC] hover:underline flex items-center">
              Manage Tasks <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {tasks.filter(t => t.status !== 'completed').slice(0, 4).length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">All tasks completed! Congratulations.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {tasks.filter(t => t.status !== 'completed').slice(0, 4).map(task => (
                <div key={task.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleTaskCompletion(task.id, task.status)}
                      className="w-4 h-4 rounded border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:border-[#6D5DFC]"
                    />
                    <div>
                      <h4 className="text-xs font-semibold">{task.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Due: {task.due_date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Category Badge */}
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {task.category}
                    </span>

                    {/* Priority Badge */}
                    <span className={`
                      text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider
                      ${task.priority === 'high' ? 'bg-rose-500/10 text-rose-500' : ''}
                      ${task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : ''}
                      ${task.priority === 'low' ? 'bg-emerald-500/10 text-emerald-500' : ''}
                    `}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT NOTES WIDGET */}
        <div className="rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#A78BFA]" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Recent Notes</h3>
            </div>
            <Link href="/notes" className="text-xs text-[#6D5DFC] hover:underline flex items-center">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {notes.slice(0, 3).length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No notes saved.</div>
          ) : (
            <div className="space-y-3">
              {notes.slice(0, 3).map(note => (
                <Link 
                  href="/notes" 
                  key={note.id} 
                  className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/40 hover:border-[#6D5DFC]/20 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold truncate flex-1 mr-2">{note.title}</h4>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#A78BFA]/10 text-[#A78BFA] font-medium shrink-0">
                      {note.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {note.ai_summary || note.content}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

      </section>

    </div>
  );
}
