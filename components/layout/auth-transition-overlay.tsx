"use client";

import { OsirisLogoDraw } from "@/components/layout/osiris-logo-draw";
import { useAuthTransition } from "@/lib/auth-transition";

export function AuthTransitionOverlay() {
  const { visible, mode } = useAuthTransition();

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(620px 420px at 50% 50%, rgba(0,102,255,0.14), transparent 65%)",
        }}
      />
      <OsirisLogoDraw play={mode} size={88} className="relative" />
    </div>
  );
}
