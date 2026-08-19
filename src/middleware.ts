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

function securityHeaders(res: NextResponse, pathname: string) {
  const widget = pathname.startsWith("/w/") || pathname === "/widget.js";
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("X-DNS-Prefetch-Control", "off");
  if (process.env.NODE_ENV === "production") {
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  if (widget) {
    res.headers.set("Content-Security-Policy", "frame-ancestors *");
  } else {
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    );
  }
  return res;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("ais_session")?.value;

  if (pathname.startsWith("/app") || pathname.startsWith("/onboarding") || pathname.startsWith("/admin")) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return securityHeaders(NextResponse.redirect(url), pathname);
    }
  }

  if ((pathname === "/login" || pathname === "/register") && token) {
    const url = req.nextUrl.clone();
    url.pathname = "/app/dashboard";
    return securityHeaders(NextResponse.redirect(url), pathname);
  }

  const res = NextResponse.next();
  void PUBLIC;
  return securityHeaders(res, pathname);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
