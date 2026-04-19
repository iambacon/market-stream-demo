/**
 * MarketStreamService
 * 
 * A framework-agnostic simulator for a real-time data stream (e.g., SignalR).
 * 
 * This service mimics a connection to a trading data provider, emitting 
 * raw, compressed data packets at regular intervals. It handles multiple 
 * subscriptions and connection state management.
 */

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export interface StreamEvent {
  topic: string;
  data: Record<string, any>;
}

type EventCallback = (event: StreamEvent) => void;
type StatusCallback = (status: ConnectionStatus) => void;

export class MarketStreamService {
  private status: ConnectionStatus = 'disconnected';
  private subscribers: Map<string, Set<EventCallback>> = new Map();
  private statusListeners: Set<StatusCallback> = new Set();
  private intervalId: NodeJS.Timeout | null = null;

  constructor(private tickIntervalMs: number = 2000) {}

  public connect(): void {
    if (this.status === 'connected') return;

    this.updateStatus('connecting');
    
    // Simulate network latency
    setTimeout(() => {
      this.updateStatus('connected');
      this.startStreaming();
    }, 1000);
  }

  public disconnect(): void {
    this.stopStreaming();
    this.updateStatus('disconnected');
  }

  public subscribe(topic: string, callback: EventCallback): () => void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    
    this.subscribers.get(topic)?.add(callback);

    // Return an unsubscribe function (Disposable pattern)
    return () => {
      const topicSubscribers = this.subscribers.get(topic);
      topicSubscribers?.delete(callback);
      if (topicSubscribers?.size === 0) {
        this.subscribers.delete(topic);
      }
    };
  }

  public onStatusChange(callback: StatusCallback): () => void {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  private updateStatus(newStatus: ConnectionStatus): void {
    this.status = newStatus;
    this.statusListeners.forEach(cb => cb(newStatus));
  }

  private startStreaming(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.generateTicks();
    }, this.tickIntervalMs);
  }

  private stopStreaming(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private generateTicks(): void {
    // Only generate data for active topics
    this.subscribers.forEach((callbacks, topic) => {
      const data = this.getMockDataForTopic(topic);
      callbacks.forEach(cb => cb({ topic, data }));
    });
  }

  private getMockDataForTopic(topic: string): Record<string, any> {
    // Mimicking the "compressed keys" from the Enterprise SignalR stream
    // g = bid, a = ask, v = volume
    const basePrice = topic === 'BTC/USD' ? 65000 : 2500;
    const jitter = (Math.random() - 0.5) * (basePrice * 0.001);
    
    return {
      g: basePrice + jitter,
      a: basePrice + jitter + (Math.random() * 2),
      v: Math.floor(Math.random() * 1000)
    };
  }
}

// Export a singleton instance for simplicity in this demo, 
// though a Provider pattern could also be used.
export const marketStream = new MarketStreamService();
