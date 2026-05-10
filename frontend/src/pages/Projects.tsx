import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { FolderKanban, Plus, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { SkeletonRows } from "../components/ui/Skeleton";
import { api, unwrap } from "../lib/api";
import { projectSchema } from "../lib/schemas";
import { Project } from "../types/domain";

export function Projects() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["projects"], queryFn: () => unwrap<Project[]>(api.get("/api/projects")) });
  const mutation = useMutation({ mutationFn: (values: z.infer<typeof projectSchema>) => unwrap<Project>(api.post("/api/projects", values)), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["projects"] }); setOpen(false); } });
  const form = useForm<z.infer<typeof projectSchema>>({ resolver: zodResolver(projectSchema), defaultValues: { name: "", description: "" } });

  return (
    <div className="space-y-6">
      <div className="surface rounded-lg p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Portfolio</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Projects</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--text-secondary)]">Create focused workspaces, assign members, and keep every delivery track visible.</p>
          </div>
        <button className="btn" onClick={() => setOpen(true)}><Plus size={16} />New Project</button>
        </div>
      </div>
      {isLoading ? <SkeletonRows rows={6} /> : data?.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      ) : <EmptyState title="No projects" text="Create your first project to start coordinating tasks." action={<button className="btn" onClick={() => setOpen(true)}><Plus size={16} />New Project</button>} />}
      {open && <Modal title="New Project" onClose={() => setOpen(false)}>
        <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <input className="input" placeholder="Project name" {...form.register("name")} />
          <textarea className="input min-h-28" placeholder="Description" {...form.register("description")} />
          <button className="btn w-full" disabled={mutation.isPending}>{mutation.isPending ? "Creating..." : "Create project"}</button>
        </form>
      </Modal>}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const total = project.tasks.length;
  const done = project.tasks.filter((task) => task.status === "DONE").length;
  const progress = total ? Math.round((done / total) * 100) : 0;
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link to={`/projects/${project.id}`} className="surface block rounded-lg p-5 transition hover:border-[color:var(--border-hover)]">
        <div className="flex items-start justify-between gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-blue-50 text-blue-700"><FolderKanban size={21} /></div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{progress}% complete</span>
        </div>
        <h3 className="mt-5 text-xl font-bold tracking-tight">{project.name}</h3>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-6 text-[color:var(--text-secondary)]">{project.description}</p>
        <div className="mt-5 flex -space-x-2">{project.members.slice(0, 5).map((m) => <div key={m.id} className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-teal-700 text-xs font-semibold text-white">{m.user.name[0]}</div>)}</div>
        <div className="mt-5 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} /></div>
        <div className="mt-4 flex items-center justify-between text-xs font-medium text-[color:var(--text-secondary)]"><span className="inline-flex items-center gap-1"><Users size={14} />{project.members.length} members</span><span>{format(new Date(project.createdAt), "MMM d, yyyy")}</span></div>
      </Link>
    </motion.div>
  );
}
