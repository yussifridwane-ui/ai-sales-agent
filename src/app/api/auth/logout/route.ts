import { NextRequest } from "next/server";
import { destroyAllSessions, destroySession, getSessionUser } from "@/lib/auth";
import { jsonOk } from "@/lib/api-guard";
import { audit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "1";
  const user = await getSessionUser();
  if (all && user) {
    await destroyAllSessions(user.id);
    await audit({ userId: user.id, action: "auth.logout_all" });
  } else {
    await destroySession();
    if (user) await audit({ userId: user.id, action: "auth.logout" });
  }
  return jsonOk({ ok: true });
}
