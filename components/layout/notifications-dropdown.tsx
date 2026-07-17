"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, BellOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("notifications")
        .select("id, type, title, body, link, read_at, created_at")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false })
        .limit(8);

      if (active) {
        setNotifications(data ?? []);
        setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  async function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
    const supabase = createClient();
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-4 min-w-4 justify-center rounded-full bg-primary px-1 text-[10px] glow-primary">
                {unreadCount}
              </Badge>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="border-b border-border/70 px-3 py-2.5">
          <p className="text-sm font-medium">Notifications</p>
        </div>

        {loading ? (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
            Chargement...
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-muted-foreground">
              <BellOff className="h-4 w-4" />
            </span>
            <p className="text-xs text-muted-foreground">
              Aucune notification pour l&apos;instant.
            </p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto p-1">
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                onClick={() => !n.read_at && markRead(n.id)}
                render={n.link ? <Link href={n.link} /> : undefined}
                className="flex-col items-start gap-0.5 whitespace-normal py-2"
              >
                <div className="flex w-full items-center gap-1.5">
                  {!n.read_at && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                  <p className="truncate text-xs font-medium">{n.title}</p>
                </div>
                {n.body && (
                  <p className="pl-3 text-[11px] text-muted-foreground">{n.body}</p>
                )}
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
