
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Generate a unique nonce for every request.
    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

    const isDevelopment = process.env.NODE_ENV === "development";

    const csp = [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ""}`,
        `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
        "img-src 'self' data: blob: https:",
        "font-src 'self' data: https://fonts.gstatic.com",
        "connect-src 'self' https://xwmkjdemnoxixetzlhaz.supabase.co wss://xwmkjdemnoxixetzlhaz.supabase.co",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests",
    ].join("; ");

    // Pass CSP to Next.js so it can apply the nonce.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("Content-Security-Policy", csp);

    const requestWithCsp = new NextRequest(request, {
        headers: requestHeaders,
    });

    let response: NextResponse;

    // Preserve existing Supabase authentication.
    if (
        pathname === "/management" ||
        pathname.startsWith("/management/")
    ) {
        const session = createClient(requestWithCsp);

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
    } else {
        response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    // Security response headers.
    response.headers.set("Content-Security-Policy", csp);
    response.headers.set("X-CSP-Proxy", "executed");

    response.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
    );

    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");

    response.headers.set(
        "Referrer-Policy",
        "strict-origin-when-cross-origin"
    );

    response.headers.set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()"
    );

    response.headers.set(
        "Cross-Origin-Opener-Policy",
        "same-origin"
    );

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
    ],
};
