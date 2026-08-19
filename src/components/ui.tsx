import Link from "next/link";
import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "ok" | "warn" | "danger" | "accent" | "ai";
}) {
  const map = {
    muted: "bg-[var(--bg-soft)] text-[var(--muted)] border-[var(--line)]",
    ok: "bg-[var(--ok-bg)] text-[var(--ok)] border-transparent",
    warn: "bg-[var(--warn-bg)] text-[var(--warn)] border-transparent",
    danger: "bg-[var(--danger-bg)] text-[var(--danger)] border-transparent",
    accent: "bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)] border-transparent",
    ai: "bg-[color-mix(in_srgb,var(--ai)_12%,transparent)] text-[var(--ai)] border-transparent",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  text,
  actionHref,
  actionLabel,
}: {
  title: string;
  text: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="card p-10 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--bg-soft)] text-[var(--ai)]" aria-hidden>
        ◇
      </div>
      <h3>{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">{text}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn btn-primary mt-6">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className="caption uppercase tracking-wide">{label}</div>
        {icon ? <span aria-hidden>{icon}</span> : null}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      {hint ? <div className="mt-1 text-xs text-[var(--muted)]">{hint}</div> : null}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      {children}
    </label>
  );
}

export function Alert({
  tone = "info",
  title,
  children,
  action,
}: {
  tone?: "ok" | "info" | "warn" | "danger";
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  const icon = { ok: "✓", info: "ℹ", warn: "!", danger: "!" }[tone];
  const cls = {
    ok: "toast-ok",
    info: "bg-[var(--bg-soft)]",
    warn: "toast-err".replace("err", "ok") && "bg-[var(--warn-bg)] text-[var(--warn)]",
    danger: "toast-err",
  }[tone];
  return (
    <div className={`card flex items-start gap-3 p-4 ${cls}`} role={tone === "danger" ? "alert" : "status"}>
      <span aria-hidden className="mt-0.5 font-bold">
        {icon}
      </span>
      <div className="flex-1">
        <div className="font-medium">{title}</div>
        {children ? <div className="mt-1 text-sm opacity-90">{children}</div> : null}
      </div>
      {action}
    </div>
  );
}

export function Skeleton({ className = "h-4 w-full" }: { className?: string }) {
  return <div className={`sk ${className}`} aria-hidden />;
}
