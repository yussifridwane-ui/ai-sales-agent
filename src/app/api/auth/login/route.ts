import { NextRequest } from "next/server";
import { z } from "zod";
import { loginUser } from "@/lib/auth";
import { jsonError, jsonOk, clientIp } from "@/lib/api-guard";
import { rateLimit } from "@/lib/rate-limit";
import { getMembership } from "@/lib/tenant";

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(`login:${clientIp(req)}`, 10, 60_000);
    if (!limited.ok) return jsonError({ message: "Trop de tentatives." });
    const body = schema.parse(await req.json());
    const user = await loginUser(body.email, body.password, clientIp(req), req.headers.get("user-agent") || undefined);
    const membership = await getMembership(user.id);
    return jsonOk({
      user: { id: user.id, email: user.email, name: user.name, platformRole: user.platformRole },
      onboardingRequired: !membership?.organization.onboardingDone,
    });
  } catch (e) {
    return jsonError(e);
  }
}
