import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { api, unwrap } from "../lib/api";
import { loginSchema, signupSchema } from "../lib/schemas";
import { useAuthStore } from "../store/auth";
import { User } from "../types/domain";

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const schema = mode === "login" ? loginSchema : signupSchema;
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "", ...(mode === "signup" ? { name: "" } : {}) } });

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError("");
    try {
      const data = await unwrap<{ token: string; user: User }>(api.post(`/api/auth/${mode}`, values));
      setAuth(data.user, data.token);
      navigate("/dashboard");
    } catch (error: any) {
      setServerError(error.response?.data?.message || "Authentication failed");
    }
  });

  return (
    <div className="grid min-h-screen bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_42%,#ecfdf5_100%)] lg:grid-cols-[1.08fr_.92fr]">
      <section className="hidden flex-col justify-between p-10 lg:flex">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-slate-950 font-bold text-white">TM</div>
          <div>
            <p className="font-bold tracking-tight">Task Manager</p>
            <p className="text-sm text-[color:var(--text-secondary)]">SaaS workspace operations</p>
          </div>
        </div>
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">Project execution platform</p>
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-slate-950">Run team projects with clear ownership and live delivery signals.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">Plan tasks, assign work, monitor overdue items, and keep project members aligned from one focused operations dashboard.</p>
          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
            {["Role-aware access", "Task health metrics", "Project member control"].map((item) => (
              <div key={item} className="rounded-lg border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur">
                <CheckCircle2 className="mb-3 text-teal-700" size={20} />
                <p className="text-sm font-semibold text-slate-800">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm font-medium text-slate-500">Production-ready workflow for fast-moving teams.</p>
      </section>
      <section className="grid place-items-center p-4">
      <form onSubmit={onSubmit} className={`surface w-full max-w-md rounded-lg p-6 ${serverError ? "animate-[shake_.25s]" : ""}`}>
        <style>{`@keyframes shake{25%{transform:translateX(-5px)}50%{transform:translateX(5px)}75%{transform:translateX(-3px)}}`}</style>
        <div className="mb-6 flex items-center gap-3 lg:hidden">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-slate-950 font-bold text-white">TM</div>
          <span className="font-bold">Task Manager</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{mode === "login" ? "Welcome back" : "Create account"}</h1>
        <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{mode === "login" ? "Sign in to your workspace." : "Start managing projects with your team."}</p>
        <div className="mt-6 space-y-4">
          {mode === "signup" && <Field label="Name" error={(form.formState.errors as any).name?.message}><input className="input" {...form.register("name" as never)} /></Field>}
          <Field label="Email" error={form.formState.errors.email?.message}><input className="input" type="email" {...form.register("email")} /></Field>
          <Field label="Password" error={form.formState.errors.password?.message}>
            <div className="relative">
              <input className="input pr-11" type={showPassword ? "text" : "password"} {...form.register("password")} />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-[color:var(--text-secondary)]" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
        </div>
        {serverError ? <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{serverError}</p> : null}
        <button className="btn mt-6 w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="animate-spin" size={16} /> : null}
          {form.formState.isSubmitting ? (mode === "login" ? "Logging in..." : "Creating account...") : mode === "login" ? "Login" : "Sign up"}
        </button>
        <p className="mt-5 text-center text-sm text-[color:var(--text-secondary)]">
          {mode === "login" ? "Need an account? " : "Already registered? "}
          <Link className="font-semibold text-blue-700" to={mode === "login" ? "/signup" : "/login"}>{mode === "login" ? "Sign up" : "Login"}</Link>
        </p>
      </form>
      </section>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium">{label}<div className="mt-2">{children}</div>{error ? <p className="mt-1 text-xs text-red-300">{error}</p> : null}</label>;
}
