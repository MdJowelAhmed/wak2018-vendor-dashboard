export type NotificationCategory = "order" | "booking" | "system" | "payment" | "review";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  category: NotificationCategory;
  link?: string;
};
