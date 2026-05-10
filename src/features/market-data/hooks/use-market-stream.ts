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
 * Orchestrates a REST snapshot (history) and a WebSocket stream (live).
 * Ensures the UI is pre-populated with data on mount.
 */
export function useMarketStream({ topic, config, historyLimit = 30 }: UseMarketStreamOptions) {
  const [data, setData] = useState<TransformedMarketData | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  
  const historyLoadedRef = useRef(false);
  const transformer = useMemo(() => new DataTransformer(config), [config]);

  useEffect(() => {
    // 1. Initial Snapshot Fetch
    async function loadHistory() {
      const snapshot = await getAssetHistory(topic, historyLimit);
      setHistory(snapshot);
      historyLoadedRef.current = true;
    }
    
    loadHistory();

    // 2. WebSocket Subscription
    const unsubStatus = marketStream.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    marketStream.connect();

    const unsubTopic = marketStream.subscribe(topic, (event) => {
      const transformed = transformer.transform(event.data);
      setData(transformed);
      
      if (transformed.bid) {
        setHistory((prev) => {
          const newPoint = { 
            value: Number(transformed.bid), 
            timestamp: transformed.timestamp || new Date().toISOString() 
          };
          
          // Append new point and maintain limit
          const next = [...prev, newPoint];
          return next.slice(-historyLimit);
        });
      }
    });

    return () => {
      unsubStatus();
      unsubTopic();
      historyLoadedRef.current = false;
    };
  }, [topic, transformer, historyLimit]);

  return {
    data,
    history,
    status,
    isConnected: status === 'connected',
  };
}
