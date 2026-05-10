import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle2, Clock3, ListTodo } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion, useMotionValue, animate, useTransform } from "framer-motion";
import { useEffect } from "react";
import { api, unwrap } from "../lib/api";
import { Task } from "../types/domain";
import { SkeletonRows } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";

type DashboardData = { stats: { total: number; inProgress: number; completed: number; overdue: number }; byStatus: { status: string; count: number }[]; tasks: Task[] };

export function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: () => unwrap<DashboardData>(api.get("/api/tasks/dashboard")) });
  if (isLoading) return <SkeletonRows rows={6} />;
  if (!data || data.tasks.length === 0) return <EmptyState title="No tasks yet" text="Create a project and add tasks to populate dashboard metrics." />;

  const stats = [
    { label: "Total Tasks", value: data.stats.total, icon: ListTodo, color: "text-indigo-300" },
    { label: "In Progress", value: data.stats.inProgress, icon: Clock3, color: "text-amber-300" },
    { label: "Completed", value: data.stats.completed, icon: CheckCircle2, color: "text-emerald-300" },
    { label: "Overdue", value: data.stats.overdue, icon: AlertTriangle, color: "text-red-300" }
  ];

  return (
    <div className="space-y-6">
      <div className="surface overflow-hidden rounded-lg p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Operations overview</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Delivery command center</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--text-secondary)]">Monitor task load, completion rate, overdue pressure, and active project execution from live workspace data.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-sm">
            <div className="rounded-md bg-white p-3 shadow-sm"><p className="text-[color:var(--text-muted)]">Completion</p><p className="text-xl font-bold">{Math.round((data.stats.completed / data.stats.total) * 100)}%</p></div>
            <div className="rounded-md bg-white p-3 shadow-sm"><p className="text-[color:var(--text-muted)]">Overdue</p><p className="text-xl font-bold text-red-600">{data.stats.overdue}</p></div>
          </div>
        </div>
      </div>
      <motion.div variants={{ show: { transition: { staggerChildren: 0.05 } } }} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </motion.div>
      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <div className="surface rounded-lg p-5">
          <h2 className="mb-1 text-xl font-bold tracking-tight">Tasks by status</h2>
          <p className="mb-4 text-sm text-[color:var(--text-secondary)]">Current distribution across the project pipeline.</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byStatus}><XAxis dataKey="status" stroke="#64748b" /><YAxis stroke="#64748b" allowDecimals={false} /><Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #d8e0ea", borderRadius: 8, color: "#0f172a" }} /><Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="surface overflow-hidden rounded-lg">
          <div className="border-b border-[color:var(--border)] p-5"><h2 className="text-xl font-bold tracking-tight">Recent tasks</h2><p className="mt-1 text-sm text-[color:var(--text-secondary)]">Latest work items across projects.</p></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase text-[color:var(--text-muted)]"><tr><th className="p-4">Title</th><th>Project</th><th>Priority</th><th>Due</th><th>Status</th></tr></thead>
              <tbody>
                {data.tasks.slice(0, 8).map((task) => (
                  <tr key={task.id} className={`border-t border-[color:var(--border)] transition hover:bg-slate-50 ${task.overdue ? "bg-red-50 text-red-950" : ""}`}>
                    <td className="p-4 font-medium">{task.overdue ? <AlertTriangle className="mr-2 inline" size={15} /> : null}{task.title}</td>
                    <td className="text-[color:var(--text-secondary)]">{task.project?.name}</td>
                    <td><Badge value={task.priority} /></td>
                    <td>{format(new Date(task.dueDate), "MMM d, yyyy")}</td>
                    <td><Badge value={task.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, Math.round);
  useEffect(() => { const controls = animate(mv, value, { duration: 1 }); return controls.stop; }, [mv, value]);
  return <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} whileHover={{ y: -3 }} className="surface rounded-lg p-5"><div className="grid h-11 w-11 place-items-center rounded-md bg-slate-50"><Icon className={color} /></div><motion.p className="mt-4 text-3xl font-bold tracking-tight">{rounded}</motion.p><p className="text-sm font-medium text-[color:var(--text-secondary)]">{label}</p></motion.div>;
}

export function Badge({ value }: { value: string }) {
  const tone = value.includes("HIGH") || value.includes("TODO") || value.includes("OVERDUE") ? "text-red-700 bg-red-50 border-red-200" : value.includes("DONE") || value.includes("LOW") ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-amber-700 bg-amber-50 border-amber-200";
  return <span className={`chip ${tone}`}><span className="h-2 w-2 rounded-full bg-current" />{value.replace("_", " ")}</span>;
}
