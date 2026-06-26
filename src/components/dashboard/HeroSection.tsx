"use client";

import { Mic, Upload, FilePlus, Send } from "lucide-react";

export default function HeroSection() {
  return (
    <div className="bg-gradient-to-r from-violet-50 to-purple-100 rounded-3xl p-8 flex justify-between items-center shadow-sm border border-violet-100">

      <div className="flex-1 max-w-2xl">

        <h2 className="text-4xl font-bold text-slate-900 mb-3">
          Capture anything...
        </h2>

        <p className="text-slate-500 mb-6">
          Type, speak or upload to add tasks, notes and reminders.
        </p>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center">

          <input
            className="flex-1 outline-none text-lg"
            placeholder="Example: Remind me to call Alex tomorrow at 10 AM"
          />

          <button className="bg-violet-600 text-white rounded-full w-10 h-10 flex items-center justify-center">
            <Send size={18}/>
          </button>

        </div>

        <div className="flex gap-4 mt-6">

          <button className="px-6 py-3 rounded-xl bg-violet-100 text-violet-700 flex items-center gap-2">
            <Mic size={18}/>
            Voice Input
          </button>

          <button className="px-6 py-3 rounded-xl bg-emerald-100 text-emerald-700 flex items-center gap-2">
            <FilePlus size={18}/>
            Quick Note
          </button>

          <button className="px-6 py-3 rounded-xl bg-sky-100 text-sky-700 flex items-center gap-2">
            <Upload size={18}/>
            Upload
          </button>

        </div>

      </div>

      <div className="hidden xl:flex ml-10">

        <img
          src="/hero.png"
          alt="hero"
          className="w-80"
        />

      </div>

    </div>
  );
}