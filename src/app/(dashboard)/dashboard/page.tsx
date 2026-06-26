'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, Mic, FileText, Upload, Calendar, ArrowRight,
  CheckSquare, Clock, CheckCircle2, ChevronRight,
  TrendingUp, Trash2, Edit2, Play, AlertCircle, AlertTriangle, RefreshCw,
  ListTodo, MoreVertical, Plus, ChevronDown, Send, Bell, Check
} from 'lucide-react';

import { motion } from 'framer-motion';

// Types
import { Task, Note, Reminder, AISummary } from '@/lib/db';
import { showToast } from '@/utils/toast';

export default function Dashboard() {
  const router = useRouter();

  // Data states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [weeklyReport, setWeeklyReport] = useState<AISummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

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
      showToast('Capture Failed', err.message || 'Failed to parse capture text', 'error');
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
        showToast('Capture Successful', `Successfully analyzed "${file.name}"! Created 1 Note and auto-generated ${data.tasks?.length || 0} Tasks.`, 'success');
        fetchDashboardData();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error(err);
      setUploadStatus('');
      showToast('Upload Failed', err.message || 'Error processing file upload', 'error');
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
    <div className="space-y-6 animate-in fade-in duration-500 text-left relative pb-20">
      
      {/* Main Two-Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Main Dashboard Content (approx 72% / 9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* 1. HERO CAPTURE AREA */}
          <section className="relative overflow-hidden rounded-[28px] bg-white border border-[#F1F5F9] p-6 sm:p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Left Form Input */}
              <div className="md:col-span-7 space-y-4">
                <div className="space-y-1">
                  <h1 className="text-2xl font-black text-[#111827] tracking-tight">
                    Capture anything...
                  </h1>
                  <p className="text-[#6B7280] text-sm">
                    Type, speak, or upload to add tasks, notes, reminders and more.
                  </p>
                </div>

                <form onSubmit={handleCaptureSubmit} className="space-y-3">
                  <div className="relative bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-3 focus-within:ring-2 focus-within:ring-[#6D5DFC]/20 focus-within:border-[#6D5DFC] transition-all">
                    <textarea
                      rows={2}
                      value={captureInput}
                      onChange={(e) => setCaptureInput(e.target.value)}
                      placeholder={placeholders[placeholderIndex]}
                      className="w-full bg-transparent border-none text-[#111827] focus:outline-none text-sm placeholder-[#6B7280]/50 resize-none pr-10"
                    />
                    <div className="absolute right-3.5 bottom-3.5 flex items-center">
                      {isProcessingInput ? (
                        <RefreshCw className="w-4 h-4 text-[#6D5DFC] animate-spin" />
                      ) : (
                        <button 
                          type="submit"
                          disabled={!captureInput.trim()}
                          className="p-1.5 rounded-lg bg-[#6D5DFC] text-white hover:opacity-90 disabled:opacity-30 transition-opacity"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {/* Voice Record */}
                    <button
                      type="button"
                      onClick={() => {
                        const btn = document.querySelector('[title="Voice Input (Capture Task/Note/Reminder)"]') as HTMLButtonElement;
                        if (btn) btn.click();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#F0EEFF] hover:bg-[#E2DEFF] text-[#6D5DFC] text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-102"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      Voice Input
                    </button>

                    {/* Quick Note */}
                    <button
                      type="button"
                      onClick={() => setCaptureInput("Add a note about: ")}
                      className="px-3.5 py-2 rounded-xl bg-[#E8FDF0] hover:bg-[#D5FADF] text-[#22C55E] text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-102"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Quick Note
                    </button>

                    {/* File Upload */}
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
                      className="px-3.5 py-2 rounded-xl bg-[#EFF6FF] hover:bg-[#DCE9FF] text-[#3B82F6] text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-102"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload
                    </button>

                    {uploadStatus && (
                      <span className="text-xs text-[#F59E0B] animate-pulse font-medium ml-2">{uploadStatus}</span>
                    )}
                  </div>
                </form>
              </div>

              {/* Right Illustration */}
              <div className="md:col-span-5 flex justify-center relative">
                <div className="w-64 h-64 rounded-full bg-gradient-to-br from-[#6D5DFC]/10 to-[#8B5CF6]/5 blur-2xl absolute -z-10" />
                <motion.img 
                  src="/productivity_illustration.png" 
                  alt="Productivity Illustration"
                  className="w-full max-w-[240px] h-auto object-contain filter drop-shadow-lg"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

            </div>
          </section>

          {/* 2. STATISTICS CARDS */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Tasks */}
            <div className="bg-white border border-[#F1F5F9] rounded-[24px] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(15,23,42,0.1)] text-left">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-xl bg-[#F0EEFF] text-[#6D5DFC] flex items-center justify-center shrink-0">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-[#6B7280]">Tasks</span>
              </div>
              <div className="flex items-end justify-between mt-3">
                <div>
                  <h3 className="text-3xl font-extrabold text-[#111827]">{totalTasksCount}</h3>
                  <span className="text-[10px] text-[#6B7280] block mt-0.5">Total Tasks</span>
                </div>
                <div className="w-16 h-8 opacity-80 shrink-0">
                  <svg viewBox="0 0 100 30" className="w-full h-full stroke-[2.5] fill-none stroke-[#6D5DFC]">
                    <path d="M 0 15 Q 20 25, 40 5 T 60 20, 80 10 T 100 25" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Pending To-Dos */}
            <div className="bg-white border border-[#F1F5F9] rounded-[24px] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(15,23,42,0.1)] text-left">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-xl bg-[#E8FDF0] text-[#22C55E] flex items-center justify-center shrink-0">
                  <ListTodo className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-[#6B7280]">To-Do</span>
              </div>
              <div className="flex items-end justify-between mt-3">
                <div>
                  <h3 className="text-3xl font-extrabold text-[#111827]">{pendingTodosCount}</h3>
                  <span className="text-[10px] text-[#6B7280] block mt-0.5">Pending Items</span>
                </div>
                <div className="w-16 h-8 opacity-80 shrink-0">
                  <svg viewBox="0 0 100 30" className="w-full h-full stroke-[2.5] fill-none stroke-[#22C55E]">
                    <path d="M 0 25 Q 20 5, 40 15 T 60 5, 80 25 T 100 10" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Notes Count */}
            <div className="bg-white border border-[#F1F5F9] rounded-[24px] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(15,23,42,0.1)] text-left">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-xl bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-[#6B7280]">Notes</span>
              </div>
              <div className="flex items-end justify-between mt-3">
                <div>
                  <h3 className="text-3xl font-extrabold text-[#111827]">{totalNotesCount}</h3>
                  <span className="text-[10px] text-[#6B7280] block mt-0.5">Total Notes</span>
                </div>
                <div className="w-16 h-8 opacity-80 shrink-0">
                  <svg viewBox="0 0 100 30" className="w-full h-full stroke-[2.5] fill-none stroke-[#F59E0B]">
                    <path d="M 0 10 Q 20 20, 40 5 T 60 25, 80 15 T 100 5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Completed */}
            <div className="bg-white border border-[#F1F5F9] rounded-[24px] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(15,23,42,0.1)] text-left">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-xl bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-[#6B7280]">Completed</span>
              </div>
              <div className="flex items-end justify-between mt-3">
                <div>
                  <h3 className="text-3xl font-extrabold text-[#111827]">{completedTasksCount}</h3>
                  <span className="text-[10px] text-[#6B7280] block mt-0.5">Tasks Done</span>
                </div>
                <div className="w-16 h-8 opacity-80 shrink-0">
                  <svg viewBox="0 0 100 30" className="w-full h-full stroke-[2.5] fill-none stroke-[#3B82F6]">
                    <path d="M 0 25 Q 20 20, 40 25 T 60 5, 80 10 T 100 5" />
                  </svg>
                </div>
              </div>
            </div>

          </section>

          {/* 3. TASK TABLE SECTION */}
          <section className="bg-white border border-[#F1F5F9] rounded-[28px] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-slate-100 gap-4">
              <div className="space-y-0.5">
                <h2 className="text-base font-extrabold text-[#111827] uppercase tracking-wider">My Tasks</h2>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#6B7280] bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-2.5 py-1.5">
                  <span>Sort by:</span>
                  <span className="text-[#111827] flex items-center gap-0.5 cursor-pointer">
                    Due Date <ChevronDown className="w-3 h-3" />
                  </span>
                </div>
                <Link href="/tasks">
                  <button className="px-4 py-2 bg-[#6D5DFC] hover:bg-[#5C4EEB] text-white text-xs font-bold rounded-xl shadow-md shadow-[#6D5DFC]/20 transition-all hover:scale-102 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    New Task
                  </button>
                </Link>
              </div>
            </div>

            {/* Tabs Row */}
            <div className="flex items-center gap-6 border-b border-slate-100 mb-4 overflow-x-auto pb-1 scrollbar-none">
              {[
                { label: 'All', id: 'all' },
                { label: 'Pending', id: 'pending' },
                { label: 'In Progress', id: 'in_progress' },
                { label: 'Completed', id: 'completed' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`text-xs font-semibold pb-3 transition-colors relative whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'text-[#6D5DFC]' 
                      : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6D5DFC] rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Task Rows List */}
            {isLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading tasks...</div>
            ) : tasks.filter(t => {
              if (activeTab === 'all') return true;
              if (activeTab === 'pending') return t.status === 'pending';
              if (activeTab === 'in_progress') return t.status === 'in_progress';
              if (activeTab === 'completed') return t.status === 'completed';
              return true;
            }).length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No tasks in this category.</div>
            ) : (
              <div className="space-y-1">
                {tasks.filter(t => {
                  if (activeTab === 'all') return true;
                  if (activeTab === 'pending') return t.status === 'pending';
                  if (activeTab === 'in_progress') return t.status === 'in_progress';
                  if (activeTab === 'completed') return t.status === 'completed';
                  return true;
                }).map((task) => {
                  // Category color mapping helper
                  let catColor = 'bg-[#F0EEFF] text-[#6D5DFC]';
                  if (task.category === 'Work') catColor = 'bg-[#EFF6FF] text-[#3B82F6]';
                  else if (task.category === 'Personal') catColor = 'bg-[#E8FDF0] text-[#22C55E]';
                  else if (task.category === 'Placement' || task.category === 'Study') catColor = 'bg-[#FFF0F6] text-[#D81B60]';

                  return (
                    <div 
                      key={task.id} 
                      className="py-3 px-2 flex items-center justify-between gap-4 border-b border-slate-100/50 hover:bg-[#F8FAFC]/60 rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox button */}
                        <button 
                          onClick={() => toggleTaskCompletion(task.id, task.status)}
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            task.status === 'completed' 
                              ? 'bg-[#6D5DFC] border-[#6D5DFC] text-white shadow-sm shadow-[#6D5DFC]/20' 
                              : 'border-slate-300 hover:border-[#6D5DFC] bg-white'
                          }`}
                        >
                          {task.status === 'completed' && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                        </button>
                        <span className={`text-xs font-semibold truncate ${
                          task.status === 'completed' ? 'line-through text-slate-400' : 'text-[#111827]'
                        }`}>
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Category badge */}
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${catColor}`}>
                          {task.category}
                        </span>

                        {/* Due Date */}
                        <span className="text-[10px] text-[#6B7280] font-medium hidden sm:inline">
                          {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}
                        </span>

                        {/* Priority Badge */}
                        <span className={`
                          text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider
                          ${task.priority === 'high' ? 'bg-rose-500/10 text-rose-500' : ''}
                          ${task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : ''}
                          ${task.priority === 'low' ? 'bg-emerald-500/10 text-emerald-500' : ''}
                        `}>
                          {task.priority}
                        </span>

                        {/* Option Dots */}
                        <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </div>

        {/* RIGHT COLUMN: Sidebar Widgets (approx 28% / 3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* 1. UPCOMING REMINDERS */}
          <div className="bg-white border border-[#F1F5F9] rounded-[24px] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] text-left flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#111827]">Upcoming Reminders</h3>
                <Link href="/reminders" className="text-xs text-[#6D5DFC] font-semibold hover:underline">
                  View all
                </Link>
              </div>

              {reminders.filter(r => r.status === 'active').slice(0, 4).length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No active reminders.</div>
              ) : (
                <div className="space-y-3.5">
                  {reminders.filter(r => r.status === 'active').slice(0, 4).map((rem, idx) => {
                    // Color rotation helper based on index
                    const bgColors = ['bg-[#EFF6FF]', 'bg-[#FFF0F6]', 'bg-[#E8FDF0]', 'bg-[#FFFBEB]'];
                    const textColors = ['text-[#3B82F6]', 'text-[#D81B60]', 'text-[#22C55E]', 'text-[#F59E0B]'];
                    const colorIdx = idx % bgColors.length;

                    return (
                      <div key={rem.id} className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${bgColors[colorIdx]} ${textColors[colorIdx]} flex items-center justify-center shrink-0`}>
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-[#111827] truncate">{rem.title}</h4>
                          <p className="text-[10px] text-[#6B7280] font-semibold mt-0.5">
                            {new Date(rem.remind_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date(rem.remind_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 2. RECENT NOTES */}
          <div className="bg-white border border-[#F1F5F9] rounded-[24px] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] text-left">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#111827]">Recent Notes</h3>
              <Link href="/notes" className="text-xs text-[#6D5DFC] font-semibold hover:underline">
                View all
              </Link>
            </div>

            {notes.slice(0, 3).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No notes saved.</div>
            ) : (
              <div className="space-y-3.5">
                {notes.slice(0, 3).map((note, idx) => {
                  const fileBgs = ['bg-[#F0EEFF]', 'bg-[#FFFBEB]', 'bg-[#E8FDF0]'];
                  const fileTexts = ['text-[#6D5DFC]', 'text-[#F59E0B]', 'text-[#22C55E]'];
                  const colorIdx = idx % fileBgs.length;

                  return (
                    <Link 
                      href="/notes" 
                      key={note.id} 
                      className="flex items-center gap-3 group cursor-pointer"
                    >
                      <div className={`p-2.5 rounded-xl ${fileBgs[colorIdx]} ${fileTexts[colorIdx]} flex items-center justify-center shrink-0`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <h4 className="text-xs font-bold text-[#111827] group-hover:text-[#6D5DFC] transition-colors truncate">{note.title}</h4>
                        <p className="text-[10px] text-[#6B7280] mt-0.5">
                          {new Date(note.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. AI SUMMARY (Sleek Purple Card) */}
          <div className="bg-[#F0EEFF] border border-[#6D5DFC]/10 rounded-[24px] p-6 shadow-[0_10px_25px_rgba(109,93,252,0.05)] text-left relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#A78BFA]/20 rounded-full blur-xl" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-[#6D5DFC]/10 rounded-full blur-xl" />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-1.5 text-[#6D5DFC]">
                <Sparkles className="w-4 h-4" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider">AI Summary <span className="text-[10px] font-medium text-[#6D5DFC]/80">(This Week)</span></h3>
              </div>
              
              <div className="text-xs text-[#5C4EEB] leading-relaxed font-semibold">
                {weeklyReport ? (
                  <p>{weeklyReport.summary_text.length > 150 ? `${weeklyReport.summary_text.substring(0, 140)}...` : weeklyReport.summary_text}</p>
                ) : (
                  <p>You have been focused on Cloud Computing, DSA, and Placement preparation. You completed 12 tasks out of 20 this week. Keep it up! 🚀</p>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 4. FLOATING AI BOTTOM INPUT */}
      <div className="fixed bottom-6 left-[50%] -translate-x-[50%] w-[calc(100vw-3rem)] max-w-xl bg-white/90 backdrop-blur-md rounded-full shadow-[0_15px_40px_rgba(15,23,42,0.12)] border border-[#E5E7EB] px-4 py-2.5 flex items-center justify-between z-30 animate-in slide-in-from-bottom-6 duration-500">
        <input 
          type="text" 
          value={captureInput}
          onChange={(e) => setCaptureInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && captureInput.trim()) {
              handleCaptureSubmit(e);
            }
          }}
          placeholder="Ask anything or capture quickly..." 
          className="bg-transparent border-none outline-none text-xs text-[#111827] flex-1 px-2 placeholder:text-[#6B7280]/60"
        />
        <button 
          onClick={handleCaptureSubmit}
          disabled={isProcessingInput || !captureInput.trim()}
          className="bg-[#6D5DFC] text-white p-2.5 rounded-full hover:bg-[#5C4EEB] hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#6D5DFC]/20 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
