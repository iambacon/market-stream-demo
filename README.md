# MarketStream: Professional Market Data Interface

A high-frequency trading dashboard prototype focused on performance, resilience, and real-time data orchestration using React and Next.js 15.

## 🚀 Technical Highlights

### 1. Atomic Rendering Architecture
The dashboard utilises an **Atomic Rendering** strategy to handle high-frequency WebSocket updates. Instead of re-rendering the entire dashboard or even the table, each row (`MarketGridRow`) and card (`MarketCard`) maintains its own isolated subscription to the market stream. This ensures O(1) render performance relative to the size of the watchlist.

### 2. Institutional-Grade Resilience
The `MarketStreamService` is built for production stability:
- **Exponential Backoff**: Automatic reconnection logic with jitter to prevent server thundering herds.
- **Heartbeat Watchdog**: A client-side watchdog that monitors connection "staleness" and force-reconnects if the data stream hangs.
- **Shared Data Cache**: A singleton service manages a central data cache, ensuring that switching between "Grid" and "Card" views is instantaneous with zero data loss or loading states.

### 3. "The Calm Stream" Design System
Built on the principle of **Refined Restraint**, the UI prioritises data clarity over visual noise:
- **OKLCH Colour Space**: All design tokens use perceptual uniformity for high-contrast accessibility.
- **Surgical UI Components**: A custom, pruned UI library built on **Base UI** and **Tailwind 4**, optimised for performance and minimal bundle footprint.
- **British English Standardisation**: Consistent terminology across all user-facing strings and internal documentation.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS 4
- **Real-time**: WebSockets (Bitfinex API)
- **UI Primitives**: Base UI (Headless)
- **Testing**: Vitest
- **Deployment**: Azure Static Web Apps (Hybrid Rendering)

## 📦 Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run unit tests
pnpm test
```

## ☁️ Deployment

This project is configured for **Azure Static Web Apps**. It utilises a "Hybrid" deployment model, where the Next.js App Router and API Proxy routes are deployed as managed Azure Functions.

- **Config**: `staticwebapp.config.json`
- **CI/CD**: GitHub Actions (triggered on push to `main`)

