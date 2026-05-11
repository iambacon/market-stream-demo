'use client';

import { useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/features/shared/ui/table';
import { DataTransformer } from '../lib/data-transformer';
import { TransformerConfig } from '../types';
import { cn } from '@/lib/utils';

interface MarketGridProps {
  symbols: string[];
  rawDataMap: Record<string, any>;
  config: TransformerConfig;
}

/**
 * MarketGrid
 * 
 * A high-density table view that uses the DataTransformer.toMatrix 
 * logic to render real-time data. Performs transformation in a 
 * single pass to ensure accurate data formatting.
 */
export function MarketGrid({ symbols, rawDataMap, config }: MarketGridProps) {
  // Generate the matrix from raw data
  const matrix = useMemo(() => {
    // 1. Prepare raw items for the transformer (appending the symbol to each data object)
    const rawItems = symbols
      .filter(s => !!rawDataMap[s])
      .map(s => ({
        ...rawDataMap[s],
        symbol: s.replace(/^t/, '') // Clean Bitfinex 't' prefix for display
      }));
    
    if (rawItems.length === 0) return [[]];

    // 2. Create a grid-specific config that prepends the Symbol column
    const gridConfig: TransformerConfig = {
      mappings: [
        { key: 'symbol', label: 'Symbol' },
        ...config.mappings
      ]
    };
    
    const gridTransformer = new DataTransformer(gridConfig);
    return gridTransformer.toMatrix(rawItems);
  }, [symbols, rawDataMap, config]);

  const headers = matrix[0] || [];
  const rows = matrix.slice(1);

  if (symbols.length === 0 || rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 border border-dashed rounded-xl bg-muted/5">
        <p className="text-muted-foreground font-medium">Waiting for market data...</p>
        <p className="text-xs text-muted-foreground">Data will appear as soon as the first tick is received.</p>
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
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="h-11 border-b last:border-0 hover:bg-muted/30 transition-colors">
              {row.map((cell, cellIndex) => (
                <TableCell 
                  key={cellIndex} 
                  className={cn(
                    "font-mono text-xs py-0",
                    cellIndex === 0 ? "font-bold text-foreground" : "text-muted-foreground"
                  )}
                >
                  {typeof cell === 'number' 
                    ? cell.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                    : cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
