import { useState, useEffect, useMemo, useRef } from 'react';
import { marketStream } from '../api/market-stream-service';
import { getAssetHistory } from '../api/asset-service';
import { DataTransformer } from '../lib/data-transformer';
import { 
  ConnectionStatus, 
  TransformedMarketData, 
  TransformerConfig 
} from '../types';

interface UseMarketStreamOptions {
  topic: string;
  config: TransformerConfig;
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
export function useMarketStream({ topic, config, historyLimit = 30 }: UseMarketStreamOptions) {
  // 1. Initialize from Cache for immediate display
  const cached = marketStream.getCachedData(topic);
  const transformer = useMemo(() => new DataTransformer(config), [config]);
  
  const initialData = cached.latest ? transformer.transform(cached.latest) : null;
  const [data, setData] = useState<TransformedMarketData | null>(initialData);
  const [history, setHistory] = useState<HistoryPoint[]>(cached.history.slice(-historyLimit));
  const [status, setStatus] = useState<ConnectionStatus>(marketStream.getStatus());

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
      // The service already updated the cache, we just update local state
      const transformed = transformer.transform(event.data);
      setData(transformed);
      
      // Sync local history with the service's updated cache
      const updatedCache = marketStream.getCachedData(topic);
      setHistory(updatedCache.history.slice(-historyLimit));
    });

    return () => {
      unsubStatus();
      unsubTopic();
    };
  }, [topic, transformer, historyLimit, cached.history.length]);

  return {
    data,
    history,
    status,
    isConnected: status === 'connected',
  };
}
