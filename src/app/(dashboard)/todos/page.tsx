'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
import { Task } from '@/lib/db';
import { showToast, showConfirm } from '@/utils/toast';

export default function TodosPage() {
  const [todos, setTodos] = useState<Task[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch only todo items
  const fetchTodos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      const allTasks: Task[] = data.tasks || [];
      // Filter category 'Todo'
      setTodos(allTasks.filter(t => t.category === 'Todo'));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Quick add to-do
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTodoText,
          category: 'Todo',
          priority: 'medium',
          status: 'pending',
          due_date: new Date().toISOString().split('T')[0]
        })
      });

      if (res.ok) {
        setNewTodoText('');
        fetchTodos();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle checklist checkbox
  const toggleTodo = async (todo: Task) => {
    const nextStatus = todo.status === 'completed' ? 'pending' : 'completed';
    try {
      const res = await fetch(`/api/tasks?id=${todo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) fetchTodos();
    } catch (e) {
      console.error(e);
    }
  };

  // Delete checklist item
  const deleteTodo = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchTodos();
    } catch (e) {
      console.error(e);
    }
  };

  // Clear all completed checklist items
  const clearCompleted = async () => {
    const completedItems = todos.filter(t => t.status === 'completed');
    if (completedItems.length === 0) return;
    showConfirm(
      'Clear Completed Items',
      `Are you sure you want to clear all ${completedItems.length} completed item(s)?`,
      async () => {
        try {
          await Promise.all(
            completedItems.map(item => 
              fetch(`/api/tasks?id=${item.id}`, { method: 'DELETE' })
            )
          );
          showToast('Completed Items Cleared', `Successfully removed ${completedItems.length} item(s).`, 'success');
          fetchTodos();
        } catch (e) {
          console.error(e);
          showToast('Error', 'Failed to clear completed items.', 'error');
        }
      }
    );
  };

  const pendingTodos = todos.filter(t => t.status !== 'completed');
  const completedTodos = todos.filter(t => t.status === 'completed');

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight">To-Do Checklist</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Quick capture checkboxes for instant tasks, shopping lists, and daily chores.
        </p>
      </div>

      {/* Input bar */}
      <form onSubmit={handleAddTodo} className="flex gap-2">
        <input 
          type="text" 
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Buy groceries... revision notes... Call team..."
          className="flex-1 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-[#6D5DFC] focus:outline-none"
        />
        <button 
          type="submit"
          disabled={!newTodoText.trim()}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#6D5DFC] to-[#8B5CF6] text-white hover:opacity-95 text-xs font-semibold shrink-0 transition-all disabled:opacity-50"
        >
          Add Item
        </button>
      </form>

      {/* Checklist contents */}
      <div className="space-y-6">
        {/* Pending Items */}
        <div className="rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Checkbox ({pendingTodos.length})
            </h3>
            {completedTodos.length > 0 && (
              <button 
                onClick={clearCompleted}
                className="text-[10px] text-rose-500 hover:underline"
              >
                Clear Completed
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="py-6 text-center text-xs text-slate-400">Loading checklist...</div>
          ) : pendingTodos.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No active checklist items. Type above to add one!
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {pendingTodos.map(todo => (
                  <motion.div 
                    key={todo.id}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/25 border border-slate-100 dark:border-slate-800/30 group hover:border-[#6D5DFC]/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toggleTodo(todo)}
                        className="p-0.5 rounded text-slate-400 hover:text-[#6D5DFC]"
                      >
                        <Circle className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-medium">{todo.title}</span>
                    </div>
                    
                    <button 
                      onClick={() => deleteTodo(todo.id)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Completed Items */}
        {completedTodos.length > 0 && (
          <div className="rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800">
              Completed Checkbox ({completedTodos.length})
            </h3>
            
            <div className="space-y-2 opacity-60">
              {completedTodos.map(todo => (
                <div 
                  key={todo.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/10 border border-slate-100/50 dark:border-slate-800/20 line-through text-slate-400"
                >
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleTodo(todo)} className="text-emerald-500">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-medium">{todo.title}</span>
                  </div>
                  
                  <button 
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
