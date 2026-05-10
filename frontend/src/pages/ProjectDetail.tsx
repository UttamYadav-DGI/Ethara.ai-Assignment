import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertTriangle, CalendarDays, Plus, Trash2, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { SkeletonRows } from "../components/ui/Skeleton";
import { api, unwrap } from "../lib/api";
import { memberSchema, projectSchema, taskSchema } from "../lib/schemas";
import { Priority, Project, Status, Task } from "../types/domain";
import { Badge } from "./Dashboard";
import { TaskPanel } from "./TaskPanel";

export function ProjectDetail() {
  const { id = "" } = useParams();
  const [tab, setTab] = useState<"tasks" | "members">("tasks");
  const [modal, setModal] = useState<"task" | "member" | "edit" | null>(null);
  const [selected, setSelected] = useState<Task | null>(null);
  const [filters, setFilters] = useState<{ status?: Status; priority?: Priority; assignee?: string }>({});
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: project, isLoading } = useQuery({ queryKey: ["project", id], queryFn: () => unwrap<Project>(api.get(`/api/projects/${id}`)), enabled: !!id });
  const { data: tasks } = useQuery({ queryKey: ["project", id, "tasks", filters], queryFn: () => unwrap<Task[]>(api.get(`/api/projects/${id}/tasks`, { params: filters })), enabled: !!id });
  const isAdmin = project?.currentUserProjectRole === "ADMIN";
  const invalidate = () => { queryClient.invalidateQueries({ queryKey: ["project", id] }); queryClient.invalidateQueries({ queryKey: ["project", id, "tasks"] }); queryClient.invalidateQueries({ queryKey: ["dashboard"] }); };
  const deleteProject = useMutation({ mutationFn: () => unwrap(api.delete(`/api/projects/${id}`)), onSuccess: () => navigate("/projects") });

  if (isLoading) return <SkeletonRows rows={6} />;
  if (!project) return <EmptyState title="Project not found" text="The project is unavailable or you do not have access." />;

  return (
    <div className="space-y-6">
      <div className="surface rounded-lg p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Project workspace</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">{project.name}</h2>
            <p className="mt-2 max-w-3xl leading-6 text-[color:var(--text-secondary)]">{project.description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-medium text-[color:var(--text-secondary)]">
              <span className="inline-flex items-center gap-2"><Users size={16} />{project.members.length} members</span>
              <span className="inline-flex items-center gap-2"><CalendarDays size={16} />Created {format(new Date(project.createdAt), "MMM d, yyyy")}</span>
              <div className="flex -space-x-2">{project.members.map((m) => <div key={m.id} className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-teal-700 text-xs font-semibold text-white">{m.user.name[0]}</div>)}</div>
            </div>
          </div>
          {isAdmin ? <div className="flex gap-2"><button className="btn-secondary" onClick={() => setModal("edit")}>Edit</button><button className="btn-danger" onClick={() => deleteProject.mutate()}><Trash2 size={16} />Delete</button></div> : null}
        </div>
      </div>
      <div className="flex gap-2 border-b border-[color:var(--border)]">
        {(["tasks", "members"] as const).map((item) => <button key={item} onClick={() => setTab(item)} className={`px-4 py-3 text-sm font-semibold capitalize transition ${tab === item ? "border-b-2 border-blue-600 text-blue-700" : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"}`}>{item}</button>)}
      </div>
      {tab === "tasks" ? <TasksTab project={project} tasks={tasks || []} filters={filters} setFilters={setFilters} onAdd={() => setModal("task")} onSelect={setSelected} /> : <MembersTab project={project} isAdmin={isAdmin} onAdd={() => setModal("member")} onDone={invalidate} />}
      {modal === "task" && <TaskModal project={project} onClose={() => setModal(null)} onDone={invalidate} />}
      {modal === "member" && <MemberModal project={project} onClose={() => setModal(null)} onDone={invalidate} />}
      {modal === "edit" && <EditProjectModal project={project} onClose={() => setModal(null)} onDone={invalidate} />}
      {selected && <TaskPanel task={selected} project={project} isAdmin={isAdmin} onClose={() => setSelected(null)} onDone={invalidate} />}
    </div>
  );
}

function TasksTab({ project, tasks, filters, setFilters, onAdd, onSelect }: { project: Project; tasks: Task[]; filters: any; setFilters: (f: any) => void; onAdd: () => void; onSelect: (t: Task) => void }) {
  return (
    <div className="space-y-4">
      <div className="surface flex flex-col gap-3 rounded-lg p-4 lg:flex-row">
        <select className="input" value={filters.status || ""} onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}><option value="">All statuses</option><option>TODO</option><option>IN_PROGRESS</option><option>DONE</option></select>
        <select className="input" value={filters.priority || ""} onChange={(e) => setFilters({ ...filters, priority: e.target.value || undefined })}><option value="">All priorities</option><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select>
        <select className="input" value={filters.assignee || ""} onChange={(e) => setFilters({ ...filters, assignee: e.target.value || undefined })}><option value="">All assignees</option>{project.members.map((m) => <option key={m.userId} value={m.userId}>{m.user.name}</option>)}</select>
        <button className="btn shrink-0" onClick={onAdd}><Plus size={16} />Add Task</button>
      </div>
      {tasks.length ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {(["TODO", "IN_PROGRESS", "DONE"] as Status[]).map((status) => {
            const columnTasks = tasks.filter((t) => t.status === status);
            return (
              <div key={status} className="surface min-h-80 rounded-lg p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold tracking-tight">{status.replace("_", " ")}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{columnTasks.length}</span>
                </div>
                <div className="space-y-3">
                  {columnTasks.map((task) => (
                    <motion.button whileHover={{ y: -2 }} key={task.id} className="w-full rounded-lg border border-[color:var(--border)] bg-white p-4 text-left shadow-sm transition hover:border-[color:var(--border-hover)] hover:shadow-md" onClick={() => onSelect(task)}>
                      <div className="flex items-start justify-between gap-3"><p className="font-semibold leading-5">{task.title}</p>{task.overdue ? <AlertTriangle className="text-red-600" size={16} /> : null}</div>
                      <p className="mt-2 line-clamp-2 text-sm text-[color:var(--text-secondary)]">{task.description}</p>
                      <div className="mt-4 flex items-center justify-between"><Badge value={task.priority} /><span className="text-xs font-medium text-[color:var(--text-secondary)]">{task.assignee.name[0]} - {format(new Date(task.dueDate), "MMM d")}</span></div>
                    </motion.button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : <EmptyState title="No tasks" text="Add a task to start moving work through the board." action={<button className="btn" onClick={onAdd}><Plus size={16} />Add Task</button>} />}
    </div>
  );
}

function MembersTab({ project, isAdmin, onAdd, onDone }: { project: Project; isAdmin: boolean; onAdd: () => void; onDone: () => void }) {
  const remove = useMutation({ mutationFn: (userId: string) => unwrap(api.delete(`/api/projects/${project.id}/members/${userId}`)), onSuccess: onDone });
  return <div className="surface rounded-lg"><div className="flex items-center justify-between border-b border-[color:var(--border)] p-5"><h3 className="text-xl font-bold tracking-tight">Members</h3>{isAdmin ? <button className="btn" onClick={onAdd}><Plus size={16} />Add Member</button> : null}</div>{project.members.map((m) => <div key={m.id} className="flex items-center justify-between border-b border-[color:var(--border)] p-5 last:border-0"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-teal-700 text-sm font-semibold text-white">{m.user.name[0]}</div><div><p className="font-semibold">{m.user.name}</p><p className="text-sm text-[color:var(--text-secondary)]">{m.user.email}</p></div></div><div className="flex items-center gap-3"><Badge value={m.role} />{isAdmin ? <button className="icon-btn text-red-600 hover:bg-red-50" onClick={() => remove.mutate(m.userId)}><Trash2 size={16} /></button> : null}</div></div>)}</div>;
}

function TaskModal({ project, onClose, onDone }: { project: Project; onClose: () => void; onDone: () => void }) {
  const form = useForm<z.infer<typeof taskSchema>>({ resolver: zodResolver(taskSchema), defaultValues: { title: "", description: "", status: "TODO", priority: "MEDIUM", dueDate: "", assigneeId: project.members[0]?.userId } });
  const mutation = useMutation({ mutationFn: (v: z.infer<typeof taskSchema>) => unwrap(api.post(`/api/projects/${project.id}/tasks`, v)), onSuccess: () => { onDone(); onClose(); } });
  return <Modal title="Add Task" onClose={onClose}><TaskForm form={form} members={project.members} onSubmit={(v) => mutation.mutate(v)} loading={mutation.isPending} /></Modal>;
}

function MemberModal({ project, onClose, onDone }: { project: Project; onClose: () => void; onDone: () => void }) {
  const form = useForm<z.infer<typeof memberSchema>>({ resolver: zodResolver(memberSchema), defaultValues: { email: "" } });
  const mutation = useMutation({ mutationFn: (v: z.infer<typeof memberSchema>) => unwrap(api.post(`/api/projects/${project.id}/members`, v)), onSuccess: () => { onDone(); onClose(); } });
  return <Modal title="Add Member" onClose={onClose}><form className="space-y-4" onSubmit={form.handleSubmit((v) => mutation.mutate(v))}><input className="input" placeholder="member@example.com" {...form.register("email")} /><button className="btn w-full" disabled={mutation.isPending}>Add member</button></form></Modal>;
}

function EditProjectModal({ project, onClose, onDone }: { project: Project; onClose: () => void; onDone: () => void }) {
  const form = useForm<z.infer<typeof projectSchema>>({ resolver: zodResolver(projectSchema), defaultValues: { name: project.name, description: project.description } });
  const mutation = useMutation({ mutationFn: (v: z.infer<typeof projectSchema>) => unwrap(api.put(`/api/projects/${project.id}`, v)), onSuccess: () => { onDone(); onClose(); } });
  return <Modal title="Edit Project" onClose={onClose}><form className="space-y-4" onSubmit={form.handleSubmit((v) => mutation.mutate(v))}><input className="input" {...form.register("name")} /><textarea className="input min-h-28" {...form.register("description")} /><button className="btn w-full">Save changes</button></form></Modal>;
}

export function TaskForm({ form, members, onSubmit, loading }: { form: any; members: Project["members"]; onSubmit: (v: any) => void; loading?: boolean }) {
  return <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}><input className="input" placeholder="Title" {...form.register("title")} /><textarea className="input min-h-28" placeholder="Description" {...form.register("description")} /><div className="grid gap-3 sm:grid-cols-2"><select className="input" {...form.register("status")}><option>TODO</option><option>IN_PROGRESS</option><option>DONE</option></select><select className="input" {...form.register("priority")}><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></div><div className="grid gap-3 sm:grid-cols-2"><select className="input" {...form.register("assigneeId")}>{members.map((m) => <option key={m.userId} value={m.userId}>{m.user.name}</option>)}</select><input className="input" type="datetime-local" {...form.register("dueDate")} /></div><button className="btn w-full" disabled={loading}>{loading ? "Saving..." : "Save task"}</button></form>;
}
