import React, { useState, useEffect } from 'react';
import { ManusAPIService, ManusTask } from '@/services/ManusAPIService';
import { TaskTable } from '@/components/tasks/TaskTable';
import { TaskStats } from '@/components/tasks/TaskStats';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface TaskFilter {
  status: string;
  dateRange: string;
  search: string;
}

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<ManusTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<TaskFilter>({
    status: 'all',
    dateRange: 'all',
    search: ''
  });
  const { toast } = useToast();

  const fetchTasks = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      const tasksData = await ManusAPIService.listTasks(50);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tasks. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchTasks();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchTasks(true);
  };

  const filteredTasks = tasks.filter(task => {
    // Status filter
    if (filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }

    // Search filter
    if (filters.search && !task.prompt.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Date range filter (simplified for now)
    if (filters.dateRange !== 'all') {
      const taskDate = new Date(task.created_at || '');
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (filters.dateRange) {
        case 'today':
          if (daysDiff > 0) return false;
          break;
        case 'week':
          if (daysDiff > 7) return false;
          break;
        case 'month':
          if (daysDiff > 30) return false;
          break;
      }
    }

    return true;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading tasks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Monitor</h1>
          <p className="text-muted-foreground">
            Track and manage your AI task executions in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <TaskStats tasks={tasks} />

      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>
            View and filter all your AI task executions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TaskFilters filters={filters} onFiltersChange={setFilters} />
          <TaskTable tasks={filteredTasks} onRefresh={handleRefresh} />
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksPage;