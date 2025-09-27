import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const manusApiUrl = 'https://api.manus.ai/v1/tasks';

    switch (action) {
      case 'create-task': {
        const { prompt, mode, connectors, hide_in_task_list, create_shareable_link, attachments } = body;
        
        const response = await fetch(manusApiUrl, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'API_KEY': manusApiKey
          },
          body: JSON.stringify({
            prompt,
            mode: mode || 'fast',
            connectors: connectors || [],
            hide_in_task_list: hide_in_task_list || false,
            create_shareable_link: create_shareable_link || false,
            attachments: attachments || []
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Manus API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get-task': {
        const { taskId } = body;
        
        const response = await fetch(`${manusApiUrl}/${taskId}`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'API_KEY': manusApiKey
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Manus API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'list-tasks': {
        const { limit } = body;
        
        const response = await fetch(`${manusApiUrl}?limit=${limit || 10}`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'API_KEY': manusApiKey
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Manus API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
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