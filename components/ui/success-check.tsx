"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** A check mark that pops in — for action-confirmed moments (step validated, onboarding done). */
export function SuccessCheck({ size = 20, className }: { size?: number; className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--success),transparent_85%)] text-[color-mix(in_oklch,var(--success),white_15%)]",
        className
      )}
      style={{ width: size, height: size }}
      initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 500, damping: 22 }
      }
    >
      <Check className="h-[55%] w-[55%]" strokeWidth={3} />
    </motion.span>
  );
}
