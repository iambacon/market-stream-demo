'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/ui/card';
import { Badge } from '@/features/shared/ui/badge';
import { useMarketStream } from '../hooks/use-market-stream';
import { TransformerConfig } from '../types';
import { cn } from '@/lib/utils';

interface MarketCardProps {
  symbol: string;
  config: TransformerConfig;
}

export function MarketCard({ symbol, config }: MarketCardProps) {
  const { data, status, isConnected } = useMarketStream({ topic: symbol, config });
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

      // Reset color after a flash
      const timer = setTimeout(() => setPriceColor('text-foreground'), 1000);
      return () => clearTimeout(timer);
    }
  }, [data?.bid]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{symbol}</CardTitle>
        <Badge variant={isConnected ? "default" : "secondary"} className="text-[10px]">
          {status.toUpperCase()}
        </Badge>
      </CardHeader>
      <CardContent>
        {data ? (
          <div className="space-y-1">
            <div className={cn("text-2xl font-bold transition-colors duration-300", priceColor)}>
              ${Number(data.bid).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Vol: {data.volume} • Last: {new Date(data.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ) : (
          <div className="animate-pulse space-y-2">
            <div className="h-6 w-24 bg-muted rounded"></div>
            <div className="h-4 w-32 bg-muted rounded"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
