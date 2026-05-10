import { Bell, Search, Plus, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { STOCKS, fmtUSD } from "@/lib/marketData";
import { ChangeBadge } from "./ChangeBadge";
import { usePortfolio } from "@/context/PortfolioContext";
import { useTheme } from "@/context/ThemeContext";
import { useState, useRef } from "react";
import { DepositModal } from "./DepositModal";
import { NotificationsPanel } from "./NotificationsPanel";

const titles: Record<string, { title: string; sub: string }> = {
  "/":             { title: "Markets",      sub: "Real-time simulated quotes across sectors" },
  "/dashboard":    { title: "Dashboard",    sub: "Markets open · Live paper trading" },
  "/markets":      { title: "Markets",      sub: "Real-time simulated quotes across sectors" },
  "/portfolio":    { title: "Portfolio",    sub: "Your equity, cash, and performance" },
  "/holdings":     { title: "Holdings",     sub: "All open positions with live P&L" },
  "/transactions": { title: "Transactions", sub: "Complete order history" },
  "/watchlist":    { title: "Watchlist",    sub: "Tickers you're tracking" },
  "/community":    { title: "Community",    sub: "Group chat for all traders" },
};

export function TopBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { setSelectedSymbol } = usePortfolio();
  const [query, setQuery] = useState("");
  const [depositOpen, setDepositOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);

  const meta = titles[pathname] ?? titles["/"];

  const filtered = query
    ? STOCKS.filter(
        (s) =>
          s.symbol.toLowerCase().includes(query.toLowerCase()) ||
          s.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const pickStock = (sym: string) => {
    setSelectedSymbol(sym);
    setQuery("");
    navigate("/");
  };

  return (
    <>
      <header className="flex items-center gap-3 border-b border-border bg-background/60 px-4 py-4 backdrop-blur-md md:px-6">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="min-w-0">
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground truncate">{meta.title}</h1>
          <p className="text-xs text-muted-foreground truncate">{meta.sub}</p>
        </div>

        <div className="ml-6 hidden md:flex flex-1 max-w-md items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-muted-foreground focus-within:border-primary/40 transition-colors relative">
          <Search className="h-4 w-4" />
          <input
            aria-label="Search stocks"
            placeholder="Search ticker, e.g. AAPL"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground/70 text-foreground"
          />
          <kbd className="hidden md:inline rounded border border-border px-1.5 py-0.5 text-[10px] font-mono">⌘K</kbd>

          {filtered.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto scrollbar-thin rounded-xl border border-border bg-popover shadow-card">
              {filtered.map((s) => (
                <button
                  key={s.symbol}
                  onClick={() => pickStock(s.symbol)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-surface-elevated/60 transition-colors"
                >
                  <div>
                    <div className="font-mono font-semibold text-foreground text-sm">{s.symbol}</div>
                    <div className="text-[11px] text-muted-foreground">{s.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono tabular-nums text-sm text-foreground">{fmtUSD(s.price)}</div>
                    <ChangeBadge value={s.changePct} className="mt-0.5" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>



        <div className="ml-auto flex items-center gap-2 relative">
          <ThemeToggle />
          <Button
            ref={bellRef}
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setNotifOpen((prev) => !prev)}
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
          </Button>
          <Button
            className="gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
            onClick={() => setDepositOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Deposit
          </Button>

          <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} anchorRef={bellRef} />
        </div>
      </header>

      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} />
    </>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="relative"
    >
      <Sun className={`h-4 w-4 transition-all ${isDark ? "scale-0 -rotate-90" : "scale-100 rotate-0"}`} />
      <Moon className={`absolute h-4 w-4 transition-all ${isDark ? "scale-100 rotate-0" : "scale-0 rotate-90"}`} />
    </Button>
  );
}
