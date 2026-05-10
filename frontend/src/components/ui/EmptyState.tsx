import { ReactNode } from "react";

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="surface flex min-h-[320px] flex-col items-center justify-center rounded-lg p-8 text-center">
      <svg className="mb-5 h-28 w-28 text-blue-500/70" viewBox="0 0 160 160" fill="none" aria-hidden="true">
        <rect x="34" y="38" width="92" height="84" rx="14" fill="currentColor" opacity=".16" />
        <path d="M55 65h50M55 82h36M55 99h28" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <circle cx="114" cy="48" r="18" fill="#0f766e" opacity=".9" />
      </svg>
      <h3 className="text-xl font-bold tracking-tight">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-[color:var(--text-secondary)]">{text}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
