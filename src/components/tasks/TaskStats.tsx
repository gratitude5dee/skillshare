import React from 'react';
import { ManusTask } from '@/services/ManusAPIService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ListChecks, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface TaskStatsProps {
  tasks: ManusTask[];
}

export const TaskStats: React.FC<TaskStatsProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const runningTasks = tasks.filter(task => task.status === 'running').length;
  const failedTasks = tasks.filter(task => task.status === 'failed').length;
  
  // Tasks completed today
  const today = new Date().toDateString();
  const tasksCompletedToday = tasks.filter(task => {
    if (!task.completed_at) return false;
    return new Date(task.completed_at).toDateString() === today;
  }).length;

  // Success rate
  const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: ListChecks,
      description: 'All time'
    },
    {
      title: 'In Progress',
      value: runningTasks,
      icon: Clock,
      description: 'Currently running',
      badge: runningTasks > 0 ? 'active' : undefined
    },
    {
      title: 'Completed Today',
      value: tasksCompletedToday,
      icon: CheckCircle,
      description: 'Successfully finished'
    },
    {
      title: 'Success Rate',
      value: `${successRate}%`,
      icon: TrendingUp,
      description: 'Overall completion rate'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {stat.value}
              {stat.badge && (
                <Badge variant="secondary" className="text-xs">
                  {stat.badge}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};