import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, Bot, MessageSquare, ListChecks, Settings, ChevronRight,
  Menu, User, LogOut, Cpu, Database, Shield, BarChart3
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarTrigger, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import geminiLogo from '@/assets/gemini-logo.png';

const navigationItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home, description: 'Overview' },
  { title: 'Workflows', url: '/automation', icon: Cpu, description: 'Automation' },
  { title: 'Recordings', url: '/recordings', icon: Database, description: 'Library' },
  { title: 'AI Agents', url: '/agents', icon: Bot, description: 'AI tools' },
  { title: 'Analytics', url: '/tasks', icon: BarChart3, description: 'Metrics' },
  { title: 'Settings', url: '/settings', icon: Settings, description: 'Config' },
  { title: 'Admin', url: '/admin', icon: Shield, description: 'Admin', adminOnly: true }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase.rpc('is_admin');
        if (!error) setIsAdmin(!!data);
      } catch (error) {
        console.error('[Sidebar] Failed to check admin status:', error);
      }
    };
    checkAdminStatus();
  }, [user]);

  const visibleItems = navigationItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-3">
          {!collapsed && (
            <>
              <div className="relative">
                <img src={geminiLogo} alt="Gemini Logo" className="h-8 w-8 object-contain" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-sidebar-background" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">WZRD.work</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Ready
                </span>
              </div>
            </>
          )}
          {collapsed && (
            <div className="relative mx-auto">
              <img src={geminiLogo} alt="Gemini Logo" className="h-6 w-6 object-contain" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full ring-1 ring-sidebar-background" />
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-md transition-all relative ${
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-cyan-500 before:rounded-r'
                            : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="flex-1">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <Button variant="outline" size={collapsed ? "icon" : "sm"} onClick={signOut} className="w-full justify-start">
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
