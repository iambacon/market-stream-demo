"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { TableCell, TableRow } from "@/features/shared/ui/table";
import { useMarketStream } from "../hooks/use-market-stream";
import { cn } from "@/lib/utils";

interface MarketGridRowProps {
  symbol: string;
}

/**
 * MarketGridRow
 *
 * An atomised row component that subscribes to its own data stream.
 * Ensures that price updates only trigger a re-render of this specific row.
 */
export function MarketGridRow({ symbol }: MarketGridRowProps) {
  const { data, hasError } = useMarketStream({ topic: symbol });
  const [flash, setFlash] = useState<
    "bg-success/5" | "bg-destructive/5" | null
  >(null);
  const prevPrice = useRef<number | null>(null);

  // High-performance visual feedback for the grid
  useEffect(() => {
    if (data?.bid) {
      const currentPrice = Number(data.bid);
      if (prevPrice.current !== null) {
        if (currentPrice > prevPrice.current) setFlash("bg-success/5");
        else if (currentPrice < prevPrice.current) setFlash("bg-destructive/5");
      }
      prevPrice.current = currentPrice;
      const timer = setTimeout(() => setFlash(null), 800);
      return () => clearTimeout(timer);
    }
  }, [data?.bid]);

  const cells = useMemo(() => {
    if (!data) return [];

    return [
      symbol.replace(/^t/, ""),
      Number(data.bid).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      Number(data.ask).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      `${Number(data.volume).toFixed(1)}k`,
    ];
  }, [data, symbol]);

  if (!data) {
    return (
      <TableRow className="h-11 border-b">
        <TableCell className="font-bold">{symbol.replace(/^t/, "")}</TableCell>
        <TableCell colSpan={3} className="text-xs text-muted-foreground italic">
          {hasError ? (
            <span className="text-destructive font-medium">Connection failed</span>
          ) : (
            <span className="animate-pulse">Connecting...</span>
          )}
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow
      className={cn("h-11 border-b transition-colors duration-300", flash)}
    >
      {cells.map((cell, i) => (
        <TableCell
          key={i}
          className={cn(
            "font-mono text-xs",
            i === 0 ? "font-bold text-foreground" : "text-muted-foreground",
          )}
        >
          {cell}
        </TableCell>
      ))}
    </TableRow>
  );
}
