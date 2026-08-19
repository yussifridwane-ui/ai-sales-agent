import { NextRequest, NextResponse } from "next/server";

const PUBLIC = [
  "/",
  "/pricing",
  "/features",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/privacy",
  "/terms",
  "/cookies",
  "/security",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("ais_session")?.value;

  if (pathname.startsWith("/app") || pathname.startsWith("/onboarding") || pathname.startsWith("/admin")) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if ((pathname === "/login" || pathname === "/register") && token) {
    const url = req.nextUrl.clone();
    url.pathname = "/app/dashboard";
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  if (pathname.startsWith("/w/") || pathname === "/widget.js") {
    res.headers.set("Content-Security-Policy", "frame-ancestors *");
    res.headers.set("X-Frame-Options", "ALLOWALL");
  }
  void PUBLIC;
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/webhooks|api/widget).*)"],
};
