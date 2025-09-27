import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Search, 
  TrendingUp, 
  PenTool, 
  Video, 
  BarChart3,
  Play,
  Eye,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ShortFormWorkflowService } from '@/services/ShortFormWorkflowService';

interface MusicItem {
  id: string;
  source_url: string;
  platform: string;
  title: string;
  artists: string[];
  cover_art_url?: string;
  status?: string;
  created_at: string;
}

interface WorkflowVisualizationProps {
  musicItem: MusicItem;
}

interface WorkflowStage {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  details?: string;
  estimatedTime?: string;
}

export const WorkflowVisualization: React.FC<WorkflowVisualizationProps> = ({ musicItem }) => {
  const [stages, setStages] = useState<WorkflowStage[]>([
    {
      id: 'c0',
      title: 'Resolve & Enrich',
      description: 'Extract metadata, analyze audio features, and generate color palette',
      icon: Search,
      status: 'processing',
      progress: 75,
      estimatedTime: '2-3 minutes'
    },
    {
      id: 'c1',
      title: 'Trend Mining',
      description: 'Discover viral angles and content opportunities',
      icon: TrendingUp,
      status: 'pending',
      progress: 0,
      estimatedTime: '3-5 minutes'
    },
    {
      id: 'c2',
      title: 'Content Generation',
      description: 'Create scripts, captions, and 7-day content calendar',
      icon: PenTool,
      status: 'pending',
      progress: 0,
      estimatedTime: '2-4 minutes'
    },
    {
      id: 'c3',
      title: 'Video Assembly',
      description: 'Generate beat-synced videos and thumbnail variants',
      icon: Video,
      status: 'pending',
      progress: 0,
      estimatedTime: '5-8 minutes'
    },
    {
      id: 'c4',
      title: 'Analytics Setup',
      description: 'Configure performance tracking and optimization loops',
      icon: BarChart3,
      status: 'pending',
      progress: 0,
      estimatedTime: '1-2 minutes'
    }
  ]);

  const [workflowStats, setWorkflowStats] = useState({
    angles: 0,
    content: 0,
    videos: 0,
    thumbnails: 0
  });

  useEffect(() => {
    loadWorkflowStatus();
    const interval = setInterval(loadWorkflowStatus, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [musicItem.id]);

  const loadWorkflowStatus = async () => {
    try {
      const status = await ShortFormWorkflowService.getWorkflowStatus(musicItem.id);
      setWorkflowStats(status.stats);
      
      // Update stage statuses based on actual data
      setStages(prev => prev.map(stage => {
        switch (stage.id) {
          case 'c0':
            if (status.musicItem.title !== 'Processing...') {
              return { ...stage, status: 'completed', progress: 100 };
            }
            return stage;
          case 'c1':
            if (status.stats.angles > 0) {
              return { ...stage, status: 'completed', progress: 100, details: `${status.stats.angles} angles generated` };
            } else if (status.musicItem.title !== 'Processing...') {
              return { ...stage, status: 'processing', progress: 30 };
            }
            return stage;
          case 'c2':
            if (status.stats.content > 0) {
              return { ...stage, status: 'completed', progress: 100, details: `${status.stats.content} content pieces` };
            } else if (status.stats.angles > 0) {
              return { ...stage, status: 'processing', progress: 45 };
            }
            return stage;
          case 'c3':
            if (status.stats.videos > 0) {
              return { ...stage, status: 'completed', progress: 100, details: `${status.stats.videos} videos, ${status.stats.thumbnails} thumbnails` };
            } else if (status.stats.content > 0) {
              return { ...stage, status: 'processing', progress: 60 };
            }
            return stage;
          case 'c4':
            if (status.stats.videos > 0) {
              return { ...stage, status: 'processing', progress: 80 };
            }
            return stage;
          default:
            return stage;
        }
      }));
    } catch (error) {
      console.error('Error loading workflow status:', error);
    }
  };

  const getStatusIcon = (stage: WorkflowStage) => {
    switch (stage.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  const overallProgress = stages.reduce((acc, stage) => acc + stage.progress, 0) / stages.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {musicItem.cover_art_url ? (
                <img 
                  src={musicItem.cover_art_url} 
                  alt={musicItem.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                  <Video className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <CardTitle className="text-xl">{musicItem.title}</CardTitle>
                <CardDescription className="text-base">
                  {musicItem.artists?.join(', ') || 'Unknown Artist'}
                </CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {musicItem.platform}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    View Source
                  </Button>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{Math.round(overallProgress)}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Workflow Stages */}
      <div className="grid gap-4">
        {stages.map((stage, index) => (
          <Card key={stage.id} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    stage.status === 'completed' ? 'bg-green-500/10' :
                    stage.status === 'processing' ? 'bg-blue-500/10' :
                    stage.status === 'failed' ? 'bg-red-500/10' :
                    'bg-muted/10'
                  }`}>
                    <stage.icon className={`h-6 w-6 ${
                      stage.status === 'completed' ? 'text-green-500' :
                      stage.status === 'processing' ? 'text-blue-500' :
                      stage.status === 'failed' ? 'text-red-500' :
                      'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{stage.title}</h3>
                      {getStatusIcon(stage)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{stage.description}</p>
                    {stage.details && (
                      <p className="text-xs text-primary font-medium">{stage.details}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant="outline" 
                    className={`mb-2 ${getStatusColor(stage.status)}`}
                  >
                    {stage.status}
                  </Badge>
                  {stage.estimatedTime && stage.status === 'pending' && (
                    <div className="text-xs text-muted-foreground">
                      Est. {stage.estimatedTime}
                    </div>
                  )}
                </div>
              </div>
              
              {stage.progress > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs font-medium">{stage.progress}%</span>
                  </div>
                  <Progress value={stage.progress} className="h-1" />
                </div>
              )}
            </CardContent>
            
            {/* Connector Line */}
            {index < stages.length - 1 && (
              <div className="absolute -bottom-4 left-12 w-0.5 h-8 bg-border z-10" />
            )}
          </Card>
        ))}
      </div>

      {/* Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Content Pipeline Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{workflowStats.angles}</div>
              <div className="text-sm text-muted-foreground">Trend Angles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{workflowStats.content}</div>
              <div className="text-sm text-muted-foreground">Content Pieces</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{workflowStats.videos}</div>
              <div className="text-sm text-muted-foreground">Videos Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{workflowStats.thumbnails}</div>
              <div className="text-sm text-muted-foreground">Thumbnails Created</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};