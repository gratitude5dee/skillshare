import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (!user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const { actionId, executionData } = await req.json();
    
    console.log('Executing automation action:', actionId);

    // Get the workflow action
    const { data: action, error: actionError } = await supabaseClient
      .from('workflow_actions')
      .select(`
        *,
        understanding:workflow_understandings!inner(
          recording:screen_recordings!inner(
            user_id
          )
        )
      `)
      .eq('id', actionId)
      .single();

    if (actionError || !action) {
      throw new Error('Action not found');
    }

    // Verify user owns this action
    if (action.understanding.recording.user_id !== user.id) {
      throw new Error('Unauthorized access to action');
    }

    // Create execution log
    const { data: executionLog, error: logError } = await supabaseClient
      .from('execution_logs')
      .insert({
        action_id: actionId,
        user_id: user.id,
        status: 'started',
        execution_data: executionData || {}
      })
      .select()
      .single();

    if (logError) {
      throw new Error('Failed to create execution log');
    }

    // Get user preferences for checkpoint handling
    const { data: preferences } = await supabaseClient
      .from('user_automation_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const checkpointThreshold = preferences?.importance_threshold || 5;
    const shouldShowCheckpoint = action.checkpoint_config?.enabled && 
                                (action.checkpoint_config?.importance || 5) >= checkpointThreshold;

    // Update execution status to running
    await supabaseClient
      .from('execution_logs')
      .update({ 
        status: 'running',
        checkpoints_shown: shouldShowCheckpoint ? 1 : 0
      })
      .eq('id', executionLog.id);

    // Simulate automation execution
    const startTime = Date.now();
    
    try {
      // Here we would integrate with actual computer control APIs
      // For now, we'll simulate the execution
      
      console.log(`Executing ${action.action_type}: ${action.name}`);
      console.log('Instructions:', action.instructions);
      console.log('Action data:', action.action_data);

      // Use Manus API for complex automation if needed
      if (action.action_type === 'complex' || action.confidence_score < 0.6) {
        const manusApiKey = Deno.env.get('MANUS_API_KEY');
        
        if (manusApiKey) {
          const manusPrompt = `
            Execute this automation step:
            
            Action: ${action.name}
            Type: ${action.action_type}
            Instructions: ${action.instructions}
            Data: ${JSON.stringify(action.action_data)}
            
            Please provide execution results and any issues encountered.
          `;

          const manusResponse = await fetch('https://api.manus.ai/v1/tasks', {
            method: 'POST',
            headers: {
              'API_KEY': manusApiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              prompt: manusPrompt,
              mode: 'fast',
              connectors: []
            })
          });

          const manusResult = await manusResponse.json();
          console.log('Manus execution result:', manusResult.id);
        }
      }

      // Simulate execution time
      const executionTimeMs = Math.random() * 3000 + 1000; // 1-4 seconds
      await new Promise(resolve => setTimeout(resolve, executionTimeMs));

      const endTime = Date.now();
      const durationSeconds = (endTime - startTime) / 1000;

      // Update execution log with success
      await supabaseClient
        .from('execution_logs')
        .update({
          status: 'completed',
          end_time: new Date().toISOString(),
          duration_seconds: durationSeconds,
          execution_data: {
            ...executionData,
            completed_at: new Date().toISOString(),
            execution_time_ms: executionTimeMs
          }
        })
        .eq('id', executionLog.id);

      // Record analytics
      await supabaseClient
        .from('automation_analytics')
        .insert([
          {
            user_id: user.id,
            action_id: actionId,
            execution_log_id: executionLog.id,
            metric_type: 'execution_time',
            metric_value: durationSeconds,
            context: { action_type: action.action_type }
          },
          {
            user_id: user.id,
            action_id: actionId,
            execution_log_id: executionLog.id,
            metric_type: 'time_saved',
            metric_value: Math.max(0, (action.estimated_time_seconds || 60) - durationSeconds),
            context: { estimated_vs_actual: true }
          }
        ]);

      return new Response(
        JSON.stringify({ 
          success: true, 
          execution_log_id: executionLog.id,
          duration_seconds: durationSeconds,
          checkpoint_shown: shouldShowCheckpoint
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );

    } catch (executionError) {
      console.error('Execution failed:', executionError);
      
      const errorMessage = executionError instanceof Error ? executionError.message : String(executionError);
      
      // Update execution log with failure
      await supabaseClient
        .from('execution_logs')
        .update({
          status: 'failed',
          end_time: new Date().toISOString(),
          error_message: errorMessage
        })
        .eq('id', executionLog.id);

      throw executionError;
    }

  } catch (error) {
    console.error('Error executing automation:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});