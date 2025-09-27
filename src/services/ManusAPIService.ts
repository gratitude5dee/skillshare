import { supabase } from '@/integrations/supabase/client';

export interface ManusTask {
  id: string;
  prompt: string;
  mode: string;
  status?: string;
  connectors: string[];
  hide_in_task_list: boolean;
  create_shareable_link: boolean;
  attachments: any[];
  created_at?: string;
  completed_at?: string;
  result?: any;
}

export interface ManusTaskOptions {
  mode?: 'fast' | 'speed';
  connectors?: string[];
  hide_in_task_list?: boolean;
  create_shareable_link?: boolean;
  attachments?: any[];
}

class ManusAPIServiceClass {
  private apiUrl = 'https://api.manus.ai/v1/tasks';
  private apiKey: string | null = null;

  private async getApiKey(): Promise<string> {
    if (this.apiKey) {
      return this.apiKey;
    }

    // In a real implementation, you'd fetch this from your edge function
    // For now, we'll simulate the API call
    const { data, error } = await supabase.functions.invoke('manus-proxy', {
      body: { action: 'get-api-key' }
    });

    if (error) {
      throw new Error('Failed to get Manus API key');
    }

    this.apiKey = data.apiKey;
    return this.apiKey;
  }

  async createTask(prompt: string, options: ManusTaskOptions = {}): Promise<ManusTask> {
    const defaultOptions: Required<ManusTaskOptions> = {
      mode: 'fast',
      connectors: [],
      hide_in_task_list: false,
      create_shareable_link: false,
      attachments: []
    };

    const taskOptions = { ...defaultOptions, ...options };

    try {
      // Use Supabase edge function as proxy to avoid CORS issues
      const { data, error } = await supabase.functions.invoke('manus-proxy', {
        body: {
          action: 'create-task',
          prompt,
          ...taskOptions
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to create Manus task');
      }

      return data;
    } catch (error) {
      console.error('Error creating Manus task:', error);
      throw error;
    }
  }

  async getTask(taskId: string): Promise<ManusTask> {
    try {
      const { data, error } = await supabase.functions.invoke('manus-proxy', {
        body: {
          action: 'get-task',
          taskId
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to get Manus task');
      }

      return data;
    } catch (error) {
      console.error('Error getting Manus task:', error);
      throw error;
    }
  }

  async listTasks(limit = 10): Promise<ManusTask[]> {
    try {
      const { data, error } = await supabase.functions.invoke('manus-proxy', {
        body: {
          action: 'list-tasks',
          limit
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to list Manus tasks');
      }

      return data.tasks || [];
    } catch (error) {
      console.error('Error listing Manus tasks:', error);
      throw error;
    }
  }
}

export const ManusAPIService = new ManusAPIServiceClass();