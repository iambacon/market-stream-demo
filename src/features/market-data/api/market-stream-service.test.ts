import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MarketStreamService } from "./market-stream-service";

class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;
  static instances: MockWebSocket[] = [];

  readonly url: string;
  readyState = MockWebSocket.CONNECTING;
  sent: string[] = [];
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string | URL) {
    this.url = String(url);
    MockWebSocket.instances.push(this);
  }

  send(message: string): void {
    this.sent.push(message);
  }

  close(): void {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({} as CloseEvent);
  }

  open(): void {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.({} as Event);
  }

  receive(message: unknown): void {
    this.onmessage?.({ data: JSON.stringify(message) } as MessageEvent);
  }
}

describe("MarketStreamService", () => {
  beforeEach(() => {
    MockWebSocket.instances = [];
    vi.stubGlobal("WebSocket", MockWebSocket);
    vi.spyOn(Math, "random").mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("reference counts local subscribers and unsubscribes upstream once", () => {
    const service = new MarketStreamService();
    const firstUnsubscribe = service.subscribe("BTCUSD", vi.fn());
    const secondUnsubscribe = service.subscribe("tBTCUSD", vi.fn());
    const socket = MockWebSocket.instances[0];

    socket.open();
    expect(socket.sent.map((message) => JSON.parse(message))).toEqual([
      { event: "subscribe", channel: "ticker", symbol: "tBTCUSD" },
    ]);

    socket.receive({ event: "subscribed", chanId: 42, symbol: "tBTCUSD" });
    firstUnsubscribe();
    expect(socket.sent).toHaveLength(1);

    secondUnsubscribe();
    expect(socket.sent.map((message) => JSON.parse(message))).toEqual([
      { event: "subscribe", channel: "ticker", symbol: "tBTCUSD" },
      { event: "unsubscribe", chanId: 42 },
    ]);

    service.disconnect();
  });

  it("parses ticker updates and stores typed history", () => {
    vi.setSystemTime(new Date("2026-06-10T12:00:00.000Z"));
    const service = new MarketStreamService();
    const callback = vi.fn();
    service.subscribe("ETHUSD", callback);
    const socket = MockWebSocket.instances[0];

    socket.open();
    socket.receive({ event: "subscribed", chanId: 7, symbol: "tETHUSD" });
    socket.receive([7, [1617.9, 2, 1618.1, 3, 0, 0, 0, 33102.4]]);

    expect(callback).toHaveBeenCalledWith({
      topic: "tETHUSD",
      data: {
        bid: 1617.9,
        ask: 1618.1,
        volume: 33102.4,
        timestamp: "2026-06-10T12:00:00.000Z",
      },
    });
    expect(service.getCachedData("ETHUSD").history).toEqual([
      {
        value: 1617.9,
        timestamp: "2026-06-10T12:00:00.000Z",
      },
    ]);

    service.disconnect();
  });

  it("reconnects when the initial connection closes before opening", () => {
    vi.useFakeTimers();
    const service = new MarketStreamService();
    service.subscribe("SOLUSD", vi.fn());

    MockWebSocket.instances[0].close();
    expect(service.getStatus()).toBe("disconnected");

    vi.advanceTimersByTime(1_000);
    expect(MockWebSocket.instances).toHaveLength(2);
    expect(service.getStatus()).toBe("connecting");

    service.disconnect();
  });

  it("does not reconnect after an explicit disconnect", () => {
    vi.useFakeTimers();
    const service = new MarketStreamService();
    service.subscribe("DOTUSD", vi.fn());

    service.disconnect();
    vi.advanceTimersByTime(60_000);

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(service.getStatus()).toBe("disconnected");
  });

  it("closes the socket after the final subscriber stays idle", () => {
    vi.useFakeTimers();
    const service = new MarketStreamService();
    const unsubscribe = service.subscribe("BTCUSD", vi.fn());
    const socket = MockWebSocket.instances[0];
    socket.open();
    socket.receive({ event: "subscribed", chanId: 42, symbol: "tBTCUSD" });

    unsubscribe();
    vi.advanceTimersByTime(999);
    expect(socket.readyState).toBe(MockWebSocket.OPEN);

    vi.advanceTimersByTime(1);
    expect(socket.readyState).toBe(MockWebSocket.CLOSED);
    expect(service.getStatus()).toBe("disconnected");
  });
});
