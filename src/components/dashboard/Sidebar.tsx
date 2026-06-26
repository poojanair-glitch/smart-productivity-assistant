"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Bell,
  Calendar,
  Tags,
  BarChart3,
  Settings,
  Bot,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Tasks",
    icon: CheckSquare,
    href: "/tasks",
  },
  {
    title: "To-Do",
    icon: CheckSquare,
    href: "/todos",
  },
  {
    title: "Notes",
    icon: FileText,
    href: "/notes",
  },
  {
    title: "Reminders",
    icon: Bell,
    href: "/reminders",
  },
  {
    title: "Calendar",
    icon: Calendar,
    href: "/calendar",
  },
  {
    title: "Tags",
    icon: Tags,
    href: "/tags",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/analytics",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-[#0F1226] text-white flex flex-col justify-between rounded-r-3xl shadow-xl">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-4 px-7 py-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Bot size={28} />
          </div>

          <div>
            <h1 className="text-xl font-bold leading-tight">
              Smart Productivity
            </h1>

            <p className="text-xs text-slate-400">
              AI Assistant
            </p>
          </div>
        </div>

        {/* Menu */}
        <nav className="px-4 mt-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const active = pathname === item.href;

            return (
              <Link
                key={item.title}
                href={item.href}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                  active
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg"
                    : "hover:bg-white/10"
                }`}
              >
                <Icon size={21} />

                <span className="font-medium">
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* AI Card */}
        <div className="mx-5 mt-10 rounded-3xl bg-gradient-to-br from-violet-700 to-indigo-700 p-5">
          <h3 className="font-bold text-lg">
            AI Assistant
          </h3>

          <p className="text-sm text-violet-100 mt-2">
            Ask anything or capture tasks instantly.
          </p>

          <button className="mt-5 w-full rounded-2xl bg-white text-violet-700 py-3 font-semibold hover:scale-105 transition">
            New Chat
          </button>
        </div>
      </div>

      {/* Profile */}
      <div className="m-5 rounded-2xl bg-white/5 p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-violet-500 flex items-center justify-center font-bold">
          P
        </div>

        <div>
          <p className="font-semibold">
            Pooja
          </p>

          <p className="text-xs text-slate-400">
            Productivity Hero
          </p>
        </div>
      </div>
    </aside>
  );
}