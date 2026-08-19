import { NextRequest } from "next/server";
import { z } from "zod";
import { loginUser } from "@/lib/auth";
import { jsonError, jsonOk, clientIp } from "@/lib/api-guard";
import { rateLimit } from "@/lib/rate-limit";
import { getMembership } from "@/lib/tenant";
import { AppError } from "@/lib/errors";

const schema = z.object({ email: z.string().email(), password: z.string().min(1).max(200) });

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(`login:${clientIp(req)}`, 8, 60_000);
    if (!limited.ok) throw new AppError("rate_limited", "Trop de tentatives. Réessayez plus tard.", 429);
    const body = schema.parse(await req.json());
    const user = await loginUser(body.email, body.password, clientIp(req), req.headers.get("user-agent") || undefined);
    const membership = await getMembership(user.id);
    return jsonOk({
      user: { id: user.id, email: user.email, name: user.name, platformRole: user.platformRole, mfaEnabled: user.mfaEnabled },
      onboardingRequired: !membership?.organization.onboardingDone,
    });
  } catch (e) {
    return jsonError(e);
  }
}
