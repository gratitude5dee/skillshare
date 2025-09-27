import React from 'react';
import { Play, Clock, Target, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Recording {
  id: string;
  title: string;
  description: string;
  status: string;
  duration_seconds?: number;
  created_at: string;
}

interface WorkflowCardProps {
  recording: Recording;
}

export function WorkflowCard({ recording }: WorkflowCardProps) {
  // Mock workflow data based on recording
  const workflowStats = {
    actionsCount: Math.floor(Math.random() * 8) + 3,
    avgExecutionTime: Math.floor(Math.random() * 180) + 30,
    confidenceScore: 0.7 + Math.random() * 0.25,
    lastRun: new Date(Date.now() - Math.random() * 86400000 * 7)
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          color: 'bg-green-500',
          text: 'Ready to Execute',
          canExecute: true
        };
      case 'processing':
        return {
          color: 'bg-blue-500',
          text: 'AI Analyzing...',
          canExecute: false
        };
      case 'error':
        return {
          color: 'bg-red-500',
          text: 'Analysis Failed',
          canExecute: false
        };
      default:
        return {
          color: 'bg-gray-500',
          text: 'Pending',
          canExecute: false
        };
    }
  };

  const statusInfo = getStatusInfo(recording.status);

  if (recording.status === 'processing') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusInfo.color} animate-pulse`} />
          <span className="text-sm text-muted-foreground">{statusInfo.text}</span>
        </div>
        <Progress value={45} className="w-full" />
        <p className="text-xs text-muted-foreground">
          Analyzing workflow steps and generating automation actions...
        </p>
      </div>
    );
  }

  if (recording.status === 'error') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
          <span className="text-sm text-destructive">{statusInfo.text}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Unable to analyze this recording. Please try uploading again.
        </p>
        <Button size="sm" variant="outline" className="w-full">
          Retry Analysis
        </Button>
      </div>
    );
  }

  if (recording.status === 'completed') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
          <span className="text-sm text-green-600 font-medium">{statusInfo.text}</span>
        </div>

        {/* Workflow Stats */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-1">
            <Layers className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">{workflowStats.actionsCount} actions</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">{workflowStats.avgExecutionTime}s</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">
              {Math.round(workflowStats.confidenceScore * 100)}% confidence
            </span>
          </div>
          
          <div className="text-muted-foreground">
            Last run: {workflowStats.lastRun.toLocaleDateString()}
          </div>
        </div>

        {/* Action Badges */}
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">Data Entry</Badge>
          <Badge variant="secondary" className="text-xs">Navigation</Badge>
          <Badge variant="secondary" className="text-xs">Form Fill</Badge>
        </div>

        {/* Execute Button */}
        <Button size="sm" className="w-full gap-2">
          <Play className="h-3 w-3" />
          Execute Workflow
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
        <span className="text-sm text-muted-foreground">{statusInfo.text}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Waiting for analysis to begin...
      </p>
    </div>
  );
}