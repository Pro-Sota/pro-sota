
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Generate a unique nonce for every request.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  const supabaseOrigin = new URL(supabaseUrl).origin;

  const supabaseWsOrigin = supabaseOrigin
    .replace(/^https:/, "wss:")
    .replace(/^http:/, "ws:");

  const isDevelopment = process.env.NODE_ENV === "development";

  // Content Security Policy.
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "script-src-attr 'none'",
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
    "style-src-attr 'none'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src 'self' ${supabaseOrigin} ${supabaseWsOrigin}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  // Forward CSP and nonce to Next.js.
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("Content-Security-Policy", csp);
  requestHeaders.set("x-nonce", nonce);

  const requestWithCsp = new NextRequest(request, {
    headers: requestHeaders,
  });

  const isManagementRoute =
    pathname === "/management" ||
    pathname.startsWith("/management/");

  let response: NextResponse;

  if (isManagementRoute) {
    const session = createClient(requestWithCsp);

    const {
      data: { user },
      error,
    } = await session.supabase.auth.getUser();

    // Unexpected authentication errors should not be
    // silently interpreted as a normal logout.
    if (
      error &&
      error.name !== "AuthSessionMissingError" &&
      !user
    ) {
      console.error("Supabase proxy auth error:", error);
    }

    response = session.response;

    if (!user) {
      const loginUrl = new URL("/login", request.url);

      loginUrl.searchParams.set(
        "redirectTo",
        `${pathname}${request.nextUrl.search}`,
      );

      const redirectResponse = NextResponse.redirect(loginUrl);

      // Preserve all Supabase cookies and their options.
      for (const cookie of response.cookies.getAll()) {
        redirectResponse.cookies.set(cookie);
      }

      response = redirectResponse;
    }
  } else {
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Apply CSP to every response, including redirects.
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
