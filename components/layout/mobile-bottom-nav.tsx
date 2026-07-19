"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type BottomNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export function MobileBottomNav({
  items,
  more,
}: {
  items: BottomNavItem[];
  more?: { label: string; icon: LucideIcon; onClick: () => void; active?: boolean };
}) {
  const pathname = usePathname();

  return (
    <nav
      className="glass fixed inset-x-3 z-20 flex rounded-2xl px-1 shadow-[var(--shadow-lg)] md:hidden"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
    >
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-[color,transform] duration-(--duration-fast) active:scale-[0.94]",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
            {active && (
              <span className="absolute top-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
      {more && (
        <button
          type="button"
          onClick={more.onClick}
          className={cn(
            "relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-[color,transform] duration-(--duration-fast) active:scale-[0.94]",
            more.active ? "text-primary" : "text-muted-foreground"
          )}
        >
          <more.icon className="h-5 w-5" />
          {more.label}
          {more.active && (
            <span className="absolute top-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
          )}
        </button>
      )}
    </nav>
  );
}
