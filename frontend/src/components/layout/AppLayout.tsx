import { Bell, FolderKanban, LayoutDashboard, LogOut, Search, Sparkles } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/auth";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban }
];

export function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const title = location.pathname.startsWith("/projects") ? "Projects" : "Dashboard";

  return (
    <div className="min-h-screen">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-20 border-r border-[color:var(--border)] bg-white/90 backdrop-blur-xl md:block xl:w-72">
        <div className="flex h-full flex-col p-4">
          <div className="mb-7 flex items-center gap-3 px-1">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-slate-950 font-bold text-white shadow-sm">TM</div>
            <div className="hidden xl:block">
              <span className="block text-base font-bold tracking-tight">Task Manager</span>
              <span className="text-xs font-medium text-[color:var(--text-muted)]">Team operations suite</span>
            </div>
          </div>
          <div className="mb-6 hidden rounded-md border border-blue-100 bg-blue-50 p-3 text-blue-950 xl:block">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Sparkles size={16} />Workspace health</div>
            <p className="text-xs leading-5 text-blue-800">Track projects, blockers, and ownership from one command center.</p>
          </div>
          <nav className="space-y-1">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold transition ${isActive ? "bg-slate-950 text-white shadow-sm" : "text-[color:var(--text-secondary)] hover:bg-slate-100 hover:text-[color:var(--text-primary)]"}`}>
                <item.icon size={20} /><span className="hidden xl:inline">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto">
            <div className="mb-3 flex items-center gap-3 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-elevated)] p-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal-700 text-sm font-semibold text-white">{user?.name.slice(0, 1)}</div>
              <div className="hidden min-w-0 xl:block">
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <p className="truncate text-xs text-[color:var(--text-secondary)]">{user?.email}</p>
              </div>
            </div>
            <button className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold text-[color:var(--text-secondary)] hover:bg-slate-100 hover:text-[color:var(--text-primary)]" onClick={() => { logout(); navigate("/login"); }}>
              <LogOut size={20} /><span className="hidden xl:inline">Logout</span>
            </button>
          </div>
        </div>
      </aside>
      <main className="pb-20 md:ml-20 md:pb-0 xl:ml-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[color:var(--border)] bg-white/85 px-4 backdrop-blur-xl lg:px-8">
          <div>
            <h1 className="text-xl font-bold tracking-tight">{title}</h1>
            <p className="text-xs font-medium text-[color:var(--text-secondary)]">Workspace / {title}</p>
          </div>
          <div className="hidden w-full max-w-sm items-center gap-2 rounded-md border border-[color:var(--border)] bg-white px-3 py-2 text-sm text-[color:var(--text-muted)] lg:flex">
            <Search size={16} />
            <span>Search projects, tasks, people</span>
          </div>
          <button className="icon-btn" aria-label="Notifications">
            <Bell size={18} />
          </button>
        </header>
        <motion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: "easeOut" }} className="mx-auto max-w-7xl p-4 lg:p-8">
          <Outlet />
        </motion.div>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-2 border-t border-[color:var(--border)] bg-white/95 p-2 backdrop-blur-xl md:hidden">
        {nav.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex flex-col items-center rounded-md py-2 text-xs font-semibold ${isActive ? "bg-slate-950 text-white" : "text-[color:var(--text-secondary)]"}`}><item.icon size={20} />{item.label}</NavLink>)}
      </nav>
    </div>
  );
}
