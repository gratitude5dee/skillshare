import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Bot, 
  MessageSquare, 
  ListChecks, 
  Settings,
  ChevronRight,
  Sparkles,
  Video,
  Menu,
  User,
  LogOut,
  Cpu,
  Database
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import manusLogo from '@/assets/manus-logo.png';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
    description: 'Overview and analytics'
  },
  {
    title: 'Automation',
    url: '/automation',
    icon: Cpu,
    description: 'Execute workflows'
  },
  {
    title: 'Recordings',
    url: '/recordings',
    icon: Database,
    description: 'Workflow library'
  },
  {
    title: 'AI Agents',
    url: '/agents',
    icon: Bot,
    description: 'All AI tools & agents'
  },
  {
    title: 'AI Chat',
    url: '/chat',
    icon: MessageSquare,
    description: 'Natural language chat'
  },
  {
    title: 'Tasks',
    url: '/tasks',
    icon: ListChecks,
    description: 'Monitor task progress'
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
    description: 'Preferences and configuration'
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { signOut, user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center justify-between px-3 py-4">
          <div className="flex items-center gap-3">
            <img src={manusLogo} alt="Manus" className="h-8 w-auto" />
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-foreground">SkillShare</h1>
                <p className="text-xs text-muted-foreground">powered by Gemini</p>
              </div>
            )}
          </div>
          <SidebarTrigger className="p-2 hover:bg-muted rounded-md">
            <Menu className="h-4 w-4" />
          </SidebarTrigger>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </div>
                        </div>
                      )}
                      {!collapsed && isActive(item.url) && (
                        <ChevronRight className="h-3 w-3 flex-shrink-0" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-3">
        <div className="space-y-2">
          {/* User info */}
          <div className="flex items-center gap-3 px-2 py-2">
            <User className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground truncate">
                  Welcome back, {user?.email?.split('@')[0] || 'User'}
                </div>
              </div>
            )}
          </div>
          
          {/* Sign out button */}
          <Button 
            variant="outline" 
            size={collapsed ? "icon" : "sm"}
            onClick={signOut}
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}