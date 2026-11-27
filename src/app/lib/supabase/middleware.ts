
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const REMEMBER_COOKIE = "pro-sota-remember-me";
const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30;

export function createClient(request: NextRequest) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  const rememberMe =
    request.cookies.get(REMEMBER_COOKIE)?.value === "1";

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookieOptions: {
        maxAge: rememberMe ? REMEMBER_MAX_AGE : undefined,
      },

      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          // Synchronize refreshed cookies with this request.
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          // Rebuild the response while preserving request headers.
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          // Forward refreshed cookies with their options.
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
