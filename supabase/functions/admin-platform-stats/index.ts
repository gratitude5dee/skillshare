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

    // Fetch platform statistics
    const { count: totalUsers } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: totalRecordings } = await supabaseClient
      .from('screen_recordings')
      .select('*', { count: 'exact', head: true });

    const { count: totalAnalyses } = await supabaseClient
      .from('workflow_understandings')
      .select('*', { count: 'exact', head: true });

    const { data: usageLogs } = await supabaseClient
      .from('api_usage_logs')
      .select('cost_usd, tokens_used');

    const totalCost = usageLogs?.reduce((sum, log) => sum + (parseFloat(log.cost_usd) || 0), 0) || 0;
    const totalTokens = usageLogs?.reduce((sum, log) => sum + (log.tokens_used || 0), 0) || 0;

    // Tier distribution
    const { data: tierData } = await supabaseClient
      .from('profiles')
      .select('subscription_tier');

    const tierDistribution = tierData?.reduce((acc: any, profile) => {
      const tier = profile.subscription_tier || 'free';
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {}) || {};

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentUsers } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    const { count: recentAnalyses } = await supabaseClient
      .from('workflow_understandings')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    const stats = {
      overview: {
        totalUsers: totalUsers || 0,
        totalRecordings: totalRecordings || 0,
        totalAnalyses: totalAnalyses || 0,
        totalCost: totalCost.toFixed(4),
        totalTokens: totalTokens || 0,
      },
      tiers: tierDistribution,
      recent: {
        newUsers: recentUsers || 0,
        newAnalyses: recentAnalyses || 0,
      },
    };

    return new Response(
      JSON.stringify({ success: true, stats }),
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
