import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-white/[0.02] px-2.5 py-2 text-base transition-[border-color,box-shadow,background-color,backdrop-filter] duration-(--duration-fast) outline-none placeholder:text-muted-foreground/70 hover:border-white/[0.16] focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30 focus-visible:bg-white/[0.05] focus-visible:backdrop-blur-sm disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/20 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
