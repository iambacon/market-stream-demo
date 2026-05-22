import { MarketDashboard } from "@/features/market-data/components/market-dashboard";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <header className="border-b bg-muted/30 p-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              MarketStream
            </h1>
            <p className="text-sm text-muted-foreground">
              Professional Market Data Interface
            </p>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a
              href="https://github.com/iambacon"
              target="_blank"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://iambacon.co.uk"
              target="_blank"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Portfolio
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <MarketDashboard />
        </div>
      </main>

      <footer className="border-t bg-muted/10 p-10 mt-auto">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Colin Bacon
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-medium tracking-widest text-muted-foreground/60 uppercase">
              Real-time Stream Demo
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
