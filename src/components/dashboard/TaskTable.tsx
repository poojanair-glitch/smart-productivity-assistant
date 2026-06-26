"use client";

export default function TaskTable() {
  const tasks = [
    {
      title: "Finish UI redesign",
      priority: "High",
      status: "In Progress",
      due: "Today",
    },
    {
      title: "Review Gemini integration",
      priority: "Medium",
      status: "Pending",
      due: "Tomorrow",
    },
    {
      title: "Prepare project presentation",
      priority: "Low",
      status: "Completed",
      due: "Friday",
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">My Tasks</h2>

        <button className="bg-violet-600 text-white px-4 py-2 rounded-xl hover:bg-violet-700 transition">
          + New Task
        </button>
      </div>

      <table className="w-full">
        <thead className="text-left text-slate-500">
          <tr>
            <th className="pb-4">Task</th>
            <th className="pb-4">Priority</th>
            <th className="pb-4">Status</th>
            <th className="pb-4">Due</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((task) => (
            <tr key={task.title} className="border-t border-slate-100">
              <td className="py-4">{task.title}</td>
              <td>{task.priority}</td>
              <td>{task.status}</td>
              <td>{task.due}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}