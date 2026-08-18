import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Calendar,
  Check,
  CreditCard,
  ExternalLink,
  Info,
  ShoppingBag,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/utils";
import type { NotificationItem } from "../types";

type NotificationDropdownProps = {
  role: "vendor" | "service";
  viewAllUrl: string;
};

export function NotificationDropdown({
  role: _role,
  viewAllUrl,
}: NotificationDropdownProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const getCategoryIcon = (category: NotificationItem["category"]) => {
    switch (category) {
      case "order":
        return <ShoppingBag className="size-4 text-blue-600" />;
      case "booking":
        return <Calendar className="size-4 text-emerald-600" />;
      case "payment":
        return <CreditCard className="size-4 text-purple-600" />;
      case "review":
        return <Star className="size-4 text-amber-500 fill-amber-500/20" />;
      case "system":
      default:
        return <Info className="size-4 text-gray-600" />;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative cursor-pointer">
          <Bell className="size-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 sm:w-96 p-0 shadow-lg border-gray-100"
        align="end"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">
              Notifications
            </span>
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full"
              >
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Check className="size-3.5" />
              Mark all as read
            </button>
          )}
        </div>

        <div className="max-h-[320px] overflow-y-auto divide-y divide-gray-50">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No notifications right now.
            </div>
          ) : (
            notifications.slice(0, 4).map((item) => (
              <DropdownMenuItem
                key={item.id}
                className={cn(
                  "flex items-start gap-3 p-3 text-left cursor-pointer transition-colors focus:bg-gray-50",
                  !item.read ? "bg-primary/[0.03]" : "",
                )}
                onClick={() => {
                  markAsRead(item.id);
                  setOpen(false);
                  navigate(viewAllUrl);
                }}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-100/80 mt-0.5">
                  {getCategoryIcon(item.category)}
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <p
                      className={cn(
                        "text-xs font-medium truncate",
                        !item.read
                          ? "text-foreground font-semibold"
                          : "text-gray-700",
                      )}
                    >
                      {item.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">
                    {item.message}
                  </p>
                </div>

                {!item.read && (
                  <span className="size-2 rounded-full bg-primary shrink-0 mt-1.5" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />

        <div className="p-2 bg-gray-50/50 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-primary font-medium hover:text-primary hover:bg-primary/5 cursor-pointer flex items-center justify-center gap-1.5"
            onClick={() => {
              setOpen(false);
              navigate(viewAllUrl);
            }}
          >
            <span>View all notifications</span>
            <ExternalLink className="size-3.5" />
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
