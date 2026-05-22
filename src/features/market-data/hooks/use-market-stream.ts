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

export function useMarketStream({
  topic,
  historyLimit = 30,
}: UseMarketStreamOptions) {
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
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function loadHistory() {
      if (cached.history.length === 0) {
        try {
          const snapshot = await getAssetHistory(topic, historyLimit);
          marketStream.setCachedHistory(topic, snapshot);
          setHistory(snapshot);
          setHasError(false);
        } catch (error) {
          console.error(`useMarketStream: Failed to load history for ${topic}`, error);
          setHasError(true);
        }
      }
    }

    loadHistory();

    const unsubStatus = marketStream.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    marketStream.connect();

    const unsubTopic = marketStream.subscribe(topic, (event) => {
      const transformed = {
        ...event.data,
        timestamp: new Date().toISOString(),
      };
      setData(transformed);

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
    hasError,
    isConnected: status === "connected",
  };
}
