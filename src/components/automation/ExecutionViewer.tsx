import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Play } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

const mockExecutions = [
  {
    id: '1',
    actionName: 'Fill Login Form',
    status: 'completed',
    startTime: new Date(Date.now() - 300000),
    endTime: new Date(Date.now() - 240000),
    duration: 60,
    progress: 100
  },
  {
    id: '2',
    actionName: 'Navigate to Dashboard',
    status: 'running',
    startTime: new Date(Date.now() - 120000),
    endTime: null,
    duration: null,
    progress: 75
  },
  {
    id: '3',
    actionName: 'Extract Data Table',
    status: 'pending',
    startTime: null,
    endTime: null,
    duration: null,
    progress: 0
  }
];

export function ExecutionViewer() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'running': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Execution Monitor</h2>
        <p className="text-sm text-muted-foreground">
          Real-time view of automation execution progress
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Execution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Execution</CardTitle>
            <CardDescription>
              Live progress of active automation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockExecutions.filter(e => e.status === 'running').map(execution => (
                <div key={execution.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{execution.actionName}</h4>
                    <Badge variant={getStatusColor(execution.status)}>
                      {execution.status}
                    </Badge>
                  </div>
                  
                  <Progress value={execution.progress} className="w-full" />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Started:</span>
                      <div className="font-medium">
                        {execution.startTime?.toLocaleTimeString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Progress:</span>
                      <div className="font-medium">{execution.progress}%</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {mockExecutions.filter(e => e.status === 'running').length === 0 && (
                <div className="text-center py-8">
                  <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No active executions
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Execution Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Execution Queue</CardTitle>
            <CardDescription>
              Upcoming and completed actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {mockExecutions.map((execution) => (
                  <div key={execution.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    {getStatusIcon(execution.status)}
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {execution.actionName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {execution.startTime && (
                          <span>{execution.startTime.toLocaleTimeString()}</span>
                        )}
                        {execution.duration && (
                          <span>• {execution.duration}s</span>
                        )}
                      </div>
                    </div>
                    
                    <Badge variant={getStatusColor(execution.status)} className="text-xs">
                      {execution.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Execution Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Execution Logs</CardTitle>
          <CardDescription>
            Detailed execution history and system messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2 font-mono text-xs">
              <div className="text-muted-foreground">[12:34:56] Starting workflow execution...</div>
              <div className="text-green-600">[12:35:01] ✓ Action "Fill Login Form" completed successfully</div>
              <div className="text-blue-600">[12:35:02] ➤ Starting action "Navigate to Dashboard"</div>
              <div className="text-muted-foreground">[12:35:05] Checkpoint triggered for high-importance action</div>
              <div className="text-muted-foreground">[12:35:07] User confirmed, proceeding with execution</div>
              <div className="text-amber-600">[12:35:10] ⚠ Retrying element selection (attempt 1/3)</div>
              <div className="text-green-600">[12:35:12] ✓ Element found, continuing execution</div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}