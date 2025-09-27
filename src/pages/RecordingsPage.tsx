import React, { useState } from 'react';
import { Upload, Play, Trash2, Eye, Settings, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RecordingUpload } from '@/components/recordings/RecordingUpload';
import { WorkflowCard } from '@/components/recordings/WorkflowCard';
import { AnalysisProgress } from '@/components/recordings/AnalysisProgress';
import { useRecordings } from '@/hooks/useRecordings';

export function RecordingsPage() {
  const [showUpload, setShowUpload] = useState(false);
  const { recordings, isLoading, uploadRecording, deleteRecording } = useRecordings();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Workflow Library</h1>
            <p className="text-sm text-muted-foreground">
              Manage your screen recordings and automated workflows
            </p>
          </div>
          
          <Button onClick={() => setShowUpload(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Recording
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Upload Modal */}
          {showUpload && (
            <RecordingUpload 
              onUpload={uploadRecording}
              onClose={() => setShowUpload(false)}
            />
          )}

          {/* Empty State */}
          {recordings.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No recordings yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                Upload your first screen recording to start creating automated workflows. 
                Our AI will analyze your actions and create reusable automation scripts.
              </p>
              <Button onClick={() => setShowUpload(true)} className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Your First Recording
              </Button>
            </div>
          )}

          {/* Recordings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recordings.map((recording) => (
              <Card key={recording.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{recording.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {recording.description || 'No description'}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(recording.status)} className="text-xs">
                        {recording.status}
                      </Badge>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Play className="h-4 w-4 mr-2" />
                            Execute Workflow
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteRecording(recording.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <WorkflowCard recording={recording} />
                  
                  {recording.status === 'processing' && (
                    <AnalysisProgress recordingId={recording.id} />
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                    <span>
                      {recording.duration_seconds ? 
                        `${Math.round(recording.duration_seconds)}s` : 
                        'Duration unknown'
                      }
                    </span>
                    <span>
                      {new Date(recording.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}