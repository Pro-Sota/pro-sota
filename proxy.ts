import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
    let response = NextResponse.next();
    const pathname = request.nextUrl.pathname;

    if (
        pathname === "/management" ||
        pathname.startsWith("/management/")
    ) {
        const session = createClient(request);

        const {
            data: { user },
            error,
        } = await session.supabase.auth.getUser();

        if (error) {
            console.error("Supabase proxy auth error:", error);
        }

        response = session.response;

        if (!user) {
            const loginUrl = new URL("/login", request.url);

            loginUrl.searchParams.set(
                "redirectTo",
                `${pathname}${request.nextUrl.search}`
            );

            const redirect = NextResponse.redirect(loginUrl);

            for (const cookie of response.cookies.getAll()) {
                redirect.cookies.set(cookie);
            }

            response = redirect;
        }
    }

    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' https://xwmkjdemnoxixetzlhaz.supabase.co wss://xwmkjdemnoxixetzlhaz.supabase.co",
        "object-src 'none'",
        "base-uri 'self'",
        "frame-ancestors 'none'",
    ].join("; ");

    response.headers.set("Content-Security-Policy", csp);
    response.headers.set("x-nonce", nonce);

    return response;
}

export const config = {
    matcher: ["/management/:path*"],
};