'use client';

import { MarketCard } from './market-card';
import { AssetSearch } from './asset-search';
import { TransformerConfig } from '../types';
import { Separator } from '@/features/shared/ui/separator';
import { useWatchlist } from '../hooks/use-watchlist';

const MARKET_CONFIG: TransformerConfig = {
  mappings: [
    { key: 'p', label: 'Bid' }, 
    { key: 'a', label: 'Ask' }, 
    { key: 'v', label: 'Volume', formatter: (val) => `${Number(val).toFixed(1)}k` },
  ],
  includeTimestamp: true,
};

export function MarketDashboard() {
  const { watchlist, addAsset, removeAsset, isLoaded } = useWatchlist();

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse bg-muted rounded" />
        <Separator />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 w-full animate-pulse bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Live Trading Dashboard</h2>
          <p className="text-muted-foreground text-sm">
            Real-time institutional price streams via Bitfinex WebSocket API.
          </p>
        </div>
        <AssetSearch onSelect={addAsset} excludeIds={watchlist} />
      </div>
      
      <Separator />
      
      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-xl">
          <p className="text-muted-foreground">Your watchlist is empty.</p>
          <p className="text-sm text-muted-foreground">Use the search box above to add trading pairs.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {watchlist.map((symbol) => (
            <MarketCard 
              key={symbol} 
              symbol={symbol} 
              config={MARKET_CONFIG} 
              onRemove={() => removeAsset(symbol)}
            />
          ))}
        </div>
      )}

      <div className="rounded-xl border bg-card p-4 text-card-foreground shadow">
        <h3 className="text-sm font-semibold mb-2">Architectural Highlight: Message-Based Streams</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Unlike basic polling or URL-based sockets, this dashboard uses an institutional 
          <strong> Message-Based WebSocket</strong>. A single persistent connection is 
          maintained, and JSON subscription messages are dispatched over the pipe to 
          dynamically toggle assets. This is the same pattern used in professional 
          <strong> SignalR</strong> trading environments.
        </p>
      </div>
    </div>
  );
}
