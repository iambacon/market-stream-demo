"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/features/shared/ui/table";
import { MarketGridRow } from "./market-grid-row";

interface MarketGridProps {
  symbols: string[];
}

/**
 * MarketGrid
 *
 * An optimized container for a high-density table.
 * Orchestrates individual row components to achieve Atomic Rendering.
 */
export function MarketGrid({ symbols }: MarketGridProps) {
  const headers = ["Symbol", "Bid", "Ask", "Volume"];

  if (symbols.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 border border-dashed rounded-xl bg-muted/5">
        <p className="text-muted-foreground font-medium">
          Your watchlist is empty.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/60 overflow-hidden bg-background">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent border-b border-border/60">
            {headers.map((header, i) => (
              <TableHead
                key={i}
                className="h-10 font-bold uppercase text-[10px] tracking-widest text-muted-foreground/80"
              >
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {symbols.map((symbol) => (
            <MarketGridRow key={symbol} symbol={symbol} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
