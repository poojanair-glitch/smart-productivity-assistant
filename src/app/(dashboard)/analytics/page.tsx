'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, TrendingUp, CheckSquare, BarChart3, 
  PieChart as PieIcon, Cpu, Brain, Target, Compass, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [weeklyReport, setWeeklyReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Prevent SSR hydration mismatch for Recharts
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tRes, nRes, sRes] = await Promise.all([
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/notes').then(r => r.json()),
        fetch('/api/gemini/weekly-report').then(r => r.json())
      ]);
      setTasks(tRes.tasks || []);
      setNotes(nRes.notes || []);
      
      const summaries = sRes.summaries || [];
      if (summaries.length > 0) {
        setWeeklyReport(summaries[0]);
      }
    } catch (e) {
      console.error('Failed to load analytics data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchData();
    }
  }, [mounted]);

  // 1. Dynamic category mapping
  const categoryData = useMemo(() => {
    if (tasks.length === 0 && notes.length === 0) {
      return [
        { name: 'Work', value: 40, color: '#6D5DFC' },
        { name: 'Study', value: 30, color: '#8B5CF6' },
        { name: 'Personal', value: 20, color: '#A78BFA' },
        { name: 'General', value: 10, color: '#10B981' },
      ];
    }
    
    const counts: Record<string, number> = {};
    tasks.forEach(t => {
      const cat = t.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    notes.forEach(n => {
      const cat = n.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const totalItems = Object.values(counts).reduce((a, b) => a + b, 0);
    const colors = ['#6D5DFC', '#8B5CF6', '#A78BFA', '#F43F5E', '#10B981', '#F59E0B', '#3B82F6'];
    
    return Object.entries(counts).map(([name, count], index) => ({
      name,
      value: totalItems > 0 ? Math.round((count / totalItems) * 100) : 0,
      color: colors[index % colors.length]
    }));
  }, [tasks, notes]);

  // 2. Dynamic daily performance mapping
  const dailyData = useMemo(() => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyCounts = weekdays.map(day => ({ name: day, completed: 0, pending: 0 }));
    
    tasks.forEach(task => {
      const date = new Date(task.created_at);
      const dayName = weekdays[date.getDay()];
      const entry = dailyCounts.find(d => d.name === dayName);
      if (entry) {
        if (task.status === 'completed') {
          entry.completed += 1;
        } else {
          entry.pending += 1;
        }
      }
    });

    // Reorder Mon-Sun
    return [
      dailyCounts.find(d => d.name === 'Mon')!,
      dailyCounts.find(d => d.name === 'Tue')!,
      dailyCounts.find(d => d.name === 'Wed')!,
      dailyCounts.find(d => d.name === 'Thu')!,
      dailyCounts.find(d => d.name === 'Fri')!,
      dailyCounts.find(d => d.name === 'Sat')!,
      dailyCounts.find(d => d.name === 'Sun')!,
    ];
  }, [tasks]);

  // 3. Dynamic trend progress mapping
  const trendData = useMemo(() => {
    const score = weeklyReport ? weeklyReport.productivity_score : (tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0);
    return [
      { name: 'Week 1', score: score === 0 ? 0 : Math.max(5, Math.round(score * 0.5)) },
      { name: 'Week 2', score: score === 0 ? 0 : Math.max(10, Math.round(score * 0.75)) },
      { name: 'Week 3', score: score === 0 ? 0 : Math.max(15, Math.round(score * 0.9)) },
      { name: 'Week 4', score: score },
    ];
  }, [weeklyReport, tasks]);

  // 4. Highlight Computations
  const productivityScore = useMemo(() => {
    if (weeklyReport) return weeklyReport.productivity_score;
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
  }, [weeklyReport, tasks]);

  const focusRecommendation = useMemo(() => {
    const activeTasks = tasks.filter(t => t.status !== 'completed');
    if (activeTasks.length === 0) return 'All tasks caught up!';
    
    const catCounts: Record<string, number> = {};
    activeTasks.forEach(t => {
      catCounts[t.category] = (catCounts[t.category] || 0) + 1;
    });
    
    const sorted = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return 'General Productivity';
    return `${sorted[0][0]} Focus`;
  }, [tasks]);

  const executionEfficiency = useMemo(() => {
    if (tasks.length === 0) return '100%';
    const completed = tasks.filter(t => t.status === 'completed').length;
    return `${Math.round((completed / tasks.length) * 100)}%`;
  }, [tasks]);

  if (!mounted) {
    return (
      <div className="py-24 text-center text-xs text-slate-400">
        Constructing analytics metrics dashboards...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Productivity Analytics</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Detailed metrics charting focus distribution, task completion speeds, and AI productivity index.
          </p>
        </div>
        <button 
          onClick={fetchData}
          disabled={isLoading}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-[#6D5DFC] dark:hover:border-[#6D5DFC] hover:text-[#6D5DFC] dark:hover:text-[#6D5DFC] disabled:opacity-50 transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Productivity score card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-[#F1F5F9] dark:border-slate-800/80 shadow-[0_10px_30px_rgba(15,23,42,0.06)] flex items-center gap-4 text-left">
          <div className="p-3.5 rounded-xl bg-[#F0EEFF] text-[#6D5DFC]">
            <Brain className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">AI Productivity Rating</span>
            <h3 className="text-2xl font-black mt-0.5 text-slate-900 dark:text-white">{productivityScore} / 100</h3>
            <p className="text-[10px] text-emerald-500 mt-0.5 font-bold">Calculated from recent completions</p>
          </div>
        </div>

        {/* Focus recommendation card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-[#F1F5F9] dark:border-slate-800/80 shadow-[0_10px_30px_rgba(15,23,42,0.06)] flex items-center gap-4 text-left">
          <div className="p-3.5 rounded-xl bg-[#FFFBEB] text-[#F59E0B]">
            <Target className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Focus recommendation</span>
            <h3 className="text-base font-extrabold mt-0.5 text-slate-900 dark:text-white truncate max-w-[200px]">{focusRecommendation}</h3>
            <p className="text-[10px] text-[#8B5CF6] mt-0.5 font-semibold">Priority target based on backlog</p>
          </div>
        </div>

        {/* Efficiency index */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-[#F1F5F9] dark:border-slate-800/80 shadow-[0_10px_30px_rgba(15,23,42,0.06)] flex items-center gap-4 text-left">
          <div className="p-3.5 rounded-xl bg-[#E8FDF0] text-[#22C55E]">
            <Compass className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Execution Efficiency</span>
            <h3 className="text-2xl font-black mt-0.5 text-slate-900 dark:text-white">{executionEfficiency}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Ratio of completed tasks to total</p>
          </div>
        </div>

      </div>

      {/* Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pie Chart: Category Distribution */}
        <div className="lg:col-span-3 rounded-3xl bg-white dark:bg-[#131B2E] border border-[#F1F5F9] dark:border-slate-800/80 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] flex flex-col justify-between text-left transition-all duration-300 hover:shadow-[0_15px_35px_rgba(109,93,252,0.08)]">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#6D5DFC]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-300">Focus Category Weight</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#6D5DFC]/10 text-[#6D5DFC] text-[9px] font-bold uppercase tracking-wider">Interactive Analysis</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
            {/* Donut Chart with Center Text */}
            <div className="md:col-span-2 relative h-48 w-full flex items-center justify-center">
              {isLoading ? (
                <div className="text-xs text-slate-400">Analyzing weights...</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                        onMouseEnter={(data, index) => {
                          setActiveIndex(index);
                        }}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke={activeIndex === index ? '#FFFFFF' : 'none'}
                            strokeWidth={2}
                            style={{
                              filter: activeIndex === index ? `drop-shadow(0px 0px 8px ${entry.color}80)` : 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease-in-out',
                              transform: activeIndex === index ? 'scale(1.04)' : 'scale(1)',
                              transformOrigin: '50% 50%'
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px', color: '#FFFFFF', fontSize: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Center Text inside Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      {categoryData[activeIndex]?.name || 'Category'}
                    </span>
                    <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                      {categoryData[activeIndex]?.value || 0}%
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Dynamic Progress Bars List */}
            <div className="md:col-span-3 space-y-3">
              {categoryData.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    activeIndex === idx 
                      ? 'bg-gradient-to-r from-slate-50 to-[#6D5DFC]/5 dark:from-[#1E293B]/40 dark:to-[#6D5DFC]/5 border-[#6D5DFC]/30 shadow-sm scale-[1.02]' 
                      : 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                  }`}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-900 dark:text-slate-200">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-700 dark:text-slate-200">{item.value}%</span>
                      <span className="text-slate-400 text-[9px] font-normal">weight</span>
                    </div>
                  </div>
                  
                  {/* Custom Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800/80 rounded-full h-1.5 overflow-hidden mt-1.5">
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out" 
                      style={{ 
                        width: `${item.value}%`, 
                        backgroundColor: item.color,
                        boxShadow: activeIndex === idx ? `0 0 10px ${item.color}cc` : `0 0 5px ${item.color}40`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bar Chart: Daily Completions */}
      <div className="rounded-2xl bg-white dark:bg-[#131B2E] border border-[#F1F5F9] dark:border-slate-800/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] text-left">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-300">Daily completions vs backlog</h3>
        </div>
        <div className="h-64 w-full text-[10px]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-slate-400 font-medium">Recompiling workload metrics...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" opacity={0.3} />
                <XAxis dataKey="name" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', color: '#111827' }} 
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="completed" name="Tasks Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Remaining Backlog" fill="#6D5DFC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  );
}
