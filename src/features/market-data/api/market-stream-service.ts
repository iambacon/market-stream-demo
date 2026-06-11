import {
  ConnectionStatus,
  HistoryPoint,
  MarketData,
  StreamEvent,
} from "../types";

type EventCallback = (event: StreamEvent) => void;
type StatusCallback = (status: ConnectionStatus) => void;

interface CachedData {
  latest: MarketData | null;
  history: HistoryPoint[];
}

export class MarketStreamService {
  private socket: WebSocket | null = null;
  private status: ConnectionStatus = "disconnected";
  private subscribers: Map<string, Set<EventCallback>> = new Map();
  private statusListeners: Set<StatusCallback> = new Set();
  private channelMap: Map<number, string> = new Map();
  private symbolChannels: Map<string, number> = new Map();

  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private idleDisconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private lastMessageTime = 0;

  private dataCache: Map<string, CachedData> = new Map();

  private static readonly WSS_URL = "wss://api-pub.bitfinex.com/ws/2";
  private static readonly MAX_RECONNECT_DELAY = 30_000;
  private static readonly HEARTBEAT_INTERVAL = 5_000;
  private static readonly STALE_THRESHOLD = 15_000;
  private static readonly IDLE_DISCONNECT_DELAY = 1_000;
  private static readonly MAX_HISTORY_POINTS = 50;

  public connect(): void {
    if (this.socket || this.status === "connecting") return;

    this.clearReconnectTimer();

    try {
      this.updateStatus("connecting");
      const socket = new WebSocket(MarketStreamService.WSS_URL);
      this.socket = socket;

      socket.onopen = () => {
        if (this.socket !== socket) return;

        this.updateStatus("connected");
        this.reconnectAttempt = 0;
        this.lastMessageTime = Date.now();
        this.startHeartbeat();

        this.subscribers.forEach((_, symbol) =>
          this.sendSubscribeMessage(symbol),
        );
      };

      socket.onmessage = (event) => {
        if (this.socket !== socket || typeof event.data !== "string") return;

        this.lastMessageTime = Date.now();
        try {
          this.handleMessage(JSON.parse(event.data));
        } catch (error) {
          console.warn("MarketStreamService: Ignored malformed message", error);
        }
      };

      socket.onclose = () => {
        if (this.socket !== socket) return;

        this.handleDisconnect();
        if (this.subscribers.size > 0) this.scheduleReconnect();
      };

      socket.onerror = () => {
        if (this.socket === socket) socket.close();
      };
    } catch (error) {
      console.error("MarketStreamService: Connection failed", error);
      this.handleDisconnect();
      if (this.subscribers.size > 0) this.scheduleReconnect();
    }
  }

  private handleMessage(message: unknown): void {
    if (isSubscribedEvent(message)) {
      const symbol = normalizeSymbol(message.symbol);

      if (!this.subscribers.has(symbol)) {
        this.sendUnsubscribeMessage(message.chanId);
        return;
      }

      this.channelMap.set(message.chanId, symbol);
      this.symbolChannels.set(symbol, message.chanId);
      return;
    }

    if (isUnsubscribedEvent(message)) {
      const symbol = this.channelMap.get(message.chanId);
      this.channelMap.delete(message.chanId);
      if (symbol) this.symbolChannels.delete(symbol);
      return;
    }

    if (!isTickerUpdate(message)) return;

    const [channelId, ticker] = message;
    const symbol = this.channelMap.get(channelId);
    if (!symbol) return;

    const data: MarketData = {
      bid: ticker[0],
      ask: ticker[2],
      volume: ticker[7],
      timestamp: new Date().toISOString(),
    };

    this.updateCache(symbol, data);
    this.subscribers
      .get(symbol)
      ?.forEach((callback) => callback({ topic: symbol, data }));
  }

