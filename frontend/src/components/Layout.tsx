import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { MarketTicker } from "./MarketTicker";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <MarketTicker />
          <main className="flex-1 space-y-6 p-4 md:p-6">
            {children}
            <footer className="pb-2 pt-4 text-center text-[11px] text-muted-foreground">
              Tradr · Paper trading simulator · Prices are simulated and do not reflect real markets.
            </footer>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
