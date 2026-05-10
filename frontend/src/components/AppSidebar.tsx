import {
  LayoutDashboard,
  LineChart,
  Wallet,
  History,
  Star,
  Settings,
  HelpCircle,
  Activity,
  Briefcase,
  MessageSquare,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const nav = [
  { label: "Markets",      icon: LineChart,       to: "/" },
  { label: "Dashboard",    icon: LayoutDashboard, to: "/dashboard" },
  { label: "Portfolio",    icon: Wallet,          to: "/portfolio" },
  { label: "Holdings",     icon: Briefcase,       to: "/holdings" },
  { label: "Transactions", icon: History,         to: "/transactions" },
  { label: "Watchlist",    icon: Star,            to: "/watchlist" },
  { label: "Community",    icon: MessageSquare,    to: "/community" },
];

const bottom = [
  { label: "Settings", icon: Settings },
  { label: "Help",     icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <NavLink to="/" className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-primary shadow-glow">
            <Activity className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-display text-lg font-bold leading-none text-foreground">Tradr</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Simulator</div>
            </div>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map(({ label, icon: Icon, to }) => {
                const active = isActive(to);
                return (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton asChild tooltip={label} isActive={active}>
                      <NavLink
                        to={to}
                        end={to === "/"}
                        className={cn(
                          "flex items-center gap-3 transition-colors",
                          active
                            ? "bg-sidebar-accent text-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                        )}
                      >
                        <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                        <span>{label}</span>
                        {active && !collapsed && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottom.map(({ label, icon: Icon }) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton tooltip={label}>
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className={cn("flex items-center gap-2.5 rounded-lg p-2", !collapsed && "bg-sidebar-accent/40")}>
          <div className="h-8 w-8 shrink-0 rounded-full gradient-primary flex items-center justify-center font-bold text-primary-foreground text-sm">
            A
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-foreground">Alex Morgan</div>
              <div className="truncate text-xs text-muted-foreground">Pro Trader</div>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
