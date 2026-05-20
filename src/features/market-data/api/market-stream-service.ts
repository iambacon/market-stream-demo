import { ConnectionStatus, StreamEvent } from "../types";

type EventCallback = (event: StreamEvent) => void;
type StatusCallback = (status: ConnectionStatus) => void;

interface CachedData {
  latest: Record<string, unknown> | null;
  history: { value: number; timestamp: string }[];
}

/**
 * MarketStreamService (Bitfinex Implementation with Shared Cache)
 *
 * Now includes a persistent cache to ensure that data survives
 * component unmounting (e.g., when switching between Grid and Cards).
 */
export class MarketStreamService {
  private socket: WebSocket | null = null;
  private status: ConnectionStatus = "disconnected";
  private subscribers: Map<string, Set<EventCallback>> = new Map();
  private statusListeners: Set<StatusCallback> = new Set();
  private channelMap: Map<number, string> = new Map();

  // SHARED CACHE: The source of truth for all components
  private dataCache: Map<string, CachedData> = new Map();

  private readonly WSS_URL = "wss://api-pub.bitfinex.com/ws/2";

  public connect(): void {
    if (
      this.socket ||
      this.status === "connected" ||
      this.status === "connecting"
    )
      return;

    try {
      this.updateStatus("connecting");
      this.socket = new WebSocket(this.WSS_URL);

      this.socket.onopen = () => {
        this.updateStatus("connected");
        this.subscribers.forEach((_, symbol) =>
          this.sendSubscribeMessage(symbol),
        );
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.event === "subscribed") {
          this.channelMap.set(data.chanId, data.symbol);
          return;
        }

        if (!Array.isArray(data) || data[1] === "hb") return;

        const [chanId, tickerData] = data;
        const symbol = this.channelMap.get(chanId);

        if (symbol && Array.isArray(tickerData)) {
          const rawData = {
            bid: tickerData[0],
            ask: tickerData[2],
            volume: tickerData[7],
          };

          // Update Cache
          this.updateCache(symbol, rawData);

          const callbacks = this.subscribers.get(symbol);
          if (callbacks) {
            callbacks.forEach((cb) => cb({ topic: symbol, data: rawData }));
          }
        }
      };

      this.socket.onclose = () => {
        this.updateStatus("disconnected");
        this.socket = null;
        this.channelMap.clear();
      };

      this.socket.onerror = (err) => {
        console.error("MarketStreamService: WebSocket error", err);
      };
    } catch (error) {
      console.error("MarketStreamService: Connection failed", error);
      this.updateStatus("disconnected");
    }
  }

  private updateCache(symbol: string, data: Record<string, unknown>) {
    const existing = this.dataCache.get(symbol) || {
      latest: null,
      history: [],
    };
    const newPoint = {
      value: Number(data.bid),
      timestamp: new Date().toISOString(),
    };

    this.dataCache.set(symbol, {
      latest: data,
      history: [...existing.history, newPoint].slice(-50), // Store last 50 points
    });
  }

  /**
   * Seed history from external source (e.g. REST API)
   */
  public setCachedHistory(
    symbol: string,
    history: { value: number; timestamp: string }[],
  ) {
    const existing = this.dataCache.get(symbol) || {
      latest: null,
      history: [],
    };
    // Only seed if we don't already have history
    if (existing.history.length === 0) {
      this.dataCache.set(symbol, { ...existing, history });
    }
  }

  public getCachedData(symbol: string): CachedData {
    // Return a copy to prevent direct mutation
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
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
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
        // We keep the cache even after unsubscribe for quick re-mounting
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
