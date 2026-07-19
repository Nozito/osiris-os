"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// recharts is a heavy dependency and the chart sits below the fold on the
// dashboard's biggest card — defer it out of the route's initial JS entirely.
const RevenueChart = dynamic(
  () => import("./revenue-chart").then((mod) => mod.RevenueChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[224px] w-full rounded-lg" />,
  }
);

export function RevenueChartLazy({ data }: { data: { month: string; total: number }[] }) {
  return <RevenueChart data={data} />;
}
