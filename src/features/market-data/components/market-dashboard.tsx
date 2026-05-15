'use client';

import { useState } from 'react';
import { MarketCard } from './market-card';
import { MarketGrid } from './market-grid';
import { AssetSearch } from './asset-search';
import { TransformerConfig } from '../types';
import { Separator } from '@/features/shared/ui/separator';
import { useWatchlist } from '../hooks/use-watchlist';
import { Tabs, TabsList, TabsTrigger } from '@/features/shared/ui/tabs';
import { LayoutGrid, List } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'cards' | 'grid'>('cards');

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
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight">Live Trading Dashboard</h2>
          <p className="text-muted-foreground text-sm">
            Real-time institutional price streams via Bitfinex WebSocket API.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <AssetSearch onSelect={addAsset} excludeIds={watchlist} />
          
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-fit">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cards" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Cards</span>
              </TabsTrigger>
              <TabsTrigger value="grid" className="gap-2">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Grid</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <Separator />
      
      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-xl">
          <p className="text-muted-foreground">Your watchlist is empty.</p>
          <p className="text-sm text-muted-foreground">Use the search box above to add trading pairs.</p>
        </div>
      ) : (
        <>
          {viewMode === 'cards' ? (
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
          ) : (
            <MarketGrid 
              symbols={watchlist} 
              config={MARKET_CONFIG} 
            />
          )}
        </>
      )}

      <div className="rounded-xl border bg-card p-4 text-card-foreground shadow">
        <h3 className="text-sm font-semibold mb-2">Architectural Highlight: Atomic Rendering</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          This dashboard implements <strong>Atomic Rendering</strong> combined with the <strong>React Compiler</strong>. 
          Each card and grid row manages its own data subscription. This ensures that a price 
          update for one asset only re-renders that specific component, preventing expensive 
          global re-renders and maintaining a smooth 60fps UI even under high-frequency load.
        </p>
      </div>
    </div>
  );
}
