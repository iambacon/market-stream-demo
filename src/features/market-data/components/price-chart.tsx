"use client";

import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

interface PriceChartProps {
  data: { value: number; timestamp: string }[];
  colour?: string;
}

export function PriceChart({ data, colour = "#3b82f6" }: PriceChartProps) {
  if (data.length < 2) {
    return <div className="h-[40px] w-full bg-muted/20 animate-pulse rounded" />;
  }

  const values = data.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const margin = Math.max((max - min) * 0.1, Math.abs(max) * 0.001);

  return (
    <div className="h-[40px] min-h-[40px] min-w-0 w-full" aria-hidden="true">
      <ResponsiveContainer width="100%" height={40} minWidth={0}>
        <LineChart data={data} accessibilityLayer={false}>
          <YAxis domain={[min - margin, max + margin]} hide />
          <Line
            type="monotone"
            dataKey="value"
            stroke={colour}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
