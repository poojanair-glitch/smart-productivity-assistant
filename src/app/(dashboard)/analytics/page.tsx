'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, TrendingUp, CheckSquare, BarChart3, 
  PieChart as PieIcon, Cpu, Brain, Target, Compass 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend, RadialBarChart, RadialBar
} from 'recharts';

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  // Prevent SSR hydration mismatch for Recharts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Productivity Trend data
  const trendData = [
    { name: 'Week 1', score: 62 },
    { name: 'Week 2', score: 71 },
    { name: 'Week 3', score: 68 },
    { name: 'Week 4', score: 82 },
  ];

  // Daily performance data
  const dailyData = [
    { name: 'Mon', completed: 3, pending: 2 },
    { name: 'Tue', completed: 2, pending: 4 },
    { name: 'Wed', completed: 5, pending: 1 },
    { name: 'Thu', completed: 4, pending: 3 },
    { name: 'Fri', completed: 6, pending: 1 },
    { name: 'Sat', completed: 2, pending: 0 },
    { name: 'Sun', completed: 1, pending: 0 },
  ];

  // Category distribution data
  const categoryData = [
    { name: 'Work', value: 45, color: '#6D5DFC' },
    { name: 'Education', value: 25, color: '#8B5CF6' },
    { name: 'Personal', value: 15, color: '#A78BFA' },
    { name: 'Finance', value: 10, color: '#F43F5E' },
    { name: 'Health', value: 5, color: '#10B981' },
  ];

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
      <div>
        <h1 className="text-2xl font-black tracking-tight">Productivity Analytics</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Detailed metrics charting focus distribution, task completion speeds, and AI productivity index.
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Productivity score card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-[#6D5DFC]/10 text-[#6D5DFC]">
            <Brain className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">AI Productivity Rating</span>
            <h3 className="text-xl font-black mt-0.5">82 / 100</h3>
            <p className="text-[10px] text-emerald-500 mt-0.5 font-medium">+8% improvement from last week</p>
          </div>
        </div>

        {/* Focus recommendation card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-500">
            <Target className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Focus recommendation</span>
            <h3 className="text-sm font-bold mt-0.5 truncate max-w-[200px]">Cloud Infrastructure (Work)</h3>
            <p className="text-[10px] text-[#A78BFA] mt-0.5">Focus priority high: ECS and VPC tasks due tomorrow.</p>
          </div>
        </div>

        {/* Efficiency index */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Compass className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Execution Efficiency</span>
            <h3 className="text-xl font-black mt-0.5">91%</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Avg task complete buffer: 8.5 hours ahead.</p>
          </div>
        </div>

      </div>

      {/* Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Area Chart: Trend */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 p-5 shadow-sm flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800/65 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Productivity score progression</h3>
          </div>
          <div className="h-64 w-full text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6D5DFC" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6D5DFC" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.1} />
                <XAxis dataKey="name" stroke="#64748B" />
                <YAxis domain={[0, 100]} stroke="#64748B" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', color: '#F8FAFC' }} 
                  labelClassName="text-slate-400 font-bold"
                />
                <Area type="monotone" dataKey="score" stroke="#6D5DFC" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Category Distribution */}
        <div className="rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 p-5 shadow-sm flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800/65 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Focus category weight</h3>
          </div>
          
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', color: '#F8FAFC', fontSize: '10px' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2">
            {categoryData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-500">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bar Chart: Daily Completions */}
      <div className="rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 p-5 shadow-sm">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800/65 mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Daily completions vs backlog</h3>
        </div>
        <div className="h-64 w-full text-[10px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.1} />
              <XAxis dataKey="name" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', color: '#F8FAFC' }} 
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="completed" name="Tasks Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Remaining Backlog" fill="#6D5DFC" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
