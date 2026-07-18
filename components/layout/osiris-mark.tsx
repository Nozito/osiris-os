import Image from "next/image";
import { cn } from "@/lib/utils";

export function OsirisMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md border border-primary/40 bg-primary p-[22%]",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/osiris-logo-white.png"
        alt="Osiris"
        width={size}
        height={size}
        className="h-full w-full object-contain"
        priority
      />
    </span>
  );
}
