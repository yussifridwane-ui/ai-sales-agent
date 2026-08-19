import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");
  if (token && token === process.env.INSTAGRAM_VERIFY_TOKEN) {
    return new NextResponse(challenge || "", { status: 200 });
  }
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}

export async function POST() {
  return NextResponse.json({
    ok: false,
    status: "requires_setup",
    message: "Connecter Instagram — permissions Meta (pages_messaging, instagram_manage_messages) requises. L'intégration n'est pas active sans connexion réelle.",
  });
}
