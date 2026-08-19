import { NextRequest } from "next/server";
import { jsonError, jsonOk, getAuthFromRequest, clientIp } from "@/lib/api-guard";
import { confirmMfa, enrollMfa, otpauthUrl, verifyTotp } from "@/lib/security/mfa";
import { decryptSecret } from "@/lib/crypto";
import { markSessionMfa } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { audit } from "@/lib/audit";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) throw new AppError("unauthenticated", "Veuillez vous connecter.", 401);
    const body = (await req.json()) as { action?: string; code?: string };
    if (body.action === "enroll") {
      const secret = enrollMfa(auth.user.id);
      await audit({ userId: auth.user.id, action: "mfa.enroll_start", ip: clientIp(req) });
      return jsonOk({ secret, otpauth: otpauthUrl(auth.user.email, secret) });
    }
    if (body.action === "confirm" && body.code) {
      confirmMfa(auth.user.id, body.code);
      const token = req.cookies.get(SESSION_COOKIE)?.value;
      if (token) await markSessionMfa(token);
      await audit({ userId: auth.user.id, action: "mfa.enabled", ip: clientIp(req) });
      return jsonOk({ ok: true });
    }
    if (body.action === "verify" && body.code) {
      if (!auth.user.mfaSecret) throw new AppError("mfa_not_started", "MFA non configuré.", 400);
      const secret = decryptSecret(auth.user.mfaSecret);
      if (!verifyTotp(secret, body.code)) throw new AppError("invalid_mfa", "Code MFA invalide.", 401);
      const token = req.cookies.get(SESSION_COOKIE)?.value;
      if (token) await markSessionMfa(token);
      return jsonOk({ ok: true });
    }
    throw new AppError("invalid_input", "Action MFA invalide.");
  } catch (e) {
    return jsonError(e);
  }
}
