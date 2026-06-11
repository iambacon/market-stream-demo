import { act, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HistoryPoint, StreamEvent } from "../types";

const mocks = vi.hoisted(() => {
  const cache: {
    latest: StreamEvent["data"] | null;
    history: HistoryPoint[];
  } = { latest: null, history: [] };

  return {
    cache,
    subscribe: vi.fn(),
    onStatusChange: vi.fn(),
    getAssetHistory: vi.fn(),
  };
});

vi.mock("../api/market-stream-service", () => ({
  marketStream: {
    getCachedData: () => mocks.cache,
    getStatus: () => "disconnected",
    setCachedHistory: (_topic: string, history: HistoryPoint[]) => {
      mocks.cache.history = history;
    },
    subscribe: mocks.subscribe,
    onStatusChange: mocks.onStatusChange,
  },
}));

vi.mock("../api/asset-service", () => ({
  getAssetHistory: mocks.getAssetHistory,
}));

import { useMarketStream } from "./use-market-stream";

describe("useMarketStream", () => {
  afterEach(() => {
    mocks.cache.latest = null;
    mocks.cache.history = [];
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  it("keeps one subscription while stream updates rerender the hook", async () => {
    const unsubscribeTopic = vi.fn();
    const unsubscribeStatus = vi.fn();
    let emit: ((event: StreamEvent) => void) | undefined;

    mocks.subscribe.mockImplementation(
      (_topic: string, callback: (event: StreamEvent) => void) => {
        emit = callback;
        return unsubscribeTopic;
      },
    );
    mocks.onStatusChange.mockReturnValue(unsubscribeStatus);
    mocks.getAssetHistory.mockResolvedValue([]);

    function Harness() {
      const stream = useMarketStream({ topic: "BTCUSD" });
      useEffect(() => {
        document.body.dataset.bid = String(stream.data?.bid ?? "");
      }, [stream.data]);
      return null;
    }

    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<Harness />);
    });

    await act(async () => {
      const data = {
        bid: 61_551,
        ask: 61_552,
        volume: 1_350_300,
        timestamp: "2026-06-10T12:00:00.000Z",
      };
      mocks.cache.latest = data;
      mocks.cache.history = [{ value: data.bid, timestamp: data.timestamp }];
      emit?.({ topic: "tBTCUSD", data });
    });

    expect(document.body.dataset.bid).toBe("61551");
    expect(mocks.subscribe).toHaveBeenCalledTimes(1);

    await act(async () => {
      root.unmount();
    });
    expect(unsubscribeTopic).toHaveBeenCalledTimes(1);
    expect(unsubscribeStatus).toHaveBeenCalledTimes(1);
  });
});
