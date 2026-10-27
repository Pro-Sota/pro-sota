// Save as: app/management/notifications/page.tsx
// Adjust the import path to wherever NotificationClientPage lives.

import NotificationClientPage from "./notification_client_page";
import { getNotifications } from "@/services/notification";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return <NotificationClientPage notifications={notifications} />;
}