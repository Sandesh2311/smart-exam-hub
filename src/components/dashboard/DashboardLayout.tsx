import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider, 
  SidebarTrigger,
  useSidebar 
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Mic, 
  Save, 
  CreditCard, 
  Settings,
  LogOut,
  Crown,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "MCQ Generator", url: "/dashboard/mcq", icon: BookOpen },
  { title: "Question Paper", url: "/dashboard/paper", icon: FileText },
  { title: "Voice to Notes", url: "/dashboard/voice", icon: Mic },
  { title: "Saved Content", url: "/dashboard/saved", icon: Save },
  { title: "Subscription", url: "/dashboard/subscription", icon: CreditCard },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

function DashboardSidebar() {
  const { profile, signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const getPlanBadge = () => {
    if (!profile) return null;
    const planStyles = {
      free: "badge-free",
      monthly: "badge-monthly",
      lifetime: "badge-lifetime",
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planStyles[profile.plan]}`}>
        {profile.plan === "lifetime" && <Crown className="w-3 h-3 inline mr-1" />}
        {profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)}
      </span>
    );
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
            <span className="text-lg">🔥</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="font-display font-bold text-sm text-sidebar-foreground block truncate">
                Smart Exam
              </span>
              {getPlanBadge()}
            </div>
          )}
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/dashboard"}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-4 border-t border-sidebar-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={signOut}
        >
          <LogOut className="w-5 h-5 mr-3" />
          {!collapsed && "Log Out"}
        </Button>
      </div>
    </Sidebar>
  );
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto">
          <header className="h-14 border-b border-border flex items-center px-4 gap-4 bg-background sticky top-0 z-10">
            <SidebarTrigger>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SidebarTrigger>
          </header>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
