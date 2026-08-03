import type { Metadata } from "next";
import DashboardLayout from "./dashboard_layout";

export const metadata: Metadata = {
  title: {
    template: "%s | ProSota",
    default: "Management Dashboard | ProSota",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}