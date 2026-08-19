import { NextRequest } from "next/server";
import { resetPassword } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api-guard";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = (await req.json()) as { token?: string; password?: string };
    if (!token || !password) return jsonError(new Error("invalid"));
    await resetPassword(token, password);
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
