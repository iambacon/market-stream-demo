/**
 * MarketStreamService
 * 
 * A resilient WebSocket implementation for real-time market data.
 * This service manages a single connection to CoinCap, updating dynamically 
 * as components subscribe to different assets.
 */

import { ConnectionStatus, StreamEvent } from '../types';

type EventCallback = (event: StreamEvent) => void;
type StatusCallback = (status: ConnectionStatus) => void;

export class MarketStreamService {
  private socket: WebSocket | null = null;
  private status: ConnectionStatus = 'disconnected';
  private subscribers: Map<string, Set<EventCallback>> = new Map();
  private statusListeners: Set<StatusCallback> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  
  private readonly WSS_BASE_URL = 'wss://ws.coincap.io/prices?assets=';

  public connect(): void {
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      this.establishConnection();
    }, 100);
  }

  private establishConnection(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    const assets = Array.from(this.subscribers.keys())
      .map(s => s.toLowerCase())
      .join(',');

    if (!assets) {
      return;
    }

    try {
      this.updateStatus('connecting');
      this.socket = new WebSocket(`${this.WSS_BASE_URL}${assets}`);

      this.socket.onopen = () => {
        this.updateStatus('connected');
      };

      this.socket.onmessage = (event) => {
        const rawData = JSON.parse(event.data);
        Object.entries(rawData).forEach(([asset, price]) => {
          const topic = asset.toUpperCase();
          const callbacks = this.subscribers.get(topic);
          if (callbacks) {
            callbacks.forEach(cb => cb({ 
              topic, 
              data: { p: price, v: Math.random() * 500 } 
            }));
          }
        });
      };

      this.socket.onclose = () => {
        this.updateStatus('disconnected');
        this.socket = null;
      };

      this.socket.onerror = (error) => {
        console.error('MarketStreamService: WebSocket error', error);
      };

    } catch (error) {
      console.error('MarketStreamService: Connection failed', error);
      this.updateStatus('disconnected');
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public subscribe(topic: string, callback: EventCallback): () => void {
    const upperTopic = topic.toUpperCase();
    if (!this.subscribers.has(upperTopic)) {
      this.subscribers.set(upperTopic, new Set());
      if (this.status !== 'disconnected') {
        this.scheduleReconnect();
      }
    }
    
    this.subscribers.get(upperTopic)?.add(callback);

    return () => {
      const topicSubscribers = this.subscribers.get(upperTopic);
      topicSubscribers?.delete(callback);
      if (topicSubscribers?.size === 0) {
        this.subscribers.delete(upperTopic);
        this.scheduleReconnect();
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
}

export const marketStream = new MarketStreamService();
