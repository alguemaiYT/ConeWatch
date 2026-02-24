import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border px-4 bg-card/50 backdrop-blur-sm shrink-0">
            <SidebarTrigger className="mr-3" />
            <span className="text-xs font-mono text-muted-foreground tracking-wider uppercase">
              Cone Detector v4
            </span>
            <div className="ml-auto flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
              <span className="text-xs font-mono text-muted-foreground">System Online</span>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
