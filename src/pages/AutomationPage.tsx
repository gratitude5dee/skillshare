import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Play, Pause, Square, Settings, BarChart3, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AutomationInterface } from '@/components/automation/AutomationInterface';
import { ActionList } from '@/components/automation/ActionList';
import { ExecutionViewer } from '@/components/automation/ExecutionViewer';
import { MetricsOverview } from '@/components/automation/MetricsOverview';
import { RecordingInterface } from '@/components/automation/RecordingInterface';
import { UserQuotaCard } from '@/components/dashboard/UserQuotaCard';
import { UsageStatsCard } from '@/components/dashboard/UsageStatsCard';
import { useAutomation } from '@/hooks/useAutomation';
import { useAuth } from '@/hooks/useAuth';

export function AutomationPage() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('record');
  const { 
    isExecuting, 
    currentAction, 
    progress,
    availableActions,
    startExecution,
    pauseExecution,
    stopExecution
  } = useAutomation();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* User Quota Section */}
      <div className="border-b border-border bg-card p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-5xl mx-auto">
          <UserQuotaCard
            quotaRemaining={profile.api_quota_remaining}
            quotaLimit={profile.api_quota_limit}
            subscriptionTier={profile.subscription_tier}
            quotaResetAt={profile.quota_reset_at}
          />
          <UsageStatsCard />
        </div>
      </div>
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
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="record">Record</TabsTrigger>
              <TabsTrigger value="execute">Execute</TabsTrigger>
              <TabsTrigger value="monitor">Monitor</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="record" className="h-full m-0">
              <RecordingInterface />
            </TabsContent>

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