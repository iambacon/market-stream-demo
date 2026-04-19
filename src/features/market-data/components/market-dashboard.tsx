'use client';

import { MarketCard } from './market-card';
import { TransformerConfig } from '../types';
import { Separator } from '@/features/shared/ui/separator';

const MARKET_CONFIG: TransformerConfig = {
  mappings: [
    { key: 'g', label: 'Bid' },
    { key: 'a', label: 'Ask' },
    { key: 'v', label: 'Volume', formatter: (val) => `${(val / 10).toFixed(1)}k` },
  ],
  includeTimestamp: true,
};

export function MarketDashboard() {
  const markets = ['BTC/USD', 'ETH/USD', 'AAPL', 'TSLA'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Real-Time Markets</h2>
          <p className="text-muted-foreground text-sm">
            Live data streams with 2s interval simulation.
          </p>
        </div>
      </div>
      <Separator />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {markets.map((symbol) => (
          <MarketCard 
            key={symbol} 
            symbol={symbol} 
            config={MARKET_CONFIG} 
          />
        ))}
      </div>
      <div className="rounded-xl border bg-card p-4 text-card-foreground shadow">
        <h3 className="text-sm font-semibold mb-2">Architectural Highlight: The Data Transformer</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The cards above are fed by a simulated SignalR stream emitting raw keys (`g`, `a`, `v`). 
          Our decoupled <strong>DataTransformer</strong> maps these to human-readable labels 
          (`Bid`, `Ask`, `Volume`) before they reach the UI. This ensures the dashboard 
          remains performant and the presentation logic stays clean.
        </p>
      </div>
    </div>
  );
}
