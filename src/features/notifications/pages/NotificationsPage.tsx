import { useState } from "react";
import {
  Bell,
  Calendar,
  Check,
  CheckCheck,
  CreditCard,
  Info,
  ShoppingBag,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/utils";
import type { NotificationItem } from "../types";

type NotificationsPageProps = {
  role: "vendor" | "service";
};

export function NotificationsPage({ role: _role }: NotificationsPageProps) {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleReadStatus = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getCategoryIcon = (category: NotificationItem["category"]) => {
    switch (category) {
      case "order":
        return <ShoppingBag className="size-5 text-blue-600" />;
      case "booking":
        return <Calendar className="size-5 text-emerald-600" />;
      case "payment":
        return <CreditCard className="size-5 text-purple-600" />;
      case "review":
        return <Star className="size-5 text-amber-500 fill-amber-500/20" />;
      case "system":
      default:
        return <Info className="size-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Minimal Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {unreadCount} new
            </Badge>
          )}
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCheck className="size-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications Minimal List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card className="border-dashed border-gray-200 shadow-none">
            <CardContent className="py-12 text-center space-y-3">
              <div className="size-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <Bell className="size-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                No notifications
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                You're all caught up! There are no notifications to display
                right now.
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((item) => (
            <Card
              key={item.id}
              className={cn(
                "transition-all duration-200 border-gray-100 shadow-xs",
                !item.read
                  ? "bg-primary/[0.02] border-primary/20 ring-1 ring-primary/10"
                  : "bg-white",
              )}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="size-10 rounded-xl bg-gray-100/80 flex items-center justify-center shrink-0 mt-0.5">
                  {getCategoryIcon(item.category)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={cn(
                        "text-sm font-semibold",
                        !item.read ? "text-foreground" : "text-gray-700",
                      )}
                    >
                      {item.title}
                    </h4>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {item.time}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.message}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
                    title={item.read ? "Mark as unread" : "Mark as read"}
                    onClick={() => toggleReadStatus(item.id)}
                  >
                    <Check
                      className={cn(
                        "size-4",
                        item.read ? "text-primary" : "text-gray-400",
                      )}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Delete notification"
                    onClick={() => deleteNotification(item.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
