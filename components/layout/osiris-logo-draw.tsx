"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Traced from the Osiris mark (public/osiris-logo-black.png) — single path, viewBox 402.021x374.505. */
const OSIRIS_PATH =
  "M192.156 1.652c-37.3 6.7-64 31.1-73.9 67.5-2 7.4-2.3 10.7-2.3 26.9 0 16 .4 19.6 2.3 27 11.6 43.2 51.8 76.3 103.7 85.2 16.9 2.9 43.3 2.2 61.4-1.7 6.8-1.4 12.5-2.4 12.7-2.2s-.3 4-1.1 8.4c-8.3 43.9-40.9 79.4-82 89.4-11.6 2.8-28.7 3.5-41.3 1.5-11.5-1.7-27.7-6.8-37.4-11.7-24.5-12.2-45.2-33.4-56.7-58-19.4-41.5-16.9-96.3 5.9-129.9 2.1-3 6.4-8.4 9.5-12 8.7-9.7 11-15.3 11-27 0-11.1-1.8-16.2-8.4-23.3-10.3-11.1-27-12.3-39.7-2.7-10.8 8.1-26.4 28.1-35.3 45-14.2 27.2-20.6 54.9-20.6 89.5.1 21.8 1.3 32.2 6.6 53.7 11.5 47 40.8 88.8 81.2 115.8 12.2 8.1 34.6 19.1 47.9 23.4 20.1 6.6 30.6 8.1 54.8 8.1 18.3-.1 23-.4 31.3-2.3 60.4-13.4 107.9-55.5 132.2-117.2 7.4-18.8 13.1-47.7 15.4-77.6 1.1-13.7 1.9-16.3 8.9-26.6 20-29.6 28-69.5 21.6-107.9-2.8-17-7.7-26.4-16.7-32.4-10-6.6-22.4-7.2-34.2-1.7-16.3 7.7-21.2 20.8-15.7 42.2 5.8 22.8 4.8 43.8-3 59.3-5.5 11-14.7 18.8-30 25.4-43.3 18.8-98 8.7-113.8-20.9-2.9-5.3-3.5-7.6-3.8-14.5-.6-10.7 2-18.2 8.7-25.3 8.4-8.9 19.9-12.3 32.7-9.6 16.3 3.4 29.9 13.3 47.2 34.7 7.4 9 13.6 12.9 22.1 13.6 11 1 20.5-5.6 25.3-17.6 3.1-7.9 3.1-23.1 0-31.5-6.9-18.8-26.7-38.5-51.4-51.1-23.4-11.9-51-16.3-75.1-11.9";

/**
 * The Osiris mark redrawn as a vector line animation: the outline strokes
 * itself in, then the shape solidifies with a fill — and the reverse for
 * sign-out. Used only for the login/logout transition moment, not as the
 * everyday static mark (see OsirisMark for that).
 */
export function OsirisLogoDraw({
  play,
  size = 96,
  className,
}: {
  play: "in" | "out";
  size?: number;
  className?: string;
}) {
  const [active, setActive] = useState(play === "out");

  useEffect(() => {
    const frame = requestAnimationFrame(() => setActive(play === "in"));
    return () => cancelAnimationFrame(frame);
  }, [play]);

  return (
    <svg
      viewBox="0 0 402.021 374.505"
      width={size}
      height={size}
      className={cn("overflow-visible", className)}
      fill="none"
    >
      <path
        d={OSIRIS_PATH}
        pathLength={1}
        stroke="#f5f6f8"
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 1,
          strokeDashoffset: active ? 0 : 1,
          transition: active
            ? "stroke-dashoffset 1900ms var(--ease-premium)"
            : "stroke-dashoffset 1700ms var(--ease-premium) 350ms",
        }}
      />
      <path
        d={OSIRIS_PATH}
        fill="#f5f6f8"
        style={{
          opacity: active ? 1 : 0,
          transition: active
            ? "opacity 550ms ease 1500ms"
            : "opacity 350ms ease",
        }}
      />
    </svg>
  );
}
