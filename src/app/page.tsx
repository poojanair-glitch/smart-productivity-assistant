'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Cpu, CheckSquare, Clock, FileText, BarChart3, 
  Shield, Mic, ArrowRight, Play, Check, ChevronDown, 
  Star, Quote, HelpCircle, Sun, Moon, MessageSquare, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const faqs = [
    {
      q: "How does the natural language capture work?",
      a: "You can type or speak queries naturally (e.g., 'Remind me to call Mom tomorrow at 6 PM' or 'Deploy AWS server next Monday'). Gemini AI automatically extracts the task type, schedules it, assigns a category and priority, and updates your dashboard."
    },
    {
      q: "Is my data stored securely in the cloud?",
      a: "Yes. All data is stored securely in a dedicated Supabase PostgreSQL instance. Row Level Security (RLS) is enabled, meaning only you have the authorization keys to access or modify your personal dashboard items."
    },
    {
      q: "Can I transcribe voice instructions?",
      a: "Absolutely. The assistant integrates with the HTML5 Web Speech API. You can click the voice button in the hero block, dictate your task, and let the AI capture the scheduling parameters automatically."
    },
    {
      q: "Can I parse PDF or text documents?",
      a: "Yes. You can upload TXT, PDF, or DOCX files. Smart Productivity Assistant extracts the text, generates a summary, extracts key action items, and populates your tasks checklist automatically."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-[#F8FAFC] bg-grid-pattern overflow-x-hidden font-sans transition-colors duration-300">
      
      {/* 1. STICKY NAVBAR */}
      <nav className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200/50 dark:border-slate-800/80 px-6 py-4 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#6D5DFC] to-[#8B5CF6] text-white flex items-center justify-center shadow-lg shadow-[#6D5DFC]/20">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="font-bold text-base tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-[#A78BFA] bg-clip-text text-transparent">
            Smart Productivity <span className="text-xs font-normal text-slate-400 block -mt-1">Assistant</span>
          </span>
        </div>

        {/* Center menu links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <a href="#features" className="hover:text-[#6D5DFC] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#6D5DFC] transition-colors">How It Works</a>
          <a href="#showcase" className="hover:text-[#6D5DFC] transition-colors">AI Assistant</a>
          <a href="#testimonials" className="hover:text-[#6D5DFC] transition-colors">Testimonials</a>
          <a href="#faq" className="hover:text-[#6D5DFC] transition-colors">FAQ</a>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-[#6D5DFC] transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <Link 
            href="/login" 
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#6D5DFC] transition-colors"
          >
            Log in
          </Link>
          
          <Link 
            href="/signup" 
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D5DFC] to-[#8B5CF6] text-white hover:opacity-90 transition-opacity text-xs font-bold shadow-md shadow-[#6D5DFC]/10"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="max-w-7xl mx-auto px-6 pt-16 pb-20 md:py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Headline */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6D5DFC]/10 border border-[#6D5DFC]/20 text-[#6D5DFC] dark:text-[#A78BFA] text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Productivity
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Your AI Partner in <br />
            <span className="bg-gradient-to-r from-[#6D5DFC] via-[#8B5CF6] to-[#A78BFA] bg-clip-text text-transparent">
              Productivity & Success
            </span>
          </h1>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed">
            Capture tasks, notes, and ideas in natural language. Get organized, stay focused, and achieve more with the power of AI.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link 
              href="/signup" 
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#6D5DFC] to-[#8B5CF6] hover:from-[#5C4EEB] hover:to-[#7C4BEA] text-white font-bold text-sm shadow-xl shadow-[#6D5DFC]/20 transition-all flex items-center gap-2 group"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a 
              href="#showcase" 
              className="py-3 px-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm text-slate-700 dark:text-slate-350 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-400 dark:fill-slate-500" />
              Watch Demo
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-semibold text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#6D5DFC]" /> AI-Powered</span>
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-500" /> Secure & Private</span>
            <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-indigo-500" /> Works Everywhere</span>
          </div>
        </div>

        {/* Right floating CSS Mockup */}
        <div className="lg:col-span-7 flex justify-center">
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-full max-w-2xl rounded-2xl bg-slate-950 p-1.5 shadow-2xl border border-slate-800/80 relative overflow-hidden"
          >
            {/* Browser top bar decoration */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800/60 bg-slate-900/40">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <div className="px-10 py-0.5 rounded bg-slate-950/40 text-[9px] text-slate-600 font-mono">localhost:3000/dashboard</div>
              <div className="w-4" />
            </div>

            {/* Mock Dashboard Layout */}
            <div className="aspect-[16/10] bg-[#0B0F19] text-white flex text-[9px] overflow-hidden leading-none select-none">
              
              {/* Sidebar */}
              <aside className="w-24 bg-slate-950 p-2 border-r border-slate-850 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-4">
                    <div className="p-1 rounded bg-[#6D5DFC] text-white"><Cpu className="w-2.5 h-2.5" /></div>
                    <span className="font-extrabold text-[7px]">Smart Prod</span>
                  </div>
                  <div className="space-y-1">
                    <div className="p-1.5 rounded bg-[#6D5DFC]/10 text-[#6D5DFC] font-bold flex items-center gap-1.5"><CheckSquare className="w-2.5 h-2.5" />Dashboard</div>
                    <div className="p-1.5 rounded hover:bg-slate-900 text-slate-500 flex items-center gap-1.5"><Clock className="w-2.5 h-2.5" />Tasks</div>
                    <div className="p-1.5 rounded hover:bg-slate-900 text-slate-500 flex items-center gap-1.5"><FileText className="w-2.5 h-2.5" />Notes</div>
                    <div className="p-1.5 rounded hover:bg-slate-900 text-slate-500 flex items-center gap-1.5"><Settings className="w-2.5 h-2.5" />Settings</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-900">
                  <span className="w-4 h-4 rounded-full bg-slate-800 block object-cover" />
                  <div className="truncate">
                    <div className="font-bold text-[6px]">Aditya Verma</div>
                    <div className="text-[5px] text-slate-600">aditya@gmail.com</div>
                  </div>
                </div>
              </aside>

              {/* Main content body */}
              <div className="flex-1 p-3 flex flex-col gap-3 overflow-hidden">
                <header className="flex justify-between items-center pb-2 border-b border-slate-900">
                  <div>
                    <h3 className="font-bold">Good morning, Aditya! 👋</h3>
                    <p className="text-[7px] text-slate-500 mt-0.5">What would you like to accomplish today?</p>
                  </div>
                  <div className="w-16 h-4 rounded bg-slate-900 border border-slate-800" />
                </header>

                <div className="flex gap-3 flex-1 overflow-hidden">
                  
                  {/* Left Column content */}
                  <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-850/80 space-y-1.5">
                      <div className="font-bold text-[#A78BFA]">Capture anything...</div>
                      <div className="h-6 rounded bg-slate-950 border border-slate-850" />
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div className="p-2 rounded bg-slate-900 border border-slate-850"><div className="text-[6px] text-slate-500">Tasks</div><div className="font-bold text-xs mt-1">16</div></div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-850"><div className="text-[6px] text-slate-500">To-Do</div><div className="font-bold text-xs mt-1">8</div></div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-850"><div className="text-[6px] text-slate-500">Notes</div><div className="font-bold text-xs mt-1">24</div></div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-850"><div className="text-[6px] text-slate-500">Completed</div><div className="font-bold text-xs mt-1">12</div></div>
                    </div>

                    <div className="flex-1 rounded-xl bg-slate-900/60 border border-slate-850 p-2 space-y-2">
                      <div className="font-bold border-b border-slate-850 pb-1.5">My Tasks</div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center p-1 rounded bg-slate-950 border border-slate-900"><span>Complete DSA revision</span><span className="px-1 py-0.5 rounded text-[5px] bg-rose-500/10 text-rose-500 font-extrabold uppercase">High</span></div>
                        <div className="flex justify-between items-center p-1 rounded bg-slate-950 border border-slate-900"><span>Submit CloudNetSentinel report</span><span className="px-1 py-0.5 rounded text-[5px] bg-amber-500/10 text-amber-500 font-extrabold uppercase">Medium</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column widgets */}
                  <div className="w-28 space-y-3">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-850 space-y-1.5">
                      <div className="font-bold text-rose-400">Upcoming Reminders</div>
                      <div className="text-[6px] p-1 rounded bg-slate-950 border border-slate-900">Team Standup Meeting</div>
                      <div className="text-[6px] p-1 rounded bg-slate-950 border border-slate-900">Submit project report</div>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-850 space-y-1.5">
                      <div className="font-bold text-[#A78BFA]">Recent Notes</div>
                      <div className="text-[6px] p-1 rounded bg-slate-950 border border-slate-900">AWS IAM best practices</div>
                    </div>

                    <div className="p-2 rounded-xl bg-[#6D5DFC]/10 border border-[#6D5DFC]/20 space-y-1.5">
                      <div className="font-bold text-[#A78BFA]">AI Summary</div>
                      <p className="text-[6px] text-slate-400 leading-relaxed">Focused on Cloud Computing. Completed 12 tasks this week.</p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </motion.div>
        </div>

      </header>



      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20 text-center space-y-12">
        <div className="space-y-3">
          <h2 className="text-3xl font-black tracking-tight">How It Works</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Get organized in 3 simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 text-left space-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-4 right-4 text-3xl font-extrabold text-[#6D5DFC]/10">01</div>
            <div className="p-3 rounded-xl bg-[#6D5DFC]/10 text-[#6D5DFC] inline-block"><CheckSquare className="w-5 h-5" /></div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider">Capture Anything</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Type, speak, or upload anything. Our AI automatically extracts scheduling variables, text, and parameters.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 text-left space-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-4 right-4 text-3xl font-extrabold text-[#8B5CF6]/10">02</div>
            <div className="p-3 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] inline-block"><Sparkles className="w-5 h-5" /></div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider">AI Organizes</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Gemini AI structures your items, categorizes tasks, extracts notes, and assigns priorities immediately.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 text-left space-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-4 right-4 text-3xl font-extrabold text-[#A78BFA]/10">03</div>
            <div className="p-3 rounded-xl bg-[#A78BFA]/10 text-[#A78BFA] inline-block"><BarChart3 className="w-5 h-5" /></div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider">You Achieve More</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Stay focused, retrieve semantic searches, review weekly productivity scores, and complete targets faster.
            </p>
          </div>

        </div>
      </section>

      {/* 5. FEATURES SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 text-center space-y-12 bg-slate-50/50 dark:bg-slate-900/10 rounded-3xl p-8 border border-slate-200/40 dark:border-slate-800/40">
        <div className="space-y-3">
          <h2 className="text-3xl font-black tracking-tight">Powerful Features</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Everything you need to automate your daily checklist</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <motion.div whileHover={{ y: -3 }} className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 text-left space-y-3 shadow-sm glow-hover">
            <div className="p-2.5 rounded-xl bg-[#6D5DFC]/10 text-[#6D5DFC] inline-block"><Sparkles className="w-4 h-4" /></div>
            <h4 className="font-bold text-sm">AI Task Capture</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Capture tasks naturally. AI extracts categories and due dates immediately.</p>
          </motion.div>

          {/* Card 2 */}
          <motion.div whileHover={{ y: -3 }} className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 text-left space-y-3 shadow-sm glow-hover">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 inline-block"><Clock className="w-4 h-4" /></div>
            <h4 className="font-bold text-sm">Smart Reminders</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Schedule reminders. AI parses dates and alerts you before they trigger.</p>
          </motion.div>

          {/* Card 3 */}
          <motion.div whileHover={{ y: -3 }} className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 text-left space-y-3 shadow-sm glow-hover">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 inline-block"><Mic className="w-4 h-4" /></div>
            <h4 className="font-bold text-sm">Voice Assistant</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Use browser voice synthesis to capture items, checklist and notes on the fly.</p>
          </motion.div>

          {/* Card 4 */}
          <motion.div whileHover={{ y: -3 }} className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 text-left space-y-3 shadow-sm glow-hover">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 inline-block"><FileText className="w-4 h-4" /></div>
            <h4 className="font-bold text-sm">AI Note Summaries</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Upload documents (PDF/TXT) and let Gemini summarize takeaways.</p>
          </motion.div>

          {/* Card 5 */}
          <motion.div whileHover={{ y: -3 }} className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 text-left space-y-3 shadow-sm glow-hover">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 inline-block"><BarChart3 className="w-4 h-4" /></div>
            <h4 className="font-bold text-sm">Analytics Dashboard</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Visual charts showing weekly trend stats, productivity, and categories.</p>
          </motion.div>

          {/* Card 6 */}
          <motion.div whileHover={{ y: -3 }} className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 text-left space-y-3 shadow-sm glow-hover">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 inline-block"><Shield className="w-4 h-4" /></div>
            <h4 className="font-bold text-sm">Secure Cloud Sync</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Supabase cloud encryption ensures your data stays separate and private.</p>
          </motion.div>

        </div>
      </section>

      {/* 6. AI SHOWCASE SECTION */}
      <section id="showcase" className="max-w-4xl mx-auto px-6 py-20 text-center space-y-12">
        <div className="space-y-3">
          <h2 className="text-3xl font-black tracking-tight">AI Conversation Showcase</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">See the Natural Language Interface in action</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 max-w-lg mx-auto text-left shadow-2xl">
          {/* User message */}
          <div className="flex justify-end">
            <div className="px-4 py-2.5 rounded-2xl rounded-tr-none bg-gradient-to-r from-[#6D5DFC] to-[#8B5CF6] text-white text-xs leading-relaxed max-w-[85%] shadow-md">
              Remind me to submit my project tomorrow at 5 PM.
            </div>
          </div>
          {/* AI Reply */}
          <div className="flex justify-start items-start gap-3">
            <div className="p-1.5 rounded-lg bg-[#6D5DFC] text-white"><Sparkles className="w-3.5 h-3.5" /></div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-slate-950 border border-slate-850 text-xs text-slate-200 leading-relaxed max-w-[80%] space-y-2 shadow-inner">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Check className="w-4 h-4" />
                Reminder Created
              </div>
              <div className="text-[10px] space-y-1 text-slate-400">
                <div><span className="font-semibold text-slate-500">Title:</span> Submit project</div>
                <div><span className="font-semibold text-slate-500">Priority:</span> High</div>
                <div><span className="font-semibold text-slate-500">Notification:</span> Tomorrow 5:00 PM</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PRODUCTIVITY STATS */}
      <section className="bg-slate-50 dark:bg-slate-900/30 py-16 border-y border-slate-200/50 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1"><h3 className="text-3xl font-black text-[#6D5DFC] dark:text-[#A78BFA]">10K+</h3><p className="text-[10px] uppercase font-bold text-slate-400">Active Users</p></div>
          <div className="space-y-1"><h3 className="text-3xl font-black text-[#6D5DFC] dark:text-[#A78BFA]">250K+</h3><p className="text-[10px] uppercase font-bold text-slate-400">Tasks Completed</p></div>
          <div className="space-y-1"><h3 className="text-3xl font-black text-[#6D5DFC] dark:text-[#A78BFA]">98%</h3><p className="text-[10px] uppercase font-bold text-slate-400">AI Accuracy</p></div>
          <div className="space-y-1"><h3 className="text-3xl font-black text-[#6D5DFC] dark:text-[#A78BFA]">4.9★</h3><p className="text-[10px] uppercase font-bold text-slate-400">User Rating</p></div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section id="testimonials" className="max-w-7xl mx-auto px-6 py-20 text-center space-y-12">
        <div className="space-y-3">
          <h2 className="text-3xl font-black tracking-tight">Loved by Productive Users</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Here is what professionals are saying about their new AI assistant</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 text-left space-y-4 shadow-sm flex flex-col justify-between">
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-350 italic">
              "Being able to speak tasks like 'Standup meeting at 10 AM' and have it parsed onto my calendar immediately has saved me hours every single week."
            </p>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-300 block object-cover" />
              <div>
                <h4 className="text-xs font-bold">Sophia Martinez</h4>
                <p className="text-[10px] text-slate-400">Software Product Manager</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 text-left space-y-4 shadow-sm flex flex-col justify-between">
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-350 italic">
              "The PDF summarization feature is unmatched. I drop my project spec documentation in, and AI automatically creates structured cards and checklists."
            </p>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-300 block object-cover" />
              <div>
                <h4 className="text-xs font-bold">David Chen</h4>
                <p className="text-[10px] text-slate-400">Lead Cloud Architect</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800/60 text-left space-y-4 shadow-sm flex flex-col justify-between">
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-350 italic">
              "I ask the chatbot 'What are my high-priority tasks?' and it filters my dashboard in real-time. It feels like a real secretary in my computer."
            </p>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-300 block object-cover" />
              <div>
                <h4 className="text-xs font-bold">Emily Watson</h4>
                <p className="text-[10px] text-slate-400">DSA Engineering Student</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 9. FAQ SECTION */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black tracking-tight">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Have questions? We have answers</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2E]/60 overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-white"
              >
                {faq.q}
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${faqOpen === idx ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {faqOpen === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-slate-150 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20"
                  >
                    <p className="p-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* 10. CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="rounded-3xl bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#090D1F] border border-indigo-900/30 p-10 md:p-16 relative overflow-hidden shadow-2xl space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#6D5DFC]/10 rounded-full blur-3xl -z-10" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Start Organizing Smarter Today</h2>
          <p className="text-slate-400 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Create your account now and let artificial intelligence optimize your priorities, summarize your notes, and supercharge your day.
          </p>
          <Link 
            href="/signup" 
            className="inline-block py-3 px-8 rounded-xl bg-gradient-to-r from-[#6D5DFC] to-[#8B5CF6] hover:opacity-90 transition-opacity text-white text-xs font-extrabold shadow-lg"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200/50 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#6D5DFC]" />
            <span className="font-bold text-sm">Smart Productivity</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Beautiful AI-powered SaaS dashboard built for task optimization and personal knowledge sync.
          </p>
        </div>

        <div className="space-y-3">
          <h5 className="font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-[10px]">Links</h5>
          <div className="flex flex-col gap-2 text-slate-500 dark:text-slate-400 font-semibold">
            <a href="#" className="hover:text-[#6D5DFC] transition-colors">Home</a>
            <a href="#features" className="hover:text-[#6D5DFC] transition-colors">Features</a>
            <a href="#faq" className="hover:text-[#6D5DFC] transition-colors">FAQ</a>
          </div>
        </div>

        <div className="space-y-3">
          <h5 className="font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-[10px]">Legal</h5>
          <div className="flex flex-col gap-2 text-slate-500 dark:text-slate-400 font-semibold">
            <a href="#" className="hover:text-[#6D5DFC] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#6D5DFC] transition-colors">Terms of Service</a>
          </div>
        </div>

        <div className="space-y-4">
          <h5 className="font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-[10px]">Github</h5>
          <a 
            href="https://github.com" 
            target="_blank" 
            className="inline-flex items-center gap-2 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
            Check repository
          </a>
        </div>

      </footer>

    </div>
  );
}
