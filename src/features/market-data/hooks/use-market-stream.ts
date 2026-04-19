import { useState, useEffect, useMemo } from 'react';
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
}

/**
 * useMarketStream
 * 
 * A custom hook that subscribes to a real-time market data topic.
 * It handles the connection lifecycle, data transformation, and 
 * provides the latest state to the UI.
 */
export function useMarketStream({ topic, config }: UseMarketStreamOptions) {
  const [data, setData] = useState<TransformedMarketData | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');

  // Memoize the transformer to prevent recreation on every render
  const transformer = useMemo(() => new DataTransformer(config), [config]);

  useEffect(() => {
    // 1. Listen for connection status changes
    const unsubStatus = marketStream.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    // 2. Connect to the service
    marketStream.connect();

    // 3. Subscribe to the specific topic
    const unsubTopic = marketStream.subscribe(topic, (event) => {
      const transformed = transformer.transform(event.data);
      setData(transformed);
    });

    // 4. Cleanup: Dispose of subscriptions on unmount
    return () => {
      unsubStatus();
      unsubTopic();
    };
  }, [topic, transformer]);

  return {
    data,
    status,
    isConnected: status === 'connected',
  };
}
