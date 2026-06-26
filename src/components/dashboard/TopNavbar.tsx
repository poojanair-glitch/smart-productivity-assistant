"use client";

import {
  Search,
  Mic,
  Sun,
  Bell,
} from "lucide-react";

export default function TopNavbar() {
  return (
    <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-10">

      {/* Greeting */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          Good Morning,
          <span className="text-violet-600"> Pooja 👋</span>
        </h1>

        <p className="text-slate-500 mt-2">
          What would you like to accomplish today?
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">

        {/* Search */}
        <div className="relative">

          <Search
            className="absolute left-5 top-4 text-slate-400"
            size={20}
          />

          <input
            placeholder="Search anything..."
            className="w-[420px] rounded-2xl border border-slate-200 pl-14 pr-5 py-4 outline-none bg-slate-50 focus:ring-2 focus:ring-violet-500"
          />

        </div>

        {/* Voice */}
<button
  className="relative w-14 h-14 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-all duration-300"
>
  <Mic size={22} className="text-slate-700" />
</button>

{/* Theme */}
<button
  className="w-14 h-14 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-all duration-300"
>
  <Sun size={22} className="text-slate-700" />
</button>

{/* Notification */}
<button
  className="relative w-14 h-14 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-all duration-300"
>
  <Bell size={22} className="text-slate-700" />
  <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-violet-600 border-2 border-white"></span>
</button>

      </div>

    </header>
  );
}