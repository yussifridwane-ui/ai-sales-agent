import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getMembership } from "@/lib/tenant";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const membership = await getMembership(user.id);
  if (!membership?.organization.onboardingDone) redirect("/onboarding");
  return (
    <AppShell
      orgName={membership.organization.name}
      isDemo={membership.organization.isDemo}
      isAdmin={user.platformRole === "admin"}
    >
      {children}
    </AppShell>
  );
}
