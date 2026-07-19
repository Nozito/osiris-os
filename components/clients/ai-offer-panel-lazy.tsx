"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const AiOfferPanel = dynamic(
  () => import("./ai-offer-panel").then((mod) => mod.AiOfferPanel),
  { ssr: false, loading: () => <Skeleton className="h-16 w-full rounded-lg" /> }
);

export function AiOfferPanelLazy({ clientId }: { clientId: string }) {
  return <AiOfferPanel clientId={clientId} />;
}
