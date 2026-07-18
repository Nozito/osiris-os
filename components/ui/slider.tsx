"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function ScoreSlider({
  className,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<"input"> & { value: number }) {
  const percent = ((value - Number(min)) / (Number(max) - Number(min))) * 100

  return (
    <div className={cn("relative flex h-4 w-full items-center", className)}>
      <div className="pointer-events-none absolute inset-x-0 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-(--duration-fast) ease-(--ease-premium)"
          style={{ width: `${percent}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        className={cn(
          "relative z-10 h-4 w-full cursor-pointer appearance-none bg-transparent",
          "[&::-webkit-slider-runnable-track]:h-4 [&::-webkit-slider-runnable-track]:bg-transparent",
          "[&::-webkit-slider-thumb]:mt-0 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-foreground [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_var(--primary),var(--shadow-sm)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-(--duration-fast)",
          "[&::-moz-range-track]:h-4 [&::-moz-range-track]:bg-transparent",
          "[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary-foreground [&::-moz-range-thumb]:shadow-[0_0_0_2px_var(--primary),var(--shadow-sm)]",
          "active:[&::-webkit-slider-thumb]:scale-110 active:[&::-moz-range-thumb]:scale-110"
        )}
        {...props}
      />
    </div>
  )
}

export { ScoreSlider }
