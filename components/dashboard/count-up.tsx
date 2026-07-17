"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

function formatValue(n: number, format?: "number" | "currency") {
  if (format === "currency") {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);
  }
  return n.toLocaleString("fr-FR");
}

export function CountUp({
  value,
  format,
}: {
  value: number;
  format?: "number" | "currency";
}) {
  const [display, setDisplay] = useState(0);
  const prefersReducedMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (prefersReducedMotion.current) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value]);

  const rounded = Math.round(display);
  return <>{formatValue(rounded, format)}</>;
}
