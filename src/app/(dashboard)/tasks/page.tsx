'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Plus, Trash2, Edit2, CheckCircle2, Circle, 
  Calendar, AlertCircle, ChevronDown, Check, Clock, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
import { Task } from '@/lib/db';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Tab & Filters
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  
  // Modals / Forms
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Work');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');
  const [dueDate, setDueDate] = useState('');

  // Fetch tasks
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Save new task or update existing
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title,
      description,
      category,
      priority,
      status,
      due_date: dueDate || new Date().toISOString().split('T')[0]
    };

    try {
      if (editingTask) {
        // Edit Mode
        const res = await fetch(`/api/tasks?id=${editingTask.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setEditingTask(null);
          fetchTasks();
        }
      } else {
        // Add Mode
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setIsAddOpen(false);
          fetchTasks();
        }
      }
      // Reset form
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  // Complete / Uncomplete quick toggle
  const toggleComplete = async (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await fetch(`/api/tasks?id=${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  // Delete task
  const deleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  // Set up form for Editing
  const openEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setCategory(task.category);
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(task.due_date);
    setIsAddOpen(true);
  };

  const resetForm = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setCategory('Work');
    setPriority('medium');
    setStatus('pending');
    setDueDate('');
  };

  // Filter list
  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'all') return true;
    return t.status === activeTab;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Tasks Manager</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review, prioritize, and structure your actionable goals.</p>
        </div>
        
        <button
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#6D5DFC] to-[#8B5CF6] text-white hover:opacity-90 transition-opacity font-medium text-xs flex items-center justify-center gap-2 self-start sm:self-auto shadow-md shadow-[#6D5DFC]/10"
        >
          <Plus className="w-4 h-4" />
          Add New Task
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {(['all', 'pending', 'in_progress', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all relative capitalize
              ${activeTab === tab 
                ? 'border-[#6D5DFC] text-[#6D5DFC] dark:text-[#A78BFA] font-bold' 
                : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-300'
              }
            `}
          >
            {tab.replace('_', ' ')}
            {activeTab === tab && (
              <motion.div 
                layoutId="activeTaskTab" 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6D5DFC]" 
              />
            )}
          </button>
        ))}
      </div>

      {/* ADD/EDIT SLIDE IN DRAWER / MODAL */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="w-full max-w-md h-full bg-white dark:bg-[#131B2E] border-l border-slate-200 dark:border-slate-800/80 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                  <h3 className="font-extrabold text-base">
                    {editingTask ? 'Edit Task Details' : 'Create New Task'}
                  </h3>
                  <button 
                    onClick={() => {
                      setIsAddOpen(false);
                      resetForm();
                    }} 
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                  >
                    <ChevronDown className="w-5 h-5 rotate-90" />
                  </button>
                </div>

                <form onSubmit={handleSaveTask} className="space-y-4 text-xs">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Task Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Complete DSA review sheet" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-[#6D5DFC] focus:outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-400 uppercase tracking-wider">Description</label>
                    <textarea 
                      rows={3}
                      placeholder="Add supplementary goals or checkpoints..." 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-[#6D5DFC] focus:outline-none"
                    />
                  </div>

                  {/* Row: Category & Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-400 uppercase tracking-wider">Category</label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-[#6D5DFC] focus:outline-none"
                      >
                        <option value="Work">Work</option>
                        <option value="Education">Education</option>
                        <option value="Personal">Personal</option>
                        <option value="Finance">Finance</option>
                        <option value="Health">Health</option>
                        <option value="Todo">Todo</option>
                        <option value="General">General</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-400 uppercase tracking-wider">Priority</label>
                      <select 
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-[#6D5DFC] focus:outline-none font-semibold"
                      >
                        <option value="low" className="text-emerald-500">Low (Green)</option>
                        <option value="medium" className="text-amber-500">Medium (Orange)</option>
                        <option value="high" className="text-rose-500">High (Red)</option>
                      </select>
                    </div>
                  </div>

                  {/* Row: Due Date & Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-400 uppercase tracking-wider">Due Date</label>
                      <input 
                        type="date" 
                        required
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-[#6D5DFC] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                      <select 
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-[#6D5DFC] focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 mt-4 rounded-xl bg-gradient-to-r from-[#6D5DFC] to-[#8B5CF6] text-white hover:opacity-95 font-semibold transition-all shadow-md"
                  >
                    {editingTask ? 'Apply Changes' : 'Create Task'}
                  </button>
                </form>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] text-slate-500">
                  Tasks can also be generated automatically by speaking or uploading project guideline documentation.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TASKS TABLE VIEW */}
      <div className="rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4 w-12"></th>
                <th className="p-4">Task Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Priority</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">Loading tasks...</td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    No tasks found matching filter: **{activeTab}**
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr 
                    key={task.id} 
                    className={`
                      hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all
                      ${task.status === 'completed' ? 'opacity-65 line-through text-slate-400' : ''}
                    `}
                  >
                    {/* Checkbox cell */}
                    <td className="p-4">
                      <button 
                        onClick={() => toggleComplete(task)}
                        className="w-5 h-5 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:border-[#6D5DFC]"
                      >
                        {task.status === 'completed' && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                      </button>
                    </td>

                    {/* Title & Description */}
                    <td className="p-4 max-w-xs md:max-w-md">
                      <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{task.title}</div>
                      {task.description && (
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{task.description}</p>
                      )}
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        {task.category}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="p-4 font-medium text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {task.due_date}
                      </div>
                    </td>

                    {/* Priority Badge */}
                    <td className="p-4">
                      <span className={`
                        px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border
                        ${task.priority === 'high' 
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                          : task.priority === 'medium' 
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        }
                      `}>
                        {task.priority}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => openEdit(task)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-[#6D5DFC] transition-colors"
                          title="Edit Task"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
