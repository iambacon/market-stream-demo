'use client';

import { useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/features/shared/ui/table';
import { MarketGridRow } from './market-grid-row';
import { TransformerConfig } from '../types';

interface MarketGridProps {
  symbols: string[];
  config: TransformerConfig;
}

/**
 * MarketGrid
 * 
 * An optimized container for a high-density table. 
 * Orchestrates individual row components to achieve Atomic Rendering.
 */
export function MarketGrid({ symbols, config }: MarketGridProps) {
  // Pre-calculate headers for the skeleton
  const headers = useMemo(() => {
    return ['Symbol', ...config.mappings.map(m => m.label)];
  }, [config]);

  if (symbols.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 border border-dashed rounded-xl bg-muted/5">
        <p className="text-muted-foreground font-medium">Your watchlist is empty.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent border-b">
            {headers.map((header, i) => (
              <TableHead key={i} className="h-10 font-bold uppercase text-[10px] tracking-widest text-muted-foreground">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {symbols.map((symbol) => (
            <MarketGridRow 
              key={symbol} 
              symbol={symbol} 
              config={config} 
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
