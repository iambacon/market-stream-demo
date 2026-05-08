import { useState, useEffect, useMemo, useRef } from 'react';
import { marketStream } from '../api/market-stream-service';
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

/**
 * useMarketStream
 * 
 * A custom hook that subscribes to a real-time market data topic.
 * Now includes a rolling history buffer for visualization.
 */
export function useMarketStream({ topic, config, historyLimit = 20 }: UseMarketStreamOptions) {
  const [data, setData] = useState<TransformedMarketData | null>(null);
  const [history, setHistory] = useState<{ value: number; timestamp: string }[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');

  const transformer = useMemo(() => new DataTransformer(config), [config]);

  useEffect(() => {
    const unsubStatus = marketStream.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    marketStream.connect();

    const unsubTopic = marketStream.subscribe(topic, (event) => {
      const transformed = transformer.transform(event.data);
      setData(transformed);
      
      // Update history buffer for sparklines
      if (transformed.bid) {
        setHistory((prev) => {
          const newPoint = { 
            value: Number(transformed.bid), 
            timestamp: transformed.timestamp || new Date().toISOString() 
          };
          const next = [...prev, newPoint];
          return next.slice(-historyLimit);
        });
      }
    });

    return () => {
      unsubStatus();
      unsubTopic();
    };
  }, [topic, transformer, historyLimit]);

  return {
    data,
    history,
    status,
    isConnected: status === 'connected',
  };
}
