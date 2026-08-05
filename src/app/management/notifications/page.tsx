import NotificationClientPage from "./notification_client_page"


type NotificationType =
  | "revision"
  | "deadline"
  | "approval"
  | "document";

type Notification = {
  id: number;
  type: NotificationType;
  title: string;
  project: string;
  description: string;
  time: string;
  unread: boolean;
};


export default async function NotificationPage() {

  const notifications : Notification[] = [];

  return <NotificationClientPage notifications={notifications} />
}