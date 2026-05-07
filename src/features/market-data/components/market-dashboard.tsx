'use client';

import { MarketCard } from './market-card';
import { TransformerConfig } from '../types';
import { Separator } from '@/features/shared/ui/separator';

const MARKET_CONFIG: TransformerConfig = {
  mappings: [
    { key: 'p', label: 'Bid' }, 
    { key: 'v', label: 'Volume', formatter: (val) => `${Number(val).toFixed(1)}k` },
  ],
  includeTimestamp: true,
};

export function MarketDashboard() {
  // Using corrected CoinCap asset IDs
  const markets = ['BITCOIN', 'ETHEREUM', 'DOGECOIN', 'POLKADOT'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Live Market Dashboard</h2>
          <p className="text-muted-foreground text-sm">
            Real-time price streams from CoinCap public WebSocket API.
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
        <h3 className="text-sm font-semibold mb-2">Architectural Highlight: The Provider Swap</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The dashboard above is powered by a real-world <strong>WebSocket API</strong>. 
          By adhering to the <strong>Dependency Inversion Principle</strong>, we swapped our simulated provider 
          for a live data source without modifying a single line of our UI components or the 
          <strong>useMarketStream</strong> hook. This is the power of a decoupled architecture.
        </p>
      </div>
    </div>
  );
}
