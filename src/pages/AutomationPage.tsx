import React, { useState } from 'react';
import { Plus, Play, Pause, Square, Settings, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AutomationInterface } from '@/components/automation/AutomationInterface';
import { ActionList } from '@/components/automation/ActionList';
import { ExecutionViewer } from '@/components/automation/ExecutionViewer';
import { MetricsOverview } from '@/components/automation/MetricsOverview';
import { useAutomation } from '@/hooks/useAutomation';

export function AutomationPage() {
  const [activeTab, setActiveTab] = useState('execute');
  const { 
    isExecuting, 
    currentAction, 
    progress,
    availableActions,
    startExecution,
    pauseExecution,
    stopExecution
  } = useAutomation();

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Automation Hub</h1>
            <p className="text-sm text-muted-foreground">
              Execute workflows and monitor automation performance
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant={isExecuting ? "default" : "secondary"}>
              {isExecuting ? 'Running' : 'Ready'}
            </Badge>
            
            <div className="flex items-center gap-2">
              {!isExecuting ? (
                <Button onClick={() => startExecution()} className="gap-2">
                  <Play className="h-4 w-4" />
                  Start
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={pauseExecution} className="gap-2">
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                  <Button variant="destructive" onClick={stopExecution} className="gap-2">
                    <Square className="h-4 w-4" />
                    Stop
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="border-b border-border px-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="execute">Execute</TabsTrigger>
              <TabsTrigger value="monitor">Monitor</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="execute" className="h-full m-0">
              <div className="grid grid-cols-12 gap-6 h-full p-6">
                {/* Actions Sidebar */}
                <div className="col-span-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Available Actions</CardTitle>
                      <CardDescription>
                        Select workflow actions to execute
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ActionList 
                        actions={availableActions}
                        onActionSelect={startExecution}
                        isExecuting={isExecuting}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Main Execution Area */}
                <div className="col-span-8">
                  <AutomationInterface 
                    isExecuting={isExecuting}
                    currentAction={currentAction}
                    progress={progress}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="monitor" className="h-full m-0">
              <div className="p-6 h-full">
                <ExecutionViewer />
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="h-full m-0">
              <div className="p-6 h-full">
                <MetricsOverview />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}