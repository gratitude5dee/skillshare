import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, BarChart3 } from "lucide-react";

interface UsageStats {
  totalAnalyses: number;
  totalRecordings: number;
  avgProcessingTime: number;
}

export function UsageStatsCard() {
  const [stats, setStats] = useState<UsageStats>({
    totalAnalyses: 0,
    totalRecordings: 0,
    avgProcessingTime: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get total recordings
    const { count: recordingsCount } = await supabase
      .from('screen_recordings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get usage logs
    const { data: usageLogs } = await supabase
      .from('api_usage_logs')
      .select('response_time_ms')
      .eq('user_id', user.id)
      .eq('action', 'analyze_recording');

    const avgTime = usageLogs && usageLogs.length > 0
      ? usageLogs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / usageLogs.length
      : 0;

    setStats({
      totalAnalyses: usageLogs?.length || 0,
      totalRecordings: recordingsCount || 0,
      avgProcessingTime: Math.round(avgTime / 1000) // Convert to seconds
    });
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Usage Statistics</CardTitle>
        <CardDescription>Your automation activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total Analyses</span>
            </div>
            <span className="text-2xl font-bold">{stats.totalAnalyses}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total Recordings</span>
            </div>
            <span className="text-2xl font-bold">{stats.totalRecordings}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Avg. Processing</span>
            </div>
            <span className="text-2xl font-bold">{stats.avgProcessingTime}s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
