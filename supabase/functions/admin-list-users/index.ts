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

    // Check if user is admin using security definer function
    const { data: isAdminData, error: roleError } = await supabaseClient
      .rpc('is_admin');

    if (roleError || !isAdminData) {
      console.error('[Admin] Role check failed:', roleError);
      return new Response(
        JSON.stringify({ success: false, error: 'FORBIDDEN', message: 'Admin access required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Fetch all users with their profiles and roles
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      throw profilesError;
    }

    // Fetch user roles
    const { data: roles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) {
      throw rolesError;
    }

    // Fetch usage stats for each user
    const { data: usageStats, error: usageError } = await supabaseClient
      .from('api_usage_logs')
      .select('user_id, cost_usd, tokens_used');

    if (usageError) {
      console.error('[Admin] Usage stats fetch failed:', usageError);
    }

    // Combine data
    const usersWithStats = profiles.map(profile => {
      const userRoles = roles?.filter(r => r.user_id === profile.id).map(r => r.role) || [];
      const userUsage = usageStats?.filter(u => u.user_id === profile.id) || [];
      const totalCost = userUsage.reduce((sum, u) => sum + (parseFloat(u.cost_usd) || 0), 0);
      const totalTokens = userUsage.reduce((sum, u) => sum + (u.tokens_used || 0), 0);

      return {
        ...profile,
        roles: userRoles,
        usage: {
          totalCost: totalCost.toFixed(4),
          totalTokens,
          analysisCount: userUsage.length,
        },
      };
    });

    return new Response(
      JSON.stringify({ success: true, users: usersWithStats }),
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