  private handleDisconnect(): void {
    this.updateStatus("disconnected");
    this.socket = null;
    this.channelMap.clear();
    this.symbolChannels.clear();
    this.clearHeartbeatTimer();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    const exponentialDelay = 1_000 * 2 ** this.reconnectAttempt;
    const jitter = 0.5 + Math.random();
    const delay = Math.min(
      exponentialDelay * jitter,
      MarketStreamService.MAX_RECONNECT_DELAY,
    );

    this.reconnectAttempt++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    this.clearHeartbeatTimer();
    this.heartbeatTimer = setInterval(() => {
      const elapsed = Date.now() - this.lastMessageTime;
      if (elapsed > MarketStreamService.STALE_THRESHOLD) {
        console.warn("MarketStreamService: Connection stale, reconnecting...");
        this.socket?.close();
      }
    }, MarketStreamService.HEARTBEAT_INTERVAL);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private clearHeartbeatTimer(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  private clearIdleDisconnectTimer(): void {
    if (this.idleDisconnectTimer) clearTimeout(this.idleDisconnectTimer);
    this.idleDisconnectTimer = null;
  }

  private scheduleIdleDisconnect(): void {
    this.clearIdleDisconnectTimer();
    this.idleDisconnectTimer = setTimeout(() => {
      this.idleDisconnectTimer = null;
      if (this.subscribers.size === 0) this.disconnect();
    }, MarketStreamService.IDLE_DISCONNECT_DELAY);
  }

  private updateCache(symbol: string, data: MarketData): void {
    const existing = this.dataCache.get(symbol) || { latest: null, history: [] };
    const newPoint = {
      value: data.bid,
      timestamp: data.timestamp,
    };

    this.dataCache.set(symbol, {
      latest: data,
      history: [...existing.history, newPoint].slice(
        -MarketStreamService.MAX_HISTORY_POINTS,
      ),
    });
  }

  public setCachedHistory(symbol: string, history: HistoryPoint[]): void {
    const normalizedSymbol = normalizeSymbol(symbol);
    const existing = this.dataCache.get(normalizedSymbol) || {
      latest: null,
      history: [],
    };
    const pointsByTimestamp = new Map(
      [...history, ...existing.history].map((point) => [point.timestamp, point]),
    );
    const mergedHistory = [...pointsByTimestamp.values()]
      .sort((left, right) => left.timestamp.localeCompare(right.timestamp))
      .slice(-MarketStreamService.MAX_HISTORY_POINTS);

    this.dataCache.set(normalizedSymbol, {
      ...existing,
      history: mergedHistory,
    });
  }

  public getCachedData(symbol: string): CachedData {
    return (
      this.dataCache.get(normalizeSymbol(symbol)) || {
        latest: null,
        history: [],
      }
    );
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
          symbol,
        }),
      );
    }
  }

  private sendUnsubscribeMessage(channelId: number): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          event: "unsubscribe",
          chanId: channelId,
        }),
      );
    }
  }

  public disconnect(): void {
    const socket = this.socket;
    this.socket = null;
    this.clearReconnectTimer();
    this.clearHeartbeatTimer();
    this.clearIdleDisconnectTimer();
    this.channelMap.clear();
    this.symbolChannels.clear();
    this.reconnectAttempt = 0;
    socket?.close();
    this.handleDisconnect();
  }

  public subscribe(topic: string, callback: EventCallback): () => void {
    const symbol = normalizeSymbol(topic);
    this.clearIdleDisconnectTimer();

    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
      this.sendSubscribeMessage(symbol);
    }

    this.subscribers.get(symbol)?.add(callback);
    this.connect();

    return () => {
      const topicSubscribers = this.subscribers.get(symbol);
      topicSubscribers?.delete(callback);
      if (topicSubscribers?.size === 0) {
        this.subscribers.delete(symbol);
        const channelId = this.symbolChannels.get(symbol);
        if (channelId !== undefined) {
          this.sendUnsubscribeMessage(channelId);
          this.symbolChannels.delete(symbol);
          this.channelMap.delete(channelId);
        }
        if (this.subscribers.size === 0) {
          this.clearReconnectTimer();
          this.scheduleIdleDisconnect();
        }
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

function normalizeSymbol(symbol: string): string {
  const upperSymbol = symbol.toUpperCase();
  return upperSymbol.startsWith("T") ? `t${upperSymbol.slice(1)}` : `t${upperSymbol}`;
}

function isSubscribedEvent(
  value: unknown,
): value is { event: "subscribed"; chanId: number; symbol: string } {
  if (!isRecord(value)) return false;
  return (
    value.event === "subscribed" &&
    typeof value.chanId === "number" &&
    typeof value.symbol === "string"
  );
}

function isUnsubscribedEvent(
  value: unknown,
): value is { event: "unsubscribed"; chanId: number } {
  if (!isRecord(value)) return false;
  return value.event === "unsubscribed" && typeof value.chanId === "number";
}

function isTickerUpdate(
  value: unknown,
): value is [number, [number, number, number, number, number, number, number, number]] {
  if (!Array.isArray(value) || typeof value[0] !== "number") return false;
  const ticker = value[1];
  return (
    Array.isArray(ticker) &&
    ticker.length >= 8 &&
    typeof ticker[0] === "number" &&
    typeof ticker[2] === "number" &&
    typeof ticker[7] === "number"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
