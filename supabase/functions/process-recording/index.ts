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

    const { recordingId } = await req.json();
    
    console.log('Processing recording:', recordingId);

    // Get the recording
    const { data: recording, error: recordingError } = await supabaseClient
      .from('screen_recordings')
      .select('*')
      .eq('id', recordingId)
      .eq('user_id', user.id)
      .single();

    if (recordingError || !recording) {
      throw new Error('Recording not found');
    }

    // Update recording status to processing
    await supabaseClient
      .from('screen_recordings')
      .update({ status: 'processing' })
      .eq('id', recordingId);

    // Create workflow understanding record
    const { data: understanding, error: understandingError } = await supabaseClient
      .from('workflow_understandings')
      .insert({
        recording_id: recordingId,
        status: 'processing'
      })
      .select()
      .single();

    if (understandingError) {
      throw new Error('Failed to create understanding record');
    }

    // Use Manus API to analyze the recording
    const manusApiKey = Deno.env.get('MANUS_API_KEY');
    if (!manusApiKey) {
      throw new Error('Manus API key not configured');
    }

    const analysisPrompt = `
      Analyze this screen recording and extract actionable workflow steps.
      
      Recording data: ${JSON.stringify(recording.raw_data)}
      
      Please identify:
      1. Individual actions (clicks, form fills, navigation, data entry)
      2. For each action, provide:
         - Action type (click, form_fill, navigation, data_entry, wait, screenshot)
         - Name and description
         - Natural language instructions
         - Confidence score (0-1)
         - Estimated time in seconds
         - Importance level (1-10) for checkpoint system
         - Required data or parameters
      
      Format the response as a JSON object with an "actions" array.
    `;

    const manusResponse = await fetch('https://api.manus.ai/v1/tasks', {
      method: 'POST',
      headers: {
        'API_KEY': manusApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: analysisPrompt,
        mode: 'fast',
        connectors: []
      })
    });

    const manusData = await manusResponse.json();
    console.log('Manus analysis complete:', manusData.id);

    // Process the analysis results
    let processedActions = [];
    let actionsIdentified = 0;
    
    try {
      if (manusData.result && manusData.result.actions) {
        processedActions = manusData.result.actions;
        actionsIdentified = processedActions.length;
      }
    } catch (e) {
      console.error('Error parsing Manus response:', e);
    }

    // Update workflow understanding with results
    await supabaseClient
      .from('workflow_understandings')
      .update({
        processed_data: { actions: processedActions },
        manus_response: manusData,
        actions_identified: actionsIdentified,
        analysis_summary: `Identified ${actionsIdentified} workflow actions`,
        confidence_score: processedActions.length > 0 ? 0.8 : 0.3,
        status: 'completed'
      })
      .eq('id', understanding.id);

    // Create workflow actions
    for (let i = 0; i < processedActions.length; i++) {
      const action = processedActions[i];
      
      await supabaseClient
        .from('workflow_actions')
        .insert({
          understanding_id: understanding.id,
          action_type: action.action_type || 'click',
          name: action.name || `Action ${i + 1}`,
          description: action.description || '',
          instructions: action.instructions || '',
          action_data: action.data || {},
          confidence_score: action.confidence_score || 0.7,
          estimated_time_seconds: action.estimated_time_seconds || 60,
          checkpoint_config: {
            enabled: true,
            importance: action.importance || 5
          },
          order_index: i
        });
    }

    // Update recording status to completed
    await supabaseClient
      .from('screen_recordings')
      .update({ status: 'completed' })
      .eq('id', recordingId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        understanding_id: understanding.id,
        actions_identified: actionsIdentified
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error processing recording:', error);
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