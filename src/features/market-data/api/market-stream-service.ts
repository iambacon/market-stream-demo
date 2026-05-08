/**
 * MarketStreamService (Bitfinex Implementation)
 * 
 * A professional message-based WebSocket client. 
 * Handles dynamic subscriptions, channel mapping, and positional array parsing.
 */

import { ConnectionStatus, StreamEvent } from '../types';

type EventCallback = (event: StreamEvent) => void;
type StatusCallback = (status: ConnectionStatus) => void;

export class MarketStreamService {
  private socket: WebSocket | null = null;
  private status: ConnectionStatus = 'disconnected';
  private subscribers: Map<string, Set<EventCallback>> = new Map();
  private statusListeners: Set<StatusCallback> = new Set();
  
  // Maps Bitfinex chanId to Symbol (e.g., 12345 -> 'BTCUSD')
  private channelMap: Map<number, string> = new Map();
  
  private readonly WSS_URL = 'wss://api-pub.bitfinex.com/ws/2';

  public connect(): void {
    if (this.socket || this.status === 'connected') return;

    try {
      this.updateStatus('connecting');
      this.socket = new WebSocket(this.WSS_URL);

      this.socket.onopen = () => {
        this.updateStatus('connected');
        // Resubscribe to existing topics on reconnection
        this.subscribers.forEach((_, symbol) => this.sendSubscribeMessage(symbol));
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // 1. Handle Control Messages (Handshake/Subscription)
        if (data.event === 'subscribed') {
          this.channelMap.set(data.chanId, data.symbol);
          console.log("MarketStreamService: Subscribed to", data.symbol);
          return;
        }

        // 2. Handle Heartbeats & Snapshots (Ignore for now)
        if (!Array.isArray(data) || data[1] === 'hb') return;

        // 3. Handle Ticker Updates
        // Bitfinex Ticker format: [chanId, [BID, BID_SIZE, ASK, ASK_SIZE, DAILY_CHG, ...]]
        const [chanId, tickerData] = data;
        const symbol = this.channelMap.get(chanId);

        if (symbol && Array.isArray(tickerData)) {
          const callbacks = this.subscribers.get(symbol);
          if (callbacks) {
            callbacks.forEach(cb => cb({ 
              topic: symbol, 
              data: { 
                p: tickerData[0], // Using BID as the primary price point
                a: tickerData[2], // ASK
                v: tickerData[7], // VOLUME
              } 
            }));
          }
        }
      };

      this.socket.onclose = () => {
        this.updateStatus('disconnected');
        this.socket = null;
        this.channelMap.clear();
      };

      this.socket.onerror = (err) => {
        console.error('MarketStreamService: WebSocket error', err);
      };

    } catch (error) {
      console.error('MarketStreamService: Connection failed', error);
      this.updateStatus('disconnected');
    }
  }

  private sendSubscribeMessage(symbol: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        event: 'subscribe',
        channel: 'ticker',
        symbol: symbol.startsWith('t') ? symbol : `t${symbol}`
      }));
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public subscribe(topic: string, callback: EventCallback): () => void {
    // Bitfinex expects symbols like tBTCUSD
    const bitfinexSymbol = topic.startsWith('t') ? topic : `t${topic}`;
    
    if (!this.subscribers.has(bitfinexSymbol)) {
      this.subscribers.set(bitfinexSymbol, new Set());
      this.sendSubscribeMessage(bitfinexSymbol);
    }
    
    this.subscribers.get(bitfinexSymbol)?.add(callback);

    return () => {
      const topicSubscribers = this.subscribers.get(bitfinexSymbol);
      topicSubscribers?.delete(callback);
      if (topicSubscribers?.size === 0) {
        this.subscribers.delete(bitfinexSymbol);
        // Bitfinex unsubscribe could be added here for completeness
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
