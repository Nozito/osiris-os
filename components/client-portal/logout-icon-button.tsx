"use client";

import { LogOut } from "lucide-react";
import { useLogout } from "@/lib/use-logout";
import { cn } from "@/lib/utils";

export function LogoutIconButton({ className }: { className?: string }) {
  const logout = useLogout();

  return (
    <button
      type="button"
      onClick={logout}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-(--duration-fast) hover:text-foreground",
        className
      )}
    >
      <LogOut className="h-4 w-4" />
      <span className="sr-only">Déconnexion</span>
    </button>
  );
}
