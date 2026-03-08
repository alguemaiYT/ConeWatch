import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Overview from "@/pages/Overview";
const LiveDebug = lazy(() => import("@/pages/LiveDebug"));
const CameraProfiles = lazy(() => import("@/pages/CameraProfiles"));
const EnvironmentPresets = lazy(() => import("@/pages/EnvironmentPresets"));
const SessionDetail = lazy(() => import("@/pages/SessionDetail"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const routeFallback = (
  <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
    Loading page...
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Overview />} />
            <Route
              path="/live-debug"
              element={
                <Suspense fallback={routeFallback}>
                  <LiveDebug />
                </Suspense>
              }
            />
            <Route
              path="/camera-profiles"
              element={
                <Suspense fallback={routeFallback}>
                  <CameraProfiles />
                </Suspense>
              }
            />
            <Route
              path="/environments"
              element={
                <Suspense fallback={routeFallback}>
                  <EnvironmentPresets />
                </Suspense>
              }
            />
            <Route
              path="/sessions/:id"
              element={
                <Suspense fallback={routeFallback}>
                  <SessionDetail />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="*"
            element={
              <Suspense fallback={routeFallback}>
                <NotFound />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
