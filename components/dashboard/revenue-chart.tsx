"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

type ChartTooltipProps = {
  active?: boolean;
  payload?: { value?: number | string }[];
  label?: string;
};

const PLACEHOLDER_DATA = [
  { month: "Jan", total: 8 },
  { month: "Fév", total: 14 },
  { month: "Mar", total: 10 },
  { month: "Avr", total: 22 },
  { month: "Mai", total: 18 },
  { month: "Juin", total: 28 },
];

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs">
      <p className="mb-0.5 font-medium text-foreground/90">{label}</p>
      <p className="text-primary">
        {Number(payload[0].value).toLocaleString("fr-FR")} €
      </p>
    </div>
  );
}

function Chart({
  data,
  interactive = true,
}: {
  data: { month: string; total: number }[];
  interactive?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={224}>
      <AreaChart data={data} margin={{ left: -20, top: 8, right: 8 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0066ff" stopOpacity={0.32} />
            <stop offset="100%" stopColor="#0066ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="month"
          stroke="#8b8d95"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          stroke="#8b8d95"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${Math.round(v / 1000)}k€`}
        />
        {interactive && (
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "rgba(255,255,255,0.12)", strokeWidth: 1 }}
          />
        )}
        <Area
          type="monotone"
          dataKey="total"
          stroke="#0066ff"
          strokeWidth={2}
          fill="url(#revenueFill)"
          animationDuration={700}
          animationEasing="ease-out"
          activeDot={{ r: 4, strokeWidth: 0, fill: "#0066ff" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RevenueChart({
  data,
}: {
  data: { month: string; total: number }[];
}) {
  if (data.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-lg">
        <div className="pointer-events-none opacity-[0.14] grayscale">
          <Chart data={PLACEHOLDER_DATA} interactive={false} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-card via-card/60 to-transparent">
          <EmptyState
            icon={TrendingUp}
            title="Pas encore de CA encaissé"
            description="Les factures marquées payées apparaîtront ici."
            className="border-none bg-transparent py-0"
          />
        </div>
      </div>
    );
  }

  return <Chart data={data} />;
}
