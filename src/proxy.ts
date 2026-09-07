import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { supabase, response } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);

    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/management/:path*"],
};
