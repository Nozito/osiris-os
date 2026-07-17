"use client";

import { motion } from "framer-motion";
import { PanelLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

function AnimatedHamburger({ open }: { open: boolean }) {
  const lineClass = "absolute h-[1.5px] w-4 rounded-full bg-current";
  const transition = { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <span className="relative flex h-4 w-4 items-center justify-center">
      <motion.span
        className={lineClass}
        animate={{ rotate: open ? 45 : 0, y: open ? 0 : -5 }}
        transition={transition}
      />
      <motion.span
        className={lineClass}
        animate={{ opacity: open ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.span
        className={lineClass}
        animate={{ rotate: open ? -45 : 0, y: open ? 0 : 5 }}
        transition={transition}
      />
    </span>
  );
}

export function SidebarTriggerAdaptive({ className }: { className?: string }) {
  const { isMobile, openMobile, toggleSidebar } = useSidebar();

  return (
    <Button
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      className={cn(className)}
      onClick={toggleSidebar}
    >
      {isMobile ? <AnimatedHamburger open={openMobile} /> : <PanelLeftIcon />}
      <span className="sr-only">Ouvrir/fermer la navigation</span>
    </Button>
  );
}
