'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/ui/card';
import { Badge } from '@/features/shared/ui/badge';
import { PriceChart } from './price-chart';
import { useMarketStream } from '../hooks/use-market-stream';
import { TransformerConfig } from '../types';
import { cn } from '@/lib/utils';

interface MarketCardProps {
  symbol: string;
  config: TransformerConfig;
  onRemove?: () => void;
}

export function MarketCard({ symbol, config, onRemove }: MarketCardProps) {
  const { data, history, status, isConnected } = useMarketStream({ topic: symbol, config });
  const [priceColor, setPriceColor] = useState<'text-foreground' | 'text-green-500' | 'text-red-500'>('text-foreground');
  const prevPrice = useRef<number | null>(null);

  useEffect(() => {
    if (data?.bid) {
      const currentPrice = Number(data.bid);
      if (prevPrice.current !== null) {
        if (currentPrice > prevPrice.current) {
          setPriceColor('text-green-500');
        } else if (currentPrice < prevPrice.current) {
          setPriceColor('text-red-500');
        }
      }
      prevPrice.current = currentPrice;

      const timer = setTimeout(() => setPriceColor('text-foreground'), 1000);
      return () => clearTimeout(timer);
    }
  }, [data?.bid]);

  const chartColor = history.length > 2 && history[history.length - 1].value >= history[0].value 
    ? '#22c55e' 
    : '#ef4444';

  return (
    <Card className="w-full group relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium uppercase">{symbol}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "secondary"} className="text-[10px]">
            {status.toUpperCase()}
          </Badge>
          {onRemove && (
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 h-6 w-6 z-10 flex items-center justify-center rounded-md hover:bg-muted"
              aria-label="Remove asset"
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {data ? (
          <>
            <div className="space-y-1">
              <div className={cn("text-2xl font-bold transition-colors duration-300", priceColor)}>
                ${Number(data.bid).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                Vol: {data.volume} • Last: {new Date(data.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <PriceChart data={history} color={chartColor} />
          </>
        ) : (
          <div className="animate-pulse space-y-4">
            <div className="space-y-2">
              <div className="h-6 w-24 bg-muted rounded"></div>
              <div className="h-4 w-32 bg-muted rounded"></div>
            </div>
            <div className="h-[40px] w-full bg-muted/20 rounded" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
