import { NextRequest } from "next/server";
import { verifyEmailToken } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api-guard";

export async function POST(req: NextRequest) {
  try {
    const { token } = (await req.json()) as { token?: string };
    if (!token) return jsonError(new Error("invalid"));
    await verifyEmailToken(token);
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
