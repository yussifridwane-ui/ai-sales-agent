import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.platformRole !== "admin") redirect("/app/dashboard");
  return (
    <div className="min-h-screen bg-[#07090f]">
      <header className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <div className="font-semibold text-amber-200">Admin · AI Sales Agent</div>
        <nav className="flex gap-4 text-sm text-slate-400">
          <Link href="/admin">Overview</Link>
          <Link href="/admin/users">Users</Link>
          <Link href="/admin/organizations">Orgs</Link>
          <Link href="/admin/subscriptions">Subs</Link>
          <Link href="/admin/analytics">Analytics</Link>
          <Link href="/admin/logs">Logs</Link>
          <Link href="/app/dashboard">App</Link>
        </nav>
      </header>
      <div className="p-6">{children}</div>
    </div>
  );
}
