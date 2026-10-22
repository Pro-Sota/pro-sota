// src/app/lib/supabase/middleware.ts

import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export function createClient(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          // Update request cookies so subsequent server-side
          // operations in this request see the refreshed session.
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          // Rebuild the response while preserving request headers.
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          // Forward refreshed cookies to the browser.
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  return {
    supabase,
    get response() {
      return response;
    },
  };
}