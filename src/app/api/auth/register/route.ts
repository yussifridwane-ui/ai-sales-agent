import { NextRequest } from "next/server";
import { z } from "zod";
import { registerUser, createSession } from "@/lib/auth";
import { jsonError, jsonOk, clientIp } from "@/lib/api-guard";
import { rateLimit } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  marketingConsent: z.boolean().optional(),
  locale: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(`register:${clientIp(req)}`, 8, 60_000);
    if (!limited.ok) return jsonError(Object.assign(new Error("rate"), { status: 429 }));
    const body = schema.parse(await req.json());
    const { user, verifyToken } = await registerUser(body);
    await createSession(user.id, clientIp(req), req.headers.get("user-agent") || undefined);
    await audit({ userId: user.id, action: "auth.register" });
    return jsonOk({
      user: { id: user.id, email: user.email, name: user.name },
      needsVerification: true,
      demoVerifyPath: `/verify-email?token=${verifyToken}`,
    }, 201);
  } catch (e) {
    return jsonError(e);
  }
}
