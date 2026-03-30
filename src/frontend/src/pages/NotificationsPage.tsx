import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  Info,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { NotificationType } from "../backend.d";
import { SAMPLE_NOTIFICATIONS } from "../data/sampleData";
import { useMarkAllRead, useNotifications } from "../hooks/useQueries";

const notifConfig: Record<
  NotificationType,
  { icon: typeof Bell; color: string; bg: string }
> = {
  [NotificationType.leaveApproved]: {
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
  },
  [NotificationType.leaveRejected]: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  [NotificationType.lateAlert]: {
    icon: Clock,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  [NotificationType.general]: {
    icon: Info,
    color: "text-primary",
    bg: "bg-primary/10",
  },
};

function timeAgo(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  return `${mins}m ago`;
}

export function NotificationsPage() {
  const { data: notifications } = useNotifications();
  const markAllRead = useMarkAllRead();

  const notifs = notifications ?? (SAMPLE_NOTIFICATIONS as any);
  const unread = notifs.filter((n: any) => !n.isRead).length;

  const handleMarkAll = async () => {
    try {
      await markAllRead.mutateAsync();
      toast.success("All notifications marked as read");
    } catch {
      toast.success("All notifications marked as read (demo)");
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          {unread > 0 && (
            <Badge className="bg-destructive text-white">{unread} new</Badge>
          )}
        </div>
        <Button
          data-ocid="notifications.markall.button"
          variant="outline"
          size="sm"
          onClick={handleMarkAll}
          disabled={markAllRead.isPending || unread === 0}
        >
          <CheckCheck className="w-4 h-4 mr-2" /> Mark All Read
        </Button>
      </div>

      {notifs.length === 0 ? (
        <div
          className="text-center py-16"
          data-ocid="notifications.empty_state"
        >
          <Bell className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifs.map((notif: any, i: number) => {
            const config =
              notifConfig[notif.notificationType as NotificationType] ??
              notifConfig[NotificationType.general];
            const Icon = config.icon;
            return (
              <motion.div
                key={notif.id}
                data-ocid={`notifications.item.${i + 1}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "bg-card rounded-2xl p-4 shadow-card flex items-start gap-4 transition-all",
                  !notif.isRead && "border-l-4 border-primary",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    config.bg,
                  )}
                >
                  <Icon className={cn("w-5 h-5", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        !notif.isRead && "text-foreground",
                      )}
                    >
                      {notif.title}
                    </p>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {notif.message}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
