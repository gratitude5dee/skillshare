import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Link, BarChart3, Calendar, Search, Bot } from 'lucide-react';

interface AgentGridProps {
  onAgentSelect: (agentId: string) => void;
}

const agentCategories = {
  CREATE: {
    icon: Sparkles,
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
    agents: [
      { 
        id: 'viral-content', 
        name: '5 Viral Content Ideas', 
        description: 'Analyze current trends and generate 5 unique content ideas tailored to your brand and audience',
        category: 'CREATE'
      },
      { 
        id: 'corporate-partnerships', 
        name: 'Corporate Partnership Finder', 
        description: 'Identify brand partnership opportunities based on audience analysis and market research',
        category: 'CREATE'
      },
      { 
        id: 'image-style-extractor', 
        name: 'Image to Style Extractor', 
        description: 'Extract comprehensive style guides from images including color palettes and design elements',
        category: 'CREATE'
      },
      { 
        id: 'youtube-thumbnails', 
        name: 'YouTube Thumbnail Optimizer', 
        description: 'Analyze and improve video thumbnails for better click-through rates',
        category: 'CREATE'
      }
    ]
  },
  CONNECT: {
    icon: Link,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    agents: [
      { 
        id: 'trend-analysis', 
        name: 'Add Your Spin to Trends', 
        description: 'Analyze current trends and create authentic participation strategies for your brand',
        category: 'CONNECT'
      },
      { 
        id: 'cross-promotion', 
        name: 'Artist Cross-Promotion Finder', 
        description: 'Find compatible artists and creators for mutual audience growth opportunities',
        category: 'CONNECT'
      },
      { 
        id: 'comment-priority', 
        name: 'Comment Response Priority', 
        description: 'Analyze and prioritize social media comments across all platforms for optimal engagement',
        category: 'CONNECT'
      },
      { 
        id: 'podcast-guests', 
        name: 'Find Podcast Guests', 
        description: 'Discover 10 niche creators perfect for podcast guest opportunities',
        category: 'CONNECT'
      }
    ]
  },
  REPORT: {
    icon: BarChart3,
    color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    agents: [
      { 
        id: 'brand-audit', 
        name: 'Brand Audit', 
        description: 'Comprehensive multi-platform brand analysis with actionable recommendations',
        category: 'REPORT'
      },
      { 
        id: 'social-trends', 
        name: 'Daily Social Trends', 
        description: 'Automated daily social media trends report aligned with your brand',
        category: 'REPORT'
      },
      { 
        id: 'performance-dashboard', 
        name: 'Weekly Performance Dashboard', 
        description: 'Automated weekly performance analytics across all platforms',
        category: 'REPORT'
      },
      { 
        id: 'youtube-revenue', 
        name: 'YouTube Revenue Report', 
        description: 'Comprehensive YouTube revenue and performance analysis',
        category: 'REPORT'
      }
    ]
  },
  PLAN: {
    icon: Calendar,
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300',
    agents: [
      { 
        id: 'brand-redesign', 
        name: 'Brand Redesign with Mockups', 
        description: 'Complete brand overhaul with visual mockups and implementation roadmap',
        category: 'PLAN'
      },
      { 
        id: 'content-calendar', 
        name: 'Content Calendar Creator', 
        description: 'Strategic monthly content calendar with cross-platform coordination',
        category: 'PLAN'
      },
      { 
        id: 'release-strategy', 
        name: 'Release Launch Strategy', 
        description: 'Comprehensive release launch strategy with timeline and tactics',
        category: 'PLAN'
      },
      { 
        id: 'tour-planning', 
        name: 'Tour Planning Strategy', 
        description: 'Complete tour planning with logistics, marketing, and revenue optimization',
        category: 'PLAN'
      }
    ]
  },
  RESEARCH: {
    icon: Search,
    color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
    agents: [
      { 
        id: 'competitor-analysis', 
        name: 'Copy Your Top 3 Competitors', 
        description: 'Research top competitors and extract actionable tactics for your brand',
        category: 'RESEARCH'
      },
      { 
        id: 'cross-platform-audit', 
        name: 'Cross-Platform Social Audit', 
        description: 'Complete health check of all social media platforms with optimization plan',
        category: 'RESEARCH'
      },
      { 
        id: 'valuable-fans', 
        name: 'Find Your Most Valuable Fans', 
        description: 'Identify highest-spending fans for targeted monetization strategies',
        category: 'RESEARCH'
      },
      { 
        id: 'playlist-finder', 
        name: 'Spotify Playlist Placement Finder', 
        description: 'Find playlists for maximum streams and discovery opportunities',
        category: 'RESEARCH'
      }
    ]
  }
};

// Flatten all agents into a single array
const allAgents = Object.values(agentCategories).flatMap(category => 
  category.agents.map(agent => ({
    ...agent,
    categoryIcon: category.icon,
    categoryColor: category.color
  }))
);

export const AgentGrid: React.FC<AgentGridProps> = ({ onAgentSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {allAgents.map((agent) => {
        const CategoryIcon = agent.categoryIcon;
        return (
          <Card 
            key={agent.id} 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer group hover:scale-[1.02]"
            onClick={() => onAgentSelect(agent.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className={`${agent.categoryColor} border-0 text-xs font-medium`}>
                      <CategoryIcon className="w-3 h-3 mr-1" />
                      {agent.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    {agent.name}
                  </CardTitle>
                </div>
                <div className="ml-3 p-2 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors">
                  <Bot className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm line-clamp-3 leading-relaxed">
                {agent.description}
              </CardDescription>
              <div className="mt-4 flex items-center text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Agent
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};