"use client";

export default function RightSidebar() {
  return (
    <div className="space-y-6">

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4">
          Upcoming Reminders
        </h3>

        <ul className="space-y-3 text-slate-600">
          <li>📅 Team meeting - 2 PM</li>
          <li>📞 Call client - 4 PM</li>
          <li>📝 Submit report - Tomorrow</li>
        </ul>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4">
          Recent Notes
        </h3>

        <ul className="space-y-3 text-slate-600">
          <li>Project ideas</li>
          <li>Shopping list</li>
          <li>Meeting summary</li>
        </ul>
      </div>

      <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl p-6 text-white">
        <h3 className="font-bold text-xl">
          AI Summary
        </h3>

        <p className="mt-3 text-sm text-violet-100">
          You completed 12 tasks this week. Keep your momentum going by
          finishing your remaining high-priority items.
        </p>
      </div>

    </div>
  );
}