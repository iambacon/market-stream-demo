import { afterEach, describe, expect, it, vi } from "vitest";
import { getAssetHistory } from "./asset-service";

describe("getAssetHistory", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shares an in-flight request for the same symbol and limit", async () => {
    let resolveResponse: ((response: Response) => void) | undefined;
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveResponse = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const first = getAssetHistory("BTCUSD", 30);
    const second = getAssetHistory("btcusd", 30);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveResponse?.(
      new Response(
        JSON.stringify([
          { value: 61_551, timestamp: "2026-06-10T12:00:00.000Z" },
        ]),
      ),
    );

    await expect(first).resolves.toHaveLength(1);
    await expect(second).resolves.toHaveLength(1);
  });
});
