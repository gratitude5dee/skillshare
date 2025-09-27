import React from 'react';
import { Play, Clock, Target, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Action {
  id: string;
  name: string;
  description: string;
  action_type: string;
  estimated_time_seconds: number;
  confidence_score: number;
  checkpoint_config: {
    importance: number;
  };
}

interface ActionListProps {
  actions: Action[];
  onActionSelect: (action: Action) => void;
  isExecuting: boolean;
}

export function ActionList({ actions, onActionSelect, isExecuting }: ActionListProps) {
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'click': return '🖱️';
      case 'form_fill': return '📝';
      case 'navigation': return '🧭';
      case 'data_entry': return '⌨️';
      case 'wait': return '⏱️';
      case 'screenshot': return '📸';
      default: return '⚡';
    }
  };

  const getImportanceColor = (importance: number) => {
    if (importance >= 8) return 'destructive';
    if (importance >= 6) return 'secondary';
    return 'outline';
  };

  if (actions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
          <Target className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          No workflow actions available
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Upload a screen recording to get started
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-3">
        {actions.map((action, index) => (
          <Card key={action.id} className="transition-all hover:shadow-md">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="text-lg mt-0.5">
                      {getActionIcon(action.action_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {action.name}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="text-xs ml-2">
                    #{index + 1}
                  </Badge>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {action.estimated_time_seconds}s
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {Math.round((action.confidence_score || 0) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {action.action_type}
                  </Badge>
                  
                  <Badge 
                    variant={getImportanceColor(action.checkpoint_config?.importance || 5)}
                    className="text-xs flex items-center gap-1"
                  >
                    <Star className="h-3 w-3" />
                    {action.checkpoint_config?.importance || 5}
                  </Badge>
                </div>

                <Separator />

                {/* Action Button */}
                <Button
                  onClick={() => onActionSelect(action)}
                  disabled={isExecuting}
                  size="sm"
                  className="w-full gap-2"
                >
                  <Play className="h-3 w-3" />
                  Execute Action
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}