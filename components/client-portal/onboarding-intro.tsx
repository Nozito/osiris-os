"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { OsirisLogoDraw } from "@/components/layout/osiris-logo-draw";

const SEEN_KEY = "osiris-onboarding-intro-seen";

/**
 * A brief logo draw-in the first time a client lands on the onboarding
 * wizard — reuses OsirisLogoDraw (already built for login/logout), doesn't
 * invent a new brand animation. Plays once per session, skipped entirely
 * under prefers-reduced-motion.
 */
export function OnboardingIntro({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<"drawing" | "fading" | "done">("drawing");

  useEffect(() => {
    if (shouldReduceMotion || sessionStorage.getItem(SEEN_KEY)) {
      setPhase("done");
      return;
    }
    sessionStorage.setItem(SEEN_KEY, "1");

    const toFade = setTimeout(() => setPhase("fading"), 2200);
    const toDone = setTimeout(() => setPhase("done"), 2600);
    return () => {
      clearTimeout(toFade);
      clearTimeout(toDone);
    };
  }, [shouldReduceMotion]);

  return (
    <>
      {phase !== "done" && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-[400ms]"
          style={{ opacity: phase === "fading" ? 0 : 1 }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(620px 420px at 50% 50%, rgba(0,102,255,0.14), transparent 65%)",
            }}
          />
          <OsirisLogoDraw play="in" size={88} className="relative" />
        </div>
      )}
      {children}
    </>
  );
}
