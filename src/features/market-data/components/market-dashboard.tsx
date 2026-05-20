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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-semibold tracking-tight">Trading Dashboard</h2>
          <p className="text-muted-foreground text-sm">
            Real-time institutional price streams.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <AssetSearch onSelect={addAsset} excludeIds={watchlist} />
          
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-fit">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cards" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline text-xs uppercase tracking-wider font-semibold">Cards</span>
              </TabsTrigger>
              <TabsTrigger value="grid" className="gap-2">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline text-xs uppercase tracking-wider font-semibold">Grid</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <Separator className="bg-border/60" />
      
      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 border border-dashed rounded-xl bg-muted/5">
          <p className="text-muted-foreground font-medium">Your watchlist is empty.</p>
          <p className="text-sm text-muted-foreground/60">Use the search box above to add trading pairs.</p>
        </div>
      ) : (
        <div className="min-h-[400px]">
          {viewMode === 'cards' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        </div>
      )}
    </div>
  );
}
