import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { WatchlistProvider } from "@/contexts/WatchlistContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import AllMovies from "./pages/AllMovies";
import AllTvShows from "./pages/AllTvShows";
import Search from "./pages/Search";
import MyList from "./pages/MyList";
import TelegramAdmin from "./pages/TelegramAdmin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

// Initialize admin user for GitHub Pages deployment
import "./lib/initAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <WatchlistProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ProtectedRoute>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/movies" element={<AllMovies />} />
                <Route path="/tv-shows" element={<AllTvShows />} />
                <Route path="/search" element={<Search />} />
                <Route path="/my-list" element={<MyList />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/telegram" element={<TelegramAdmin />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ProtectedRoute>
          </BrowserRouter>
        </TooltipProvider>
      </WatchlistProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
