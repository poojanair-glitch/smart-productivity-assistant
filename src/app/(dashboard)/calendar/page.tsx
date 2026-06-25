'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Clock, Calendar as CalendarIcon, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';

// Types
import { Task, Reminder } from '@/lib/db';

export default function CalendarPage() {
  // Calendar Nav
  const [currentDate, setCurrentDate] = useState(new Date('2026-06-24')); // Sync with baseline date
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all scheduling entries
  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const [tRes, rRes] = await Promise.all([
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/reminders').then(r => r.json())
      ]);
      setTasks(tRes.tasks || []);
      setReminders(rRes.reminders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Compute grid days
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday, 6 is Saturday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = [];

  // Padding days from previous month
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthDays - i);
    daysArray.push({ date: d, isCurrentMonth: false });
  }

  // Days in current month
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    daysArray.push({ date: d, isCurrentMonth: true });
  }

  // Padding days from next month to make grid full (6 rows, 42 squares)
  const remainingSquares = 42 - daysArray.length;
  for (let i = 1; i <= remainingSquares; i++) {
    const d = new Date(year, month + 1, i);
    daysArray.push({ date: d, isCurrentMonth: false });
  }

  // Prev / Next navigators
  const navigateMonth = (direction: 'prev' | 'next') => {
    const nextDate = new Date(currentDate);
    if (direction === 'prev') {
      nextDate.setMonth(month - 1);
    } else {
      nextDate.setMonth(month + 1);
    }
    setCurrentDate(nextDate);
  };

  // Drag and Drop Handling (Native HTML5 Drag & Drop)
  const handleDragStart = (e: React.DragEvent, id: string, type: 'task' | 'reminder') => {
    e.dataTransfer.setData('itemId', id);
    e.dataTransfer.setData('itemType', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('itemId');
    const type = e.dataTransfer.getData('itemType');

    if (!id || !type) return;

    try {
      if (type === 'task') {
        // Update task due date
        await fetch(`/api/tasks?id=${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ due_date: targetDateStr })
        });
      } else if (type === 'reminder') {
        // Find existing reminder to preserve time
        const rItem = reminders.find(r => r.id === id);
        if (rItem) {
          const oldTimeStr = new Date(rItem.remind_at).toTimeString().split(' ')[0]; // HH:MM:SS
          const newRemindAt = new Date(`${targetDateStr}T${oldTimeStr}`).toISOString();

          await fetch(`/api/reminders?id=${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ remind_at: newRemindAt })
          });
        }
      }
      fetchEntries(); // Reload data
    } catch (err) {
      console.error('Drag and drop update failed:', err);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header navigations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Interactive Calendar</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Drag and drop tasks and reminders to reschedule them dynamically.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold min-w-[120px] text-center select-none">
            {monthNames[month]} {year}
          </span>
          <button 
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid wrapper */}
      <div className="rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 shadow-sm overflow-hidden flex flex-col">
        {/* Days of week headers */}
        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-center py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 grid-rows-6 divide-x divide-y divide-slate-100 dark:divide-slate-800/40">
          {isLoading ? (
            <div className="col-span-7 row-span-6 py-32 text-center text-xs text-slate-400">Loading schedule...</div>
          ) : (
            daysArray.map((dayItem, idx) => {
              const dayStr = dayItem.date.toISOString().split('T')[0]; // YYYY-MM-DD
              
              // Filter active tasks scheduled for this day
              const dayTasks = tasks.filter(t => t.due_date === dayStr);
              
              // Filter active reminders scheduled for this day
              const dayReminders = reminders.filter(r => r.remind_at.startsWith(dayStr));

              return (
                <div
                  key={idx}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, dayStr)}
                  className={`
                    min-h-[100px] p-2 flex flex-col justify-between transition-all select-none
                    ${dayItem.isCurrentMonth ? '' : 'bg-slate-50/20 dark:bg-slate-900/10 text-slate-400 dark:text-slate-600'}
                  `}
                >
                  {/* Day number badge */}
                  <div className="flex justify-between items-center mb-1">
                    <span className={`
                      text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center
                      ${dayStr === '2026-06-24' ? 'bg-[#6D5DFC] text-white shadow-md' : 'text-slate-400 dark:text-slate-500'}
                    `}>
                      {dayItem.date.getDate()}
                    </span>
                  </div>

                  {/* Day Content (Tasks and Reminders) */}
                  <div className="flex-1 space-y-1 overflow-y-auto max-h-[80px]">
                    {/* Tasks */}
                    {dayTasks.map(t => (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, t.id, 'task')}
                        className={`
                          p-1 rounded text-[9px] font-medium border flex items-center gap-1 cursor-grab active:cursor-grabbing truncate
                          ${t.status === 'completed' 
                            ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500 line-through opacity-70' 
                            : t.priority === 'high' 
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
                          }
                        `}
                        title={`Task: ${t.title}`}
                      >
                        <CheckSquare className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{t.title}</span>
                      </div>
                    ))}

                    {/* Reminders */}
                    {dayReminders.map(r => (
                      <div
                        key={r.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, r.id, 'reminder')}
                        className={`
                          p-1 rounded text-[9px] font-medium border border-rose-500/20 bg-rose-500/10 text-rose-500 flex items-center gap-1 cursor-grab active:cursor-grabbing truncate
                          ${r.status === 'dismissed' ? 'opacity-50 line-through' : ''}
                        `}
                        title={`Reminder: ${r.title}`}
                      >
                        <Clock className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{r.title}</span>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
