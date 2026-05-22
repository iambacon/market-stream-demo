'use client';

import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';

interface PriceChartProps {
  data: { value: number; timestamp: string }[];
  colour?: string;
}

export function PriceChart({ data, colour = '#3b82f6' }: PriceChartProps) {
  if (data.length < 2) {
    return <div className="h-[40px] w-full bg-muted/20 animate-pulse rounded" />;
  }

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const margin = (max - min) * 0.1;

  return (
    <div className="h-[40px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
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
