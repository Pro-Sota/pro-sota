import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const isDev = process.env.NODE_ENV === "development";

  const csp = [
  "default-src 'self'",
  `script-src 'self' '${isDev ? " 'unsafe-eval' 'unsafe-inline'"  : `nonce-${nonce}`}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://xwmkjdemnoxixetzlhaz.supabase.co",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

  const response = NextResponse.next();

  response.headers.set(
    "Content-Security-Policy",
    csp
  );

  response.headers.set(
    "x-nonce",
    nonce
  );

  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
    },
  ],
};