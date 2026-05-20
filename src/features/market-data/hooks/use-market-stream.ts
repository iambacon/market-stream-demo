import { useState, useEffect } from "react";
import { marketStream } from "../api/market-stream-service";
import { getAssetHistory } from "../api/asset-service";
import { ConnectionStatus, TransformedMarketData } from "../types";

interface UseMarketStreamOptions {
  topic: string;
  historyLimit?: number;
}

interface HistoryPoint {
  value: number;
  timestamp: string;
}

/**
 * useMarketStream
 *
 * Refactored to use the MarketStreamService's shared cache.
 * Ensures instantaneous data availability when switching views.
 */
export function useMarketStream({
  topic,
  historyLimit = 30,
}: UseMarketStreamOptions) {
  // 1. Initialise from Cache for immediate display
  const cached = marketStream.getCachedData(topic);

  const initialData = cached.latest
    ? { ...cached.latest, timestamp: new Date().toISOString() }
    : null;
  const [data, setData] = useState<TransformedMarketData | null>(initialData);
  const [history, setHistory] = useState<HistoryPoint[]>(
    cached.history.slice(-historyLimit),
  );
  const [status, setStatus] = useState<ConnectionStatus>(
    marketStream.getStatus(),
  );

  useEffect(() => {
    // 2. Fetch history only if the cache is empty
    async function loadHistory() {
      if (cached.history.length === 0) {
        const snapshot = await getAssetHistory(topic, historyLimit);
        marketStream.setCachedHistory(topic, snapshot);
        setHistory(snapshot);
      }
    }

    loadHistory();

    const unsubStatus = marketStream.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    marketStream.connect();

    const unsubTopic = marketStream.subscribe(topic, (event) => {
      // Add a local timestamp for UI updates
      const transformed = {
        ...event.data,
        timestamp: new Date().toISOString(),
      };
      setData(transformed);

      // Sync local history with the service's updated cache
      const updatedCache = marketStream.getCachedData(topic);
      setHistory(updatedCache.history.slice(-historyLimit));
    });

    return () => {
      unsubStatus();
      unsubTopic();
    };
  }, [topic, historyLimit, cached.history.length]);

  return {
    data,
    history,
    status,
    isConnected: status === "connected",
  };
}
