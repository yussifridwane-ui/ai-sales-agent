import { NextRequest } from "next/server";
import { requestPasswordReset } from "@/lib/auth";
import { jsonError, jsonOk, clientIp } from "@/lib/api-guard";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(`forgot:${clientIp(req)}`, 5, 60_000);
    if (!limited.ok) return jsonError(new Error("rate"));
    const { email } = (await req.json()) as { email?: string };
    const token = email ? await requestPasswordReset(email) : undefined;
    return jsonOk({
      ok: true,
      message: "Si un compte existe, un email a été envoyé.",
      demoResetPath: token ? `/reset-password?token=${token}` : undefined,
    });
  } catch (e) {
    return jsonError(e);
  }
}
