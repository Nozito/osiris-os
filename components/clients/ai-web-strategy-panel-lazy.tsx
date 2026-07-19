"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const AiWebStrategyPanel = dynamic(
  () => import("./ai-web-strategy-panel").then((mod) => mod.AiWebStrategyPanel),
  { ssr: false, loading: () => <Skeleton className="h-16 w-full rounded-lg" /> }
);

export function AiWebStrategyPanelLazy({ clientId }: { clientId: string }) {
  return <AiWebStrategyPanel clientId={clientId} />;
}
