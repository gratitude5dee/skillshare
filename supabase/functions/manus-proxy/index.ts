import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...body } = await req.json();
    const manusApiKey = Deno.env.get('MANUS_API_KEY');
    
    if (!manusApiKey) {
      throw new Error('MANUS_API_KEY not configured');
    }

    // Get user ID from authorization header
    const authHeader = req.headers.get('authorization');
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      try {
        // Use getSession instead of getUser for better token handling
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          // Fallback to getUser with token
          const { data: { user }, error: userError } = await supabase.auth.getUser(token);
          if (userError) {
            console.error('Error getting user from token:', userError);
          } else {
            userId = user?.id;
            console.log('Authenticated user ID from fallback:', userId);
          }
        } else if (session?.user) {
          userId = session.user.id;
          console.log('Authenticated user ID from session:', userId);
        }
      } catch (error) {
        console.error('Exception getting user from token:', error);
      }
    } else {
      console.log('No authorization header provided');
    }

    const manusApiUrl = 'https://api.manus.ai/v1/tasks';

    switch (action) {
      case 'create-task': {
        const { prompt, mode, connectors, hide_in_task_list, create_shareable_link, attachments } = body;
        
        // Enhanced logging
        console.log('Received create-task request body:', JSON.stringify(body, null, 2));
        console.log('Creating Manus task with prompt:', prompt);
        console.log('API Key available:', !!manusApiKey);
        
        // Construct the request payload for Manus API
        const requestPayload = {
          prompt,
          mode: mode || 'fast',  // Changed from 'speed' to 'fast' based on Manus docs
          connectors: connectors || [],
          hide_in_task_list: hide_in_task_list || false,
          create_shareable_link: create_shareable_link || false,
          attachments: attachments || []
        };
        
        console.log('Sending to Manus API:', JSON.stringify(requestPayload, null, 2));
        
        const response = await fetch(manusApiUrl, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'API_KEY': manusApiKey
          },
          body: JSON.stringify(requestPayload)
        });

        console.log('Manus API response status:', response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Manus API error details:', {
            status: response.status,
            statusText: response.statusText,
            errorBody: errorText,
            requestPayload: requestPayload
          });
          
          // Return more specific error information
          return new Response(JSON.stringify({ 
            error: `Manus API error: ${response.status} ${response.statusText}`,
            details: errorText,
            debug: {
              payload: requestPayload,
              status: response.status
            }
          }), {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const data = await response.json();
        console.log('Manus API response:', data);

        // Store task in local database if user is authenticated
        if (userId && data.id) {
          const { error: dbError } = await supabase
            .from('manus_tasks')
            .insert({
              user_id: userId,
              manus_task_id: data.id,
              prompt: prompt,
              mode: mode || 'speed',
              status: 'pending',
              connectors: connectors || [],
              metadata: {
                hide_in_task_list: hide_in_task_list,
                create_shareable_link: create_shareable_link,
                attachments: attachments
              }
            });

          if (dbError) {
            console.error('Error storing task in database:', dbError);
          } else {
            console.log('Task stored in database successfully');
          }
        }
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'list-tasks': {
        if (!userId) {
          throw new Error('Authentication required');
        }

        const limit = body.limit || 50;
        const { data: tasks, error } = await supabase
          .from('manus_tasks')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        // Transform to match expected format
        const transformedTasks = tasks?.map(task => ({
          id: task.manus_task_id,
          prompt: task.prompt,
          mode: task.mode,
          status: task.status,
          connectors: task.connectors || [],
          hide_in_task_list: task.metadata?.hide_in_task_list || false,
          create_shareable_link: task.metadata?.create_shareable_link || false,
          attachments: task.metadata?.attachments || [],
          created_at: task.created_at,
          completed_at: task.completed_at,
          result: task.result
        })) || [];

        return new Response(JSON.stringify({ tasks: transformedTasks }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get-task': {
        if (!userId) {
          throw new Error('Authentication required');
        }

        const { taskId } = body;
        const { data: task, error } = await supabase
          .from('manus_tasks')
          .select('*')
          .eq('user_id', userId)
          .eq('manus_task_id', taskId)
          .single();

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        if (!task) {
          throw new Error('Task not found');
        }

        // Transform to match expected format
        const transformedTask = {
          id: task.manus_task_id,
          prompt: task.prompt,
          mode: task.mode,
          status: task.status,
          connectors: task.connectors || [],
          hide_in_task_list: task.metadata?.hide_in_task_list || false,
          create_shareable_link: task.metadata?.create_shareable_link || false,
          attachments: task.metadata?.attachments || [],
          created_at: task.created_at,
          completed_at: task.completed_at,
          result: task.result
        };

        return new Response(JSON.stringify(transformedTask), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in manus-proxy function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});