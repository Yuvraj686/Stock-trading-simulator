import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Markets from "./pages/Markets.tsx";
import Portfolio from "./pages/Portfolio.tsx";
import Holdings from "./pages/Holdings.tsx";
import Transactions from "./pages/Transactions.tsx";
import WatchlistPage from "./pages/Watchlist.tsx";
import { Login } from "./pages/Login.tsx";
import { Signup } from "./pages/Signup.tsx";
import { PortfolioProvider } from "./context/PortfolioContext.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";

const queryClient = new QueryClient();

/** Redirect to /login if no auth token is present */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PortfolioProvider>
            <Routes>
              {/* Auth pages — no guard */}
              <Route path="/login"  element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected pages */}
              <Route path="/"            element={<PrivateRoute><Markets /></PrivateRoute>} />
              <Route path="/dashboard"   element={<PrivateRoute><Index /></PrivateRoute>} />
              <Route path="/markets"     element={<PrivateRoute><Markets /></PrivateRoute>} />
              <Route path="/portfolio"   element={<PrivateRoute><Portfolio /></PrivateRoute>} />
              <Route path="/holdings"    element={<PrivateRoute><Holdings /></PrivateRoute>} />
              <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
              <Route path="/watchlist"   element={<PrivateRoute><WatchlistPage /></PrivateRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </PortfolioProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
