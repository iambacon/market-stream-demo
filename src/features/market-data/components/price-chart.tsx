'use client';

import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';

interface PriceChartProps {
  data: { value: number; timestamp: string }[];
  color?: string;
}

/**
 * PriceChart
 * 
 * A high-density sparkline component for visualizing price trends.
 * Strips away all non-essential elements to focus on the data movement.
 */
export function PriceChart({ data, color = '#3b82f6' }: PriceChartProps) {
  if (data.length < 2) {
    return <div className="h-[40px] w-full bg-muted/20 animate-pulse rounded" />;
  }

  // Calculate a small buffer for the Y-axis so the line doesn't hit the edges
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
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
