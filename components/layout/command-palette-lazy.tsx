"use client";

import dynamic from "next/dynamic";

// Only ever used on ⌘K — keep it out of the shared JS every staff route pays for.
const CommandPalette = dynamic(
  () => import("./command-palette").then((mod) => mod.CommandPalette),
  { ssr: false }
);

export function CommandPaletteLazy() {
  return <CommandPalette />;
}
