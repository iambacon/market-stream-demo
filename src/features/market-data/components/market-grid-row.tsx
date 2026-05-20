'use client';

import { useMemo, useEffect, useRef, useState } from 'react';
import { TableCell, TableRow } from '@/features/shared/ui/table';
import { useMarketStream } from '../hooks/use-market-stream';
import { DataTransformer } from '../lib/data-transformer';
import { TransformerConfig } from '../types';
import { cn } from '@/lib/utils';

interface MarketGridRowProps {
  symbol: string;
  config: TransformerConfig;
}

/**
 * MarketGridRow
 * 
 * An atomized row component that subscribes to its own data stream.
 * Ensures that price updates only trigger a re-render of this specific row.
 */
export function MarketGridRow({ symbol, config }: MarketGridRowProps) {
  const { data } = useMarketStream({ topic: symbol, config });
  const [flash, setFlash] = useState<'bg-success/5' | 'bg-destructive/5' | null>(null);
  const prevPrice = useRef<number | null>(null);

  // High-performance visual feedback for the grid
  useEffect(() => {
    if (data?.bid) {
      const currentPrice = Number(data.bid);
      if (prevPrice.current !== null) {
        if (currentPrice > prevPrice.current) setFlash('bg-success/5');
        else if (currentPrice < prevPrice.current) setFlash('bg-destructive/5');
      }
      prevPrice.current = currentPrice;
      const timer = setTimeout(() => setFlash(null), 800);
      return () => clearTimeout(timer);
    }
  }, [data?.bid]);

  // Use the transformer to generate the row array
  const cells = useMemo(() => {
    if (!data) return [];
    
    // We map the internal state back to raw keys for the transformer
    const rawItem = { 
      symbol: symbol.replace(/^t/, ''),
      p: data.bid,
      a: data.ask,
      v: data.volume 
    };

    const gridConfig: TransformerConfig = {
      mappings: [
        { key: 'symbol', label: 'Symbol' },
        ...config.mappings
      ]
    };
    
    const transformer = new DataTransformer(gridConfig);
    // toMatrix returns [headers, row1], so we take the second element
    const matrix = transformer.toMatrix([rawItem]);
    return matrix[1] || [];
  }, [data, symbol, config]);

  if (!data) {
    return (
      <TableRow className="h-11 border-b animate-pulse">
        <TableCell className="font-bold">{symbol.replace(/^t/, '')}</TableCell>
        <TableCell colSpan={config.mappings.length} className="text-xs text-muted-foreground italic">
          Connecting...
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow className={cn("h-11 border-b transition-colors duration-300", flash)}>
      {cells.map((cell, i) => (
        <TableCell 
          key={i} 
          className={cn(
            "font-mono text-xs",
            i === 0 ? "font-bold text-foreground" : "text-muted-foreground"
          )}
        >
          {typeof cell === 'number' 
            ? cell.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
            : cell}
        </TableCell>
      ))}
    </TableRow>
  );
}
