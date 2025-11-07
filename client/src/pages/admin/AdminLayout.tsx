import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, Music2, FileText, Settings as SettingsIcon, LogOut, Scan } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Scanner",
    url: "/",
    icon: Scan,
    absolute: true,  // Non-admin route needs absolute path
  },
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    absolute: false,  // Relative to /admin base
  },
  {
    title: "Songs",
    url: "/songs",
    icon: Music2,
    absolute: false,  // Relative to /admin base
  },
  {
    title: "Challenges",
    url: "/challenges",
    icon: FileText,
    absolute: false,  // Relative to /admin base
  },
  {
    title: "Settings",
    url: "/settings",
    icon: SettingsIcon,
    absolute: false,  // Relative to /admin base
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  onNavigateToScanner?: () => void;
}

export function AdminLayout({ children, onNavigateToScanner }: AdminLayoutProps) {
  const [location] = useLocation();
  
  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    window.location.href = "/";
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-lg font-bold text-primary">
                American Split AI
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    // useLocation() inside Router base="/admin" returns base-relative paths
                    // So location will be "/songs" when at "/admin/songs"
                    // Skip active state for absolute items (Scanner) to avoid conflicts
                    const isActive = !item.absolute && location === item.url;
                    
                    // For absolute paths (like Scanner), use onClick handler with root navigation
                    if (item.absolute) {
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton 
                            data-active={isActive}
                            onClick={() => onNavigateToScanner?.()}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    }
                    
                    // For relative paths within admin, use Link
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild data-active={isActive}>
                          <Link href={item.url}>
                            <Icon className="w-4 h-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup className="mt-auto">
              <SidebarGroupContent>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="text-sm text-muted-foreground">
              Admin Panel
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
