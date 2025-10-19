import React from 'react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, MessageSquare, Sparkles, Link, BarChart3, Calendar, Search } from 'lucide-react';
import manusLogo from '@/assets/manus-logo.png';

interface AgentSidebarProps {
  onAgentSelect: (agentId: string) => void;
  onChatSelect: () => void;
}

const agentCategories = {
  CREATE: {
    icon: Sparkles,
    agents: [
      { id: 'viral-content', name: '5 Viral Content Ideas', description: 'Generate trending content ideas' },
      { id: 'corporate-partnerships', name: 'Corporate Partnership Finder', description: 'Find brand partnership opportunities' },
      { id: 'image-style-extractor', name: 'Image to Style Extractor', description: 'Extract style guides from images' },
      { id: 'youtube-thumbnails', name: 'YouTube Thumbnail Optimizer', description: 'Improve video thumbnails' }
    ]
  },
  CONNECT: {
    icon: Link,
    agents: [
      { id: 'trend-analysis', name: 'Add Your Spin to Trends', description: 'Authentic trend participation' },
      { id: 'cross-promotion', name: 'Artist Cross-Promotion Finder', description: 'Find collaboration opportunities' },
      { id: 'comment-priority', name: 'Comment Response Priority', description: 'Prioritize social responses' },
      { id: 'podcast-guests', name: 'Find Podcast Guests', description: 'Discover guest opportunities' },
      { id: 'community-outreach', name: 'Niche Community Outreach', description: 'Connect with communities' },
      { id: 'fan-finder', name: 'Potential Fan Finder', description: 'Automated fan discovery' }
    ]
  },
  REPORT: {
    icon: BarChart3,
    agents: [
      { id: 'brand-audit', name: 'Brand Audit', description: 'Comprehensive brand analysis' },
      { id: 'social-trends', name: 'Daily Social Trends', description: 'Trend reports and insights' },
      { id: 'social-analysis', name: 'Social Media Analysis', description: 'Performance analytics' },
      { id: 'performance-dashboard', name: 'Weekly Performance Dashboard', description: 'Automated reporting' },
      { id: 'release-reports', name: 'Weekly Release Reports', description: 'Track release performance' },
      { id: 'youtube-revenue', name: 'YouTube Revenue Report', description: 'Revenue analytics' }
    ]
  },
  PLAN: {
    icon: Calendar,
    agents: [
      { id: 'brand-redesign', name: 'Brand Redesign with Mockups', description: 'Complete brand overhaul' },
      { id: 'content-calendar', name: 'Content Calendar Creator', description: 'Strategic content planning' },
      { id: 'fan-acquisition', name: 'Find New Fans Visual Map', description: 'Fan growth strategy' },
      { id: 'instagram-management', name: 'Instagram Comment Recap', description: 'Comment management' },
      { id: 'merchandise-strategy', name: 'Merchandise Strategy Plan', description: 'Product strategy' },
      { id: 'release-strategy', name: 'Release Launch Strategy', description: 'Launch planning' },
      { id: 'social-to-shop', name: 'Social Posts to Shop Sales', description: 'Conversion optimization' },
      { id: 'tour-planning', name: 'Tour Planning Strategy', description: 'Tour logistics' }
    ]
  },
  RESEARCH: {
    icon: Search,
    agents: [
      { id: 'competitor-analysis', name: 'Copy Your Top 3 Competitors', description: 'Competitive research' },
      { id: 'cross-platform-audit', name: 'Cross-Platform Social Audit', description: 'Platform health check' },
      { id: 'fan-revenue-analysis', name: 'Fan Segment Revenue Analysis', description: 'Revenue optimization' },
      { id: 'brand-segments', name: 'Find Brand-Ready Segments', description: 'Partnership targeting' },
      { id: 'valuable-fans', name: 'Find Your Most Valuable Fans', description: 'Fan value analysis' },
      { id: 'brand-partnerships', name: 'Instagram Brand Partnership Finder', description: 'Partnership discovery' },
      { id: 'comment-guide', name: 'Instagram Comment Response Guide', description: 'Engagement strategy' },
      { id: 'playlist-finder', name: 'Spotify Playlist Placement Finder', description: 'Playlist strategy' },
      { id: 'top-content', name: 'Top Performing Content Finder', description: 'Content analysis' }
    ]
  }
};

export const AgentSidebar: React.FC<AgentSidebarProps> = ({ onAgentSelect, onChatSelect }) => {
  const { signOut } = useAuth();

  return (
    <Sidebar className="w-80">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src={manusLogo} alt="Manus" className="h-8 w-auto" />
          <div>
            <h1 className="font-bold text-lg text-sidebar-foreground">WZRD.work</h1>
            <p className="text-xs text-sidebar-foreground/70">powered by Gemini</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        {/* Natural Chat Option */}
        <SidebarGroup>
          <SidebarGroupLabel>Chat</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onChatSelect} className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Natural Language Chat
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Agent Categories */}
        {Object.entries(agentCategories).map(([category, { icon: Icon, agents }]) => (
          <SidebarGroup key={category}>
            <SidebarGroupLabel className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {category}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {agents.map((agent) => (
                  <SidebarMenuItem key={agent.id}>
                    <SidebarMenuButton 
                      onClick={() => onAgentSelect(agent.id)}
                      className="w-full justify-start flex-col items-start h-auto py-2"
                    >
                      <span className="font-medium text-sm">{agent.name}</span>
                      <span className="text-xs text-sidebar-foreground/60 mt-1">{agent.description}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer with Sign Out */}
      <div className="p-4 border-t border-sidebar-border mt-auto">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={signOut}
          className="w-full justify-start"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </Sidebar>
  );
};