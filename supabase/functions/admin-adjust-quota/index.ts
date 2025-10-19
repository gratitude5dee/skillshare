import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Authenticate user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'UNAUTHORIZED', message: 'Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check if user is admin
    const { data: isAdminData, error: roleError } = await supabaseClient
      .rpc('is_admin');

    if (roleError || !isAdminData) {
      return new Response(
        JSON.stringify({ success: false, error: 'FORBIDDEN', message: 'Admin access required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    const { targetUserId, newQuotaRemaining, newQuotaLimit } = await req.json();

    if (!targetUserId) {
      return new Response(
        JSON.stringify({ success: false, error: 'INVALID_REQUEST', message: 'Target user ID required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Update quota
    const updateData: any = {};
    if (newQuotaRemaining !== undefined) updateData.api_quota_remaining = newQuotaRemaining;
    if (newQuotaLimit !== undefined) updateData.api_quota_limit = newQuotaLimit;

    const { data, error } = await supabaseClient
      .from('profiles')
      .update(updateData)
      .eq('id', targetUserId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log(`[Admin] Quota adjusted for user ${targetUserId}: remaining=${newQuotaRemaining}, limit=${newQuotaLimit}`);

    return new Response(
      JSON.stringify({ success: true, profile: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('[Admin] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'INTERNAL_ERROR', message: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
