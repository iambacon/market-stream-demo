import { useState, useEffect } from "react";
import { marketStream } from "../api/market-stream-service";
import { getAssetHistory } from "../api/asset-service";
import { ConnectionStatus, HistoryPoint, MarketData } from "../types";

interface UseMarketStreamOptions {
  topic: string;
  historyLimit?: number;
}

export function useMarketStream({
  topic,
  historyLimit = 30,
}: UseMarketStreamOptions) {
  const cached = marketStream.getCachedData(topic);

  const [data, setData] = useState<MarketData | null>(cached.latest);
  const [history, setHistory] = useState<HistoryPoint[]>(
    cached.history.slice(-historyLimit),
  );
  const [status, setStatus] = useState<ConnectionStatus>(
    marketStream.getStatus(),
  );
  const [historyError, setHistoryError] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    let isActive = true;
    const currentCache = marketStream.getCachedData(topic);

    async function loadHistory() {
      if (currentCache.history.length === 0) {
        try {
          const snapshot = await getAssetHistory(topic, historyLimit);
          if (!isActive) return;

          marketStream.setCachedHistory(topic, snapshot);
          setHistory(
            marketStream.getCachedData(topic).history.slice(-historyLimit),
          );
        } catch (error) {
          if (!isActive) return;

          console.error(`useMarketStream: Failed to load history for ${topic}`, error);
          setHistoryError(true);
        }
      }
    }

    loadHistory();

    const unsubStatus = marketStream.onStatusChange((newStatus) => {
      setStatus(newStatus);
      if (newStatus === "connected") {
        setConnectionError(false);
      } else if (newStatus === "disconnected") {
        setConnectionError(true);
      }
    });

    const unsubTopic = marketStream.subscribe(topic, (event) => {
      setData(event.data);

      const updatedCache = marketStream.getCachedData(topic);
      setHistory(updatedCache.history.slice(-historyLimit));
    });

    return () => {
      isActive = false;
      unsubStatus();
      unsubTopic();
    };
  }, [topic, historyLimit]);

  return {
    data,
    history,
    status,
    historyError,
    connectionError,
    isConnected: status === "connected",
  };
}
