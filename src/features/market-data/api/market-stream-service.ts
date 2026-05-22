import { ConnectionStatus, StreamEvent } from "../types";

type EventCallback = (event: StreamEvent) => void;
type StatusCallback = (status: ConnectionStatus) => void;

interface CachedData {
  latest: Record<string, unknown> | null;
  history: { value: number; timestamp: string }[];
}

/**
 * MarketStreamService (Bitfinex Implementation with Shared Cache & Resilience)
 *
 * Provides institutional-grade connectivity with automatic reconnection,
 * shared data caching, and heartbeat monitoring.
 */
export class MarketStreamService {
  private socket: WebSocket | null = null;
  private status: ConnectionStatus = "disconnected";
  private subscribers: Map<string, Set<EventCallback>> = new Map();
  private statusListeners: Set<StatusCallback> = new Set();
  private channelMap: Map<number, string> = new Map();
  
  // Resilience state
  private reconnectAttempt = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private lastMessageTime = 0;
  
  private readonly MAX_RECONNECT_DELAY = 30000;
  private readonly HEARTBEAT_INTERVAL = 5000;
  private readonly STALE_THRESHOLD = 15000;

  // SHARED CACHE: The source of truth for all components
  private dataCache: Map<string, CachedData> = new Map();

  private readonly WSS_URL = "wss://api-pub.bitfinex.com/ws/2";

  public connect(): void {
    if (this.socket || this.status === "connecting") return;

    this.clearTimers();

    try {
      this.updateStatus("connecting");
      this.socket = new WebSocket(this.WSS_URL);

      this.socket.onopen = () => {
        this.updateStatus("connected");
        this.reconnectAttempt = 0;
        this.lastMessageTime = Date.now();
        this.startHeartbeat();
        
        // Re-subscribe to all active topics
        this.subscribers.forEach((_, symbol) => this.sendSubscribeMessage(symbol));
      };

      this.socket.onmessage = (event) => {
        this.lastMessageTime = Date.now();
        const data = JSON.parse(event.data);

        if (data.event === "subscribed") {
          this.channelMap.set(data.chanId, data.symbol);
          return;
        }

        // Bitfinex sends 'hb' as the second element for heartbeats
        if (!Array.isArray(data) || data[1] === "hb") return;

        const [chanId, tickerData] = data;
        const symbol = this.channelMap.get(chanId);

        if (symbol && Array.isArray(tickerData)) {
          const rawData = {
            bid: tickerData[0],
            ask: tickerData[2],
            volume: tickerData[7],
          };

          this.updateCache(symbol, rawData);

          const callbacks = this.subscribers.get(symbol);
          if (callbacks) {
            callbacks.forEach((cb) => cb({ topic: symbol, data: rawData }));
          }
        }
      };

      this.socket.onclose = () => {
        const wasConnected = this.status === "connected";
        this.handleDisconnect();
        if (wasConnected) this.scheduleReconnect();
      };

      this.socket.onerror = () => {
        this.socket?.close();
      };
    } catch (error) {
      console.error("MarketStreamService: Connection failed", error);
      this.handleDisconnect();
      this.scheduleReconnect();
    }
  }

  private handleDisconnect(): void {
    this.updateStatus("disconnected");
    this.socket = null;
    this.channelMap.clear();
    this.clearTimers();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempt),
      this.MAX_RECONNECT_DELAY
    );

    this.reconnectAttempt++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      const elapsed = Date.now() - this.lastMessageTime;
      if (elapsed > this.STALE_THRESHOLD) {
        console.warn("MarketStreamService: Connection stale, reconnecting...");
        this.socket?.close();
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  private clearTimers(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
  }

  private updateCache(symbol: string, data: Record<string, unknown>) {
    const existing = this.dataCache.get(symbol) || { latest: null, history: [] };
    const newPoint = {
      value: Number(data.bid),
      timestamp: new Date().toISOString(),
    };

    this.dataCache.set(symbol, {
      latest: data,
      history: [...existing.history, newPoint].slice(-50),
    });
  }

  public setCachedHistory(symbol: string, history: { value: number; timestamp: string }[]) {
    const existing = this.dataCache.get(symbol) || { latest: null, history: [] };
    if (existing.history.length === 0) {
      this.dataCache.set(symbol, { ...existing, history });
    }
  }

  public getCachedData(symbol: string): CachedData {
    return this.dataCache.get(symbol) || { latest: null, history: [] };
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  private sendSubscribeMessage(symbol: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          event: "subscribe",
          channel: "ticker",
          symbol: symbol.startsWith("t") ? symbol : `t${symbol}`,
        }),
      );
    }
  }

  public disconnect(): void {
    this.handleDisconnect();
  }

  public subscribe(topic: string, callback: EventCallback): () => void {
    const bitfinexSymbol = topic.startsWith("t") ? topic : `t${topic}`;

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
      }
    };
  }

  public onStatusChange(callback: StatusCallback): () => void {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  private updateStatus(newStatus: ConnectionStatus): void {
    this.status = newStatus;
    this.statusListeners.forEach((cb) => cb(newStatus));
  }
}

export const marketStream = new MarketStreamService();
