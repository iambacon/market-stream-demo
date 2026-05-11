import { useState, useEffect } from 'react';
import { marketStream } from '../api/market-stream-service';

/**
 * useMarketGrid
 * 
 * Manages multiple subscriptions for a grid view.
 * Collects the RAW ticks from all active symbols into a single state map.
 * This allows presentation components to perform their own transformation logic.
 */
export function useMarketGrid(symbols: string[]) {
  const [rawDataMap, setRawDataMap] = useState<Record<string, any>>({});

  useEffect(() => {
    const unsubs: (() => void)[] = [];

    marketStream.connect();

    symbols.forEach(symbol => {
      const unsub = marketStream.subscribe(symbol, (event) => {
        setRawDataMap(prev => ({
          ...prev,
          [symbol]: event.data
        }));
      });
      unsubs.push(unsub);
    });

    return () => unsubs.forEach(u => u());
  }, [symbols]);

  // Return the raw data map and the sorted symbols
  return { rawDataMap };
}
