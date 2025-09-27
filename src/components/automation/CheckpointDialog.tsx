import React from 'react';
import { AlertTriangle, Play, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface CheckpointDialogProps {
  action: {
    name: string;
    description: string;
    action_type: string;
    instructions: string;
    checkpoint_config: {
      importance: number;
    };
  };
  onProceed: () => void;
  onModify: () => void;
  onCancel: () => void;
}

export function CheckpointDialog({ action, onProceed, onModify, onCancel }: CheckpointDialogProps) {
  const getImportanceColor = (importance: number) => {
    if (importance >= 8) return 'destructive';
    if (importance >= 6) return 'secondary';
    return 'outline';
  };

  const getImportanceText = (importance: number) => {
    if (importance >= 8) return 'Critical';
    if (importance >= 6) return 'Important';
    return 'Standard';
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <DialogTitle>Checkpoint Confirmation</DialogTitle>
          </div>
          <DialogDescription>
            Review this action before proceeding with automation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{action.name}</h4>
                  <Badge variant={getImportanceColor(action.checkpoint_config.importance)}>
                    {getImportanceText(action.checkpoint_config.importance)}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
                
                <div className="bg-muted rounded-md p-3">
                  <p className="text-xs font-medium mb-1">Instructions:</p>
                  <p className="text-xs text-muted-foreground">
                    {action.instructions}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {action.action_type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Priority: {action.checkpoint_config.importance}/10
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} className="gap-2">
            <X className="h-4 w-4" />
            Cancel
          </Button>
          
          <Button variant="secondary" onClick={onModify} className="gap-2">
            <Settings className="h-4 w-4" />
            Modify
          </Button>
          
          <Button onClick={onProceed} className="gap-2">
            <Play className="h-4 w-4" />
            Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}