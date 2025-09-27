import React from 'react';
import { Clock, TrendingUp, Target, Zap, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export function MetricsOverview() {
  const metrics = {
    timeSaved: { value: 847, unit: 'minutes', change: '+23%', trend: 'up' },
    executionRate: { value: 94, unit: '%', change: '+5%', trend: 'up' },
    avgExecutionTime: { value: 2.3, unit: 'minutes', change: '-12%', trend: 'down' },
    workflowsRun: { value: 156, unit: 'total', change: '+31%', trend: 'up' }
  };

  const recentWorkflows = [
    { name: 'Data Entry Automation', runs: 23, successRate: 98, timeSaved: 145 },
    { name: 'Report Generation', runs: 18, successRate: 94, timeSaved: 89 },
    { name: 'Email Processing', runs: 31, successRate: 96, timeSaved: 67 },
    { name: 'File Organization', runs: 12, successRate: 100, timeSaved: 34 }
  ];

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Analytics Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Track automation performance and efficiency gains
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.timeSaved.value}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {metrics.timeSaved.unit}
              </span>
            </div>
            <div className={`flex items-center text-xs ${getTrendColor(metrics.timeSaved.trend)}`}>
              {getTrendIcon(metrics.timeSaved.trend)}
              <span className="ml-1">{metrics.timeSaved.change} from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.executionRate.value}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {metrics.executionRate.unit}
              </span>
            </div>
            <div className={`flex items-center text-xs ${getTrendColor(metrics.executionRate.trend)}`}>
              {getTrendIcon(metrics.executionRate.trend)}
              <span className="ml-1">{metrics.executionRate.change} from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Execution</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.avgExecutionTime.value}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {metrics.avgExecutionTime.unit}
              </span>
            </div>
            <div className={`flex items-center text-xs ${getTrendColor(metrics.avgExecutionTime.trend)}`}>
              {getTrendIcon(metrics.avgExecutionTime.trend)}
              <span className="ml-1">{metrics.avgExecutionTime.change} from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workflows Run</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.workflowsRun.value}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {metrics.workflowsRun.unit}
              </span>
            </div>
            <div className={`flex items-center text-xs ${getTrendColor(metrics.workflowsRun.trend)}`}>
              {getTrendIcon(metrics.workflowsRun.trend)}
              <span className="ml-1">{metrics.workflowsRun.change} from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Performing Workflows</CardTitle>
            <CardDescription>
              Most efficient and frequently used automations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentWorkflows.map((workflow, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{workflow.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {workflow.runs} runs
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div>Success Rate: {workflow.successRate}%</div>
                    <div>Time Saved: {workflow.timeSaved}m</div>
                  </div>
                  
                  <Progress value={workflow.successRate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Efficiency Trends</CardTitle>
            <CardDescription>
              Weekly performance analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2 text-xs">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <div key={day} className="text-center">
                    <div className="text-muted-foreground mb-2">{day}</div>
                    <div 
                      className="bg-primary rounded-sm h-12 opacity-80"
                      style={{ 
                        height: `${20 + Math.random() * 30}px`,
                        opacity: 0.3 + (Math.random() * 0.5)
                      }}
                    />
                    <div className="mt-2 text-muted-foreground">
                      {Math.floor(Math.random() * 50) + 10}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Peak Day:</span>
                    <div className="font-medium">Wednesday</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg. Daily Runs:</span>
                    <div className="font-medium">23</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Return on Investment</CardTitle>
          <CardDescription>
            Calculate the value of your automation efforts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Time Saved (Hours)</div>
              <div className="text-2xl font-bold text-green-600">14.1</div>
              <div className="text-xs text-muted-foreground">This month</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Cost Savings ($)</div>
              <div className="text-2xl font-bold text-green-600">$1,410</div>
              <div className="text-xs text-muted-foreground">At $100/hour rate</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">ROI</div>
              <div className="text-2xl font-bold text-green-600">285%</div>
              <div className="text-xs text-muted-foreground">Based on setup time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}