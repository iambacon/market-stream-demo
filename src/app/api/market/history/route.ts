import { NextResponse } from 'next/server';

/**
 * Market History Proxy
 * 
 * Server-side route to bypass CORS and provide a resilient 
 * endpoint for fetching historical market data.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const limit = searchParams.get('limit') || '30';

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  try {
    const bitfinexSymbol = symbol.startsWith('t') ? symbol : `t${symbol}`;
    const url = `https://api-pub.bitfinex.com/v2/trades/${bitfinexSymbol}/hist?limit=${limit}`;
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (!response.ok) {
      throw new Error("Bitfinex responded with status: " + response.status);
    }

    const data = await response.json();
    
    // Map Bitfinex format: [ID, MTS, AMOUNT, PRICE]
    const history = data.map((t: [number, number, number, number]) => ({
      value: t[3],
      timestamp: new Date(t[1]).toISOString(),
    })).reverse();

    return NextResponse.json(history);
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Failed to fetch market history' }, { status: 500 });
  }
}
