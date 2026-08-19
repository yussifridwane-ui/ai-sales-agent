import { randomBytes } from "crypto";
import { NextRequest } from "next/server";

export function newRequestId() {
  return randomBytes(8).toString("hex");
}

export function requestIdFrom(req: NextRequest) {
  return req.headers.get("x-request-id")?.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64) || newRequestId();
}

export function allowedOrigins() {
  const app = process.env.APP_URL || "";
  const extras = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [app, ...extras].filter(Boolean);
}

export function originAllowed(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const host = req.nextUrl.host;
    const o = new URL(origin);
    if (o.host === host) return true;
    return allowedOrigins().some((allowed) => {
      try {
        return new URL(allowed).host === o.host;
      } catch {
        return allowed === origin;
      }
    });
  } catch {
    return false;
  }
}

export function isMutation(method: string) {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
}
