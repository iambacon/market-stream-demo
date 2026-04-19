import { MarketDashboard } from '@/features/market-data/components/market-dashboard';
import { Badge } from '@/features/shared/ui/badge';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <header className="border-b bg-muted/30 p-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tighter">MarketStream Demo</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-full">Next.js 15 (App Router)</Badge>
              <Badge variant="outline" className="rounded-full">Tailwind 4</Badge>
              <Badge variant="outline" className="rounded-full">SignalR Simulation</Badge>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            <a href="https://github.com/iambacon" target="_blank" className="hover:underline">GitHub</a>
            <a href="https://iambacon.co.uk" target="_blank" className="hover:underline">Portfolio</a>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 p-6 md:p-10">
        <div className="container mx-auto max-w-6xl">
          <section className="mb-12">
            <div className="rounded-xl border border-border bg-card/50 p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-4">The "Bridge Engineer" Strategy</h2>
              <p className="text-muted-foreground leading-relaxed max-w-3xl">
                This project demonstrates the architectural bridge between <strong>Modern Frontend Frameworks</strong> 
                and <strong>High-Stakes Real-Time Data</strong>. By decoupling the simulation service, 
                data transformation logic, and UI components, we achieve a maintainable, 
                performant dashboard suitable for mission-critical trading environments.
              </p>
            </div>
          </section>

          <MarketDashboard />
        </div>
      </main>

      <footer className="border-t bg-muted/10 p-10 mt-auto">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground">
            Built by <strong>Colin Bacon</strong> &bull; Senior Software Engineer
          </p>
          <div className="flex items-center gap-4 grayscale opacity-60">
            {/* Simple text logos for tech stack icons */}
            <span className="text-xs font-black">REACT 19</span>
            <span className="text-xs font-black">TYPESCRIPT</span>
            <span className="text-xs font-black">VITE / VITEST</span>
            <span className="text-xs font-black">PNPM</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
