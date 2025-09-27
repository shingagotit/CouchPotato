import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WatchlistProvider } from "@/contexts/WatchlistContext";
import Index from "./pages/Index";
import AllMovies from "./pages/AllMovies";
import AllTvShows from "./pages/AllTvShows";
import Search from "./pages/Search";
import MyList from "./pages/MyList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const SimpleApp = () => (
  <QueryClientProvider client={queryClient}>
    <WatchlistProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/movies" element={<AllMovies />} />
            <Route path="/tv-shows" element={<AllTvShows />} />
            <Route path="/search" element={<Search />} />
            <Route path="/my-list" element={<MyList />} />
            <Route path="/CouchPotato/" element={<Index />} />
            <Route path="/CouchPotato/movies" element={<AllMovies />} />
            <Route path="/CouchPotato/tv-shows" element={<AllTvShows />} />
            <Route path="/CouchPotato/search" element={<Search />} />
            <Route path="/CouchPotato/my-list" element={<MyList />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </WatchlistProvider>
  </QueryClientProvider>
);

export default SimpleApp;
