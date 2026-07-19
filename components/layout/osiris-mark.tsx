import Image from "next/image";
import { cn } from "@/lib/utils";

type OsirisMarkVariant = "mark" | "plate" | "watermark";

/**
 * The Osiris glyph is already a finished white/black mark on a transparent
 * background — the app is dark-first everywhere it appears, so the glyph
 * reads on its own. No boxed background is drawn by default; "plate" exists
 * only for the rare case of placing the mark over a busy/light surface, and
 * "watermark" is for large, low-opacity brand texture (hero panels, empty
 * states) — never for the primary in-flow logo.
 */
export function OsirisMark({
  className,
  size = 28,
  variant = "mark",
}: {
  className?: string;
  size?: number;
  variant?: OsirisMarkVariant;
}) {
  if (variant === "watermark") {
    return (
      <Image
        src="/osiris-logo-white.png"
        alt=""
        aria-hidden
        width={size}
        height={size}
        className={cn("pointer-events-none object-contain select-none", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  if (variant === "plate") {
    return (
      <span
        className={cn(
          "glass flex shrink-0 items-center justify-center rounded-lg",
          className
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src="/osiris-logo-white.png"
          alt="Osiris"
          width={size}
          height={size}
          className="h-[58%] w-[58%] object-contain"
          priority
        />
      </span>
    );
  }

  return (
    <Image
      src="/osiris-logo-white.png"
      alt="Osiris"
      width={size}
      height={size}
      className={cn(
        "shrink-0 object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]",
        className
      )}
      style={{ width: size, height: size }}
      priority
    />
  );
}
