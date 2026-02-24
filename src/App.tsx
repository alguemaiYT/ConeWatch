import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Overview from "@/pages/Overview";
import LiveDebug from "@/pages/LiveDebug";
import CameraProfiles from "@/pages/CameraProfiles";
import EnvironmentPresets from "@/pages/EnvironmentPresets";
import SessionDetail from "@/pages/SessionDetail";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Overview />} />
            <Route path="/live-debug" element={<LiveDebug />} />
            <Route path="/camera-profiles" element={<CameraProfiles />} />
            <Route path="/environments" element={<EnvironmentPresets />} />
            <Route path="/sessions/:id" element={<SessionDetail />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
