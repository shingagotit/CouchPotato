import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FirebaseAuthProvider } from "@/contexts/FirebaseAuthContext";
import { WatchlistProvider } from "@/contexts/WatchlistContext";
import FirebaseProtectedRoute from "@/components/auth/FirebaseProtectedRoute";
import Index from "./pages/Index";
import AllMovies from "./pages/AllMovies";
import AllTvShows from "./pages/AllTvShows";
import Search from "./pages/Search";
import MyList from "./pages/MyList";
import UserSettings from "./pages/UserSettings";
import TelegramAdmin from "./pages/TelegramAdmin";
import AdminDashboard from "./pages/AdminDashboard";
import FirebaseAdminDashboard from "./pages/FirebaseAdminDashboard";
import FirebaseAuth from "./pages/FirebaseAuth";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";

// Initialize Firebase
import "./lib/firebase";
import "./lib/firebase-init";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FirebaseAuthProvider>
      <WatchlistProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<FirebaseAuth />} />
              <Route path="/firebase-auth" element={<FirebaseAuth />} />
              <Route path="/app" element={
                <FirebaseProtectedRoute>
                  <Index />
                </FirebaseProtectedRoute>
              } />
              <Route path="/CouchPotato/" element={<LandingPage />} />
              <Route path="/CouchPotato/auth" element={<FirebaseAuth />} />
              <Route path="/CouchPotato/firebase-auth" element={<FirebaseAuth />} />
              <Route path="/CouchPotato/app" element={
                <FirebaseProtectedRoute>
                  <Index />
                </FirebaseProtectedRoute>
              } />
              <Route path="/movies" element={
                <FirebaseProtectedRoute>
                  <AllMovies />
                </FirebaseProtectedRoute>
              } />
              <Route path="/tv-shows" element={
                <FirebaseProtectedRoute>
                  <AllTvShows />
                </FirebaseProtectedRoute>
              } />
              <Route path="/search" element={
                <FirebaseProtectedRoute>
                  <Search />
                </FirebaseProtectedRoute>
              } />
              <Route path="/my-list" element={
                <FirebaseProtectedRoute>
                  <MyList />
                </FirebaseProtectedRoute>
              } />
              <Route path="/settings" element={
                <FirebaseProtectedRoute>
                  <UserSettings />
                </FirebaseProtectedRoute>
              } />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/firebase-admin" element={<FirebaseAdminDashboard />} />
              <Route path="/admin/telegram" element={<TelegramAdmin />} />
              
              {/* GitHub Pages routes with CouchPotato prefix */}
              <Route path="/CouchPotato/movies" element={
                <FirebaseProtectedRoute>
                  <AllMovies />
                </FirebaseProtectedRoute>
              } />
              <Route path="/CouchPotato/tv-shows" element={
                <FirebaseProtectedRoute>
                  <AllTvShows />
                </FirebaseProtectedRoute>
              } />
              <Route path="/CouchPotato/search" element={
                <FirebaseProtectedRoute>
                  <Search />
                </FirebaseProtectedRoute>
              } />
              <Route path="/CouchPotato/my-list" element={
                <FirebaseProtectedRoute>
                  <MyList />
                </FirebaseProtectedRoute>
              } />
              <Route path="/CouchPotato/settings" element={
                <FirebaseProtectedRoute>
                  <UserSettings />
                </FirebaseProtectedRoute>
              } />
              <Route path="/CouchPotato/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/CouchPotato/firebase-admin" element={<FirebaseAdminDashboard />} />
              <Route path="/CouchPotato/admin/telegram" element={<TelegramAdmin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </WatchlistProvider>
    </FirebaseAuthProvider>
  </QueryClientProvider>
);

export default App;
