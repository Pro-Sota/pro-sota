
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import {
  Manrope,
  IBM_Plex_Mono,
} from "next/font/google";

import DashboardLayoutClient from "./dashboard_layout";

import { createClient } from "@/app/lib/supabase/server";
import { getCurrentUserPermissions } from "@/app/lib/permissions/server";
import PermissionProvider from "@/app/components/permission_provider";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body-face",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono-face",
  display: "swap",
  weight: ["400", "500", "600"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Management | PRO SOTA",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize the server-side Supabase client correctly.
  const supabase = await createClient();

  // Validate the current session.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error?.name === "AuthSessionMissingError" || !user) {
    redirect("/login");
  }

  if (error) {
    throw error;
  }

  // Load permissions only after authentication succeeds.
  const auth = await getCurrentUserPermissions();
  const permissions = Array.from(auth.permissions);

  return (
    <div
      className={[
        "management-ui flex min-h-0 flex-1 flex-col",
        manrope.variable,
        mono.variable,
      ].join(" ")}
    >
      <PermissionProvider permissions={permissions}>
        <DashboardLayoutClient
          userRole={auth.role}
          userDepartment={auth.department}
        >
          {children}
        </DashboardLayoutClient>
      </PermissionProvider>
    </div>
  );
}
