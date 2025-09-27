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
  mode?: 'speed' | 'quality' | 'fast';
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
      mode: 'speed',
      connectors: [],
      hide_in_task_list: false,
      create_shareable_link: false,
      attachments: []
    };

    const taskOptions = { ...defaultOptions, ...options };

    try {
      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      // Use Supabase edge function as proxy to avoid CORS issues
      const { data, error } = await supabase.functions.invoke('manus-proxy', {
        headers: {
          authorization: `Bearer ${session?.access_token}`
        },
        body: {
          action: 'create-task',
          prompt,
          ...taskOptions
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to create Manus task');
      }

      // Check if the response contains an error from the edge function
      if (data && data.error) {
        console.error('Manus API error from edge function:', data);
        throw new Error(`Manus API Error: ${data.error}${data.details ? ` - ${data.details}` : ''}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating Manus task:', error);
      throw error;
    }
  }

  async getTask(taskId: string): Promise<ManusTask> {
    try {
      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('manus-proxy', {
        headers: {
          authorization: `Bearer ${session?.access_token}`
        },
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
      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('manus-proxy', {
        headers: {
          authorization: `Bearer ${session?.access_token}`
        },
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