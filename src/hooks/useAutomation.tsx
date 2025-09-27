import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkflowAction {
  id: string;
  name: string;
  description: string;
  action_type: string;
  instructions: string;
  confidence_score: number;
  estimated_time_seconds: number;
  checkpoint_config: any;
  action_data?: any;
  understanding?: any;
}

export function useAutomation() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentAction, setCurrentAction] = useState<WorkflowAction | null>(null);
  const [progress, setProgress] = useState(0);
  const [availableActions, setAvailableActions] = useState<WorkflowAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAvailableActions();
  }, []);

  const loadAvailableActions = async () => {
    try {
      setIsLoading(true);
      
      const { data: actions, error } = await supabase
        .from('workflow_actions')
        .select(`
          *,
          understanding:workflow_understandings!inner(
            recording:screen_recordings!inner(
              user_id,
              status
            )
          )
        `)
        .eq('understanding.recording.status', 'completed')
        .order('order_index');

      if (error) {
        console.error('Error loading actions:', error);
        toast({
          title: "Error loading workflows",
          description: "Could not load available workflow actions.",
          variant: "destructive",
        });
        return;
      }

      setAvailableActions(actions || []);
    } catch (error) {
      console.error('Error loading actions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startExecution = async (action?: WorkflowAction) => {
    if (!action && availableActions.length === 0) {
      toast({
        title: "No actions available",
        description: "Please upload and process a screen recording first.",
        variant: "destructive",
      });
      return;
    }

    const actionToExecute = action || availableActions[0];
    setCurrentAction(actionToExecute);
    setIsExecuting(true);
    setProgress(0);

    toast({
      title: "Starting automation",
      description: `Executing: ${actionToExecute.name}`,
    });

    try {
      // Call the execute-automation edge function
      const { data, error } = await supabase.functions.invoke('execute-automation', {
        body: {
          actionId: actionToExecute.id,
          executionData: {
            started_at: new Date().toISOString(),
            user_initiated: true
          }
        }
      });

      if (error) {
        throw error;
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            completeExecution(true);
            return 100;
          }
          return prev + 10;
        });
      }, 500);

    } catch (error) {
      console.error('Execution error:', error);
      toast({
        title: "Execution failed",
        description: error.message || "An error occurred during automation execution.",
        variant: "destructive",
      });
      completeExecution(false);
    }
  };

  const pauseExecution = () => {
    setIsExecuting(false);
    toast({
      title: "Execution paused",
      description: "Automation has been paused. Click Start to resume.",
    });
  };

  const stopExecution = () => {
    setIsExecuting(false);
    setCurrentAction(null);
    setProgress(0);
    toast({
      title: "Execution stopped",
      description: "Automation has been cancelled.",
    });
  };

  const completeExecution = (success: boolean) => {
    setIsExecuting(false);
    setProgress(100);
    
    if (success) {
      toast({
        title: "Execution completed",
        description: `Successfully executed: ${currentAction?.name}`,
      });
    }

    // Reset after a short delay
    setTimeout(() => {
      setCurrentAction(null);
      setProgress(0);
    }, 2000);
  };

  return {
    isExecuting,
    currentAction,
    progress,
    availableActions,
    isLoading,
    startExecution,
    pauseExecution,
    stopExecution,
    loadAvailableActions
  };
}