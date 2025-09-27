import React from 'react';
import { ManusTask } from '@/services/ManusAPIService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Settings, 
  Calendar 
} from 'lucide-react';

interface TaskDetailsModalProps {
  task: ManusTask | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ 
  task, 
  isOpen, 
  onClose 
}) => {
  if (!task) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'running':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Running</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon(task.status || 'pending')}
            Task Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this AI task execution
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status and Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Task Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                {getStatusBadge(task.status || 'pending')}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Mode:</span>
                <Badge variant="outline">{task.mode}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Task ID:</span>
                <code className="text-sm bg-muted px-2 py-1 rounded">{task.id}</code>
              </div>
            </CardContent>
          </Card>

          {/* Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Task Prompt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm leading-relaxed">{task.prompt}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Created:</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(task.created_at || '')}
                </span>
              </div>
              {task.completed_at && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Completed:</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(task.completed_at)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Connectors */}
          {task.connectors && task.connectors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Connectors Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {task.connectors.map((connector, index) => (
                    <Badge key={index} variant="secondary">
                      {connector}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Result */}
          {task.result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Result</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-3 rounded-md max-h-60 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap">
                    {typeof task.result === 'string' 
                      ? task.result 
                      : JSON.stringify(task.result, null, 2)
                    }
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Hidden in task list:</span>
                <Badge variant={task.hide_in_task_list ? "secondary" : "outline"}>
                  {task.hide_in_task_list ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Shareable link:</span>
                <Badge variant={task.create_shareable_link ? "secondary" : "outline"}>
                  {task.create_shareable_link ? 'Yes' : 'No'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};