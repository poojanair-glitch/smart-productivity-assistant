"use client";

import {
  CheckSquare,
  ListTodo,
  StickyNote,
  CheckCircle2,
} from "lucide-react";

const stats = [
  {
    title: "Tasks",
    value: 16,
    subtitle: "Total Tasks",
    color: "bg-violet-100 text-violet-600",
    icon: CheckSquare,
  },
  {
    title: "To-Do",
    value: 8,
    subtitle: "Pending Items",
    color: "bg-green-100 text-green-600",
    icon: ListTodo,
  },
  {
    title: "Notes",
    value: 24,
    subtitle: "Total Notes",
    color: "bg-amber-100 text-amber-600",
    icon: StickyNote,
  },
  {
    title: "Completed",
    value: 12,
    subtitle: "Tasks Done",
    color: "bg-blue-100 text-blue-600",
    icon: CheckCircle2,
  },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-4 gap-6 mt-8">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                  <Icon size={22} />
                </div>

                <h3 className="mt-5 text-4xl font-bold text-slate-900">
                  {item.value}
                </h3>

                <p className="mt-1 text-slate-500">
                  {item.subtitle}
                </p>
              </div>

              <div className="text-slate-400 font-medium">
                {item.title}
              </div>
            </div>

            <div className="mt-6 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-violet-500"
                style={{
                  width: `${Math.min(item.value * 4, 100)}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}