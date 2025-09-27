import React from 'react';
import { Play, Pause, Square, Clock, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DigitalAssistant } from './DigitalAssistant';
import { CheckpointDialog } from './CheckpointDialog';

interface AutomationInterfaceProps {
  isExecuting: boolean;
  currentAction?: any;
  progress: number;
}

export function AutomationInterface({ isExecuting, currentAction, progress }: AutomationInterfaceProps) {
  const [showCheckpoint, setShowCheckpoint] = React.useState(false);

  return (
    <div className="space-y-6">
      {/* Execution Status Card */}
      <Card className={isExecuting ? 'border-primary' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isExecuting ? (
                  <>
                    <div className="h-3 w-3 bg-primary rounded-full animate-pulse" />
                    Automation Running
                  </>
                ) : (
                  <>
                    <div className="h-3 w-3 bg-muted-foreground rounded-full" />
                    Ready to Execute
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {isExecuting 
                  ? `Executing: ${currentAction?.name || 'Unknown action'}`
                  : 'Select an action from the sidebar to begin automation'
                }
              </CardDescription>
            </div>
            
            <Badge variant={isExecuting ? "default" : "secondary"}>
              {Math.round(progress)}% Complete
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            
            {currentAction && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{currentAction.action_type}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Est. Time:</span>
                  <span className="font-medium">{currentAction.estimated_time_seconds}s</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Confidence:</span>
                  <span className="font-medium">
                    {Math.round((currentAction.confidence_score || 0) * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Digital Assistant */}
      <Card>
        <CardHeader>
          <CardTitle>AI Assistant</CardTitle>
          <CardDescription>
            Get help and guidance during automation execution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DigitalAssistant 
            currentAction={currentAction}
            isExecuting={isExecuting}
          />
        </CardContent>
      </Card>

      {/* Screenshot/Preview Area */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Preview</CardTitle>
          <CardDescription>
            Live view of automation progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
            {isExecuting ? (
              <div className="text-center">
                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Play className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Automation in progress...
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="h-12 w-12 bg-muted-foreground/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Square className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No active automation
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Checkpoint Dialog */}
      {showCheckpoint && currentAction && (
        <CheckpointDialog 
          action={currentAction}
          onProceed={() => setShowCheckpoint(false)}
          onModify={() => setShowCheckpoint(false)}
          onCancel={() => setShowCheckpoint(false)}
        />
      )}
    </div>
  );
}