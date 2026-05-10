import { useState, useEffect, useRef } from "react";
import { Bell, X, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, ArrowDownToLine, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "trade" | "alert" | "deposit" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "trade",
    title: "NVDA Buy Executed",
    message: "Bought 10 shares of NVIDIA at $132.40",
    time: "2 min ago",
    read: false,
  },
  {
    id: "n2",
    type: "alert",
    title: "TSLA Price Alert",
    message: "Tesla dropped below $250.00 — down 2.48% today",
    time: "15 min ago",
    read: false,
  },
  {
    id: "n3",
    type: "deposit",
    title: "Deposit Received",
    message: "$10,000.00 has been added to your account",
    time: "1 hr ago",
    read: false,
  },
  {
    id: "n4",
    type: "system",
    title: "Market Update",
    message: "S&P 500 hits new all-time high — broad rally across sectors",
    time: "3 hr ago",
    read: true,
  },
  {
    id: "n5",
    type: "trade",
    title: "AAPL Buy Executed",
    message: "Bought 12 shares of Apple at $220.15",
    time: "Yesterday",
    read: true,
  },
  {
    id: "n6",
    type: "alert",
    title: "META Earnings Beat",
    message: "Meta reported EPS of $6.43, beating estimates by 12%",
    time: "2 days ago",
    read: true,
  },
];

const typeConfig = {
  trade: { icon: TrendingUp, color: "text-bull", bg: "bg-bull/10" },
  alert: { icon: AlertCircle, color: "text-bear", bg: "bg-bear/10" },
  deposit: { icon: ArrowDownToLine, color: "text-primary", bg: "bg-primary/10" },
  system: { icon: CheckCircle2, color: "text-muted-foreground", bg: "bg-surface-elevated" },
};

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

export function NotificationsPanel({ open, onClose, anchorRef }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose, anchorRef]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 z-50 w-96 max-h-[520px] flex flex-col glass-card overflow-hidden animate-scale-in origin-top-right"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-sm font-bold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <span className="flex items-center justify-center h-5 min-w-[20px] rounded-full gradient-primary px-1.5 text-[10px] font-bold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="rounded-md px-2 py-1 text-[11px] font-medium text-primary hover:bg-surface-elevated transition-colors"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground/60 mt-1">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((n) => {
            const config = typeConfig[n.type];
            const Icon = config.icon;
            return (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={cn(
                  "flex items-start gap-3 w-full px-4 py-3 text-left border-b border-border/50 hover:bg-surface-elevated/60 transition-colors",
                  !n.read && "bg-primary/[0.03]"
                )}
              >
                <div className={cn("mt-0.5 h-8 w-8 rounded-lg flex-shrink-0 flex items-center justify-center", config.bg)}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-semibold truncate", n.read ? "text-muted-foreground" : "text-foreground")}>
                      {n.title}
                    </span>
                    {!n.read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0 animate-pulse-dot" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground/60">
                    <Clock className="h-3 w-3" />
                    {n.time}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
