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
    <nav className="glass fixed inset-x-0 bottom-0 z-20 flex rounded-none border-x-0 border-b-0 pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors duration-(--duration-fast)",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
      {more && (
        <button
          type="button"
          onClick={more.onClick}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors duration-(--duration-fast)",
            more.active ? "text-primary" : "text-muted-foreground"
          )}
        >
          <more.icon className="h-5 w-5" />
          {more.label}
        </button>
      )}
    </nav>
  );
}
