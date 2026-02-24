import {
  LayoutDashboard, Bug, Camera, CloudSun, FileText,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Live Debug", url: "/live-debug", icon: Bug },
  { title: "Camera Profiles", url: "/camera-profiles", icon: Camera },
  { title: "Environments", url: "/environments", icon: CloudSun },
  { title: "Sessions", url: "/sessions", icon: FileText },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="pt-3">
        <div className="px-4 pb-4 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="text-primary font-mono font-bold text-sm">CD</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground leading-none">Control Center</h2>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">v4.2.1</p>
            </div>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-widest uppercase text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/80 transition-colors"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
