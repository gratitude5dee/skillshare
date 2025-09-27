import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart, 
  Share2, 
  Play, 
  Clock,
  Target,
  Zap,
  Award,
  Users,
  MessageCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsDashboardProps {
  musicItemId: string;
}

interface PerformanceMetrics {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  saves: number;
  completion_rate: number;
  click_through_rate: number;
  engagement_rate: number;
}

interface ContentInsight {
  id: string;
  period_start: string;
  period_end: string;
  angle_performance: any;
  hook_performance: any;
  cta_performance: any;
  color_performance: any;
  recommendations: string[];
  summary: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ musicItemId }) => {
  const [insights, setInsights] = useState<ContentInsight[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    views: 0,
    likes: 0,
    shares: 0,
    comments: 0,
    saves: 0,
    completion_rate: 0,
    click_through_rate: 0,
    engagement_rate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [musicItemId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load insights
      const { data: insightsData, error: insightsError } = await supabase
        .from('content_insights')
        .select('*')
        .eq('music_item_id', musicItemId)
        .order('created_at', { ascending: false });

      if (insightsError) throw insightsError;
      setInsights(insightsData || []);

      // Load aggregated metrics from content queue performance data
      const { data: contentData, error: contentError } = await supabase
        .from('content_queue')
        .select('performance_data')
        .eq('music_item_id', musicItemId);

      if (contentError) throw contentError;

      // Aggregate performance metrics
      const aggregatedMetrics = contentData?.reduce((acc, item) => {
        const perf = item.performance_data as any;
        if (perf) {
          acc.views += perf.views || 0;
          acc.likes += perf.likes || 0;
          acc.shares += perf.shares || 0;
          acc.comments += perf.comments || 0;
          acc.saves += perf.saves || 0;
          acc.completion_rate += perf.completion_rate || 0;
          acc.click_through_rate += perf.click_through_rate || 0;
          acc.engagement_rate += perf.engagement_rate || 0;
        }
        return acc;
      }, {
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0,
        saves: 0,
        completion_rate: 0,
        click_through_rate: 0,
        engagement_rate: 0
      });

      if (aggregatedMetrics && contentData?.length > 0) {
        // Calculate averages for rate metrics
        aggregatedMetrics.completion_rate = aggregatedMetrics.completion_rate / contentData.length;
        aggregatedMetrics.click_through_rate = aggregatedMetrics.click_through_rate / contentData.length;
        aggregatedMetrics.engagement_rate = aggregatedMetrics.engagement_rate / contentData.length;
        setMetrics(aggregatedMetrics);
      }

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  // Mock data for demonstration
  const topPerformingAngles = [
    {
      hook: "Behind the scenes of creating this track",
      performance: 94,
      views: 125000,
      engagement: 8.2,
      type: "BTS"
    },
    {
      hook: "This song hits different at 3am",
      performance: 87,
      views: 98000,
      engagement: 7.4,
      type: "Mood"
    },
    {
      hook: "POV: You discover your new favorite artist",
      performance: 82,
      views: 76000,
      engagement: 6.8,
      type: "Discovery"
    }
  ];

  const colorPerformance = [
    { palette: "Deep Purple & Gold", performance: 92, engagement: 8.1 },
    { palette: "Neon Blue & Pink", performance: 86, engagement: 7.3 },
    { palette: "Warm Orange & Red", performance: 79, engagement: 6.9 }
  ];

  const ctaPerformance = [
    { text: "Stream now ↗️", clicks: 2340, ctr: 4.2 },
    { text: "Save this sound 🔥", clicks: 1890, ctr: 3.8 },
    { text: "Follow for more vibes ✨", clicks: 1560, ctr: 3.1 }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold text-foreground">{formatNumber(metrics.views)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+12.3%</span>
                </div>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Engagement Rate</p>
                <p className="text-2xl font-bold text-foreground">{metrics.engagement_rate.toFixed(1)}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+0.8%</span>
                </div>
              </div>
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-foreground">{metrics.completion_rate.toFixed(1)}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-500">-1.2%</span>
                </div>
              </div>
              <Play className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Click Through</p>
                <p className="text-2xl font-bold text-foreground">{metrics.click_through_rate.toFixed(1)}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+2.1%</span>
                </div>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="angles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="angles">Content Angles</TabsTrigger>
          <TabsTrigger value="colors">Color Performance</TabsTrigger>
          <TabsTrigger value="ctas">CTAs & Conversion</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="angles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top Performing Angles
              </CardTitle>
              <CardDescription>
                Content hooks ranked by viral performance and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformingAngles.map((angle, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {angle.type}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-green-500/10 text-green-500 border-green-500/20"
                        >
                          #{index + 1}
                        </Badge>
                      </div>
                      <p className="font-medium text-foreground mb-1">{angle.hook}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatNumber(angle.views)} views</span>
                        <span>{angle.engagement}% engagement</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground mb-1">
                        {angle.performance}%
                      </div>
                      <Progress value={angle.performance} className="w-20 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Color Palette Performance
              </CardTitle>
              <CardDescription>
                Visual themes and their impact on engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {colorPerformance.map((color, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <p className="font-medium text-foreground mb-1">{color.palette}</p>
                      <p className="text-sm text-muted-foreground">
                        {color.engagement}% average engagement
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground mb-1">
                        {color.performance}%
                      </div>
                      <Progress value={color.performance} className="w-20 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ctas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Call-to-Action Performance
              </CardTitle>
              <CardDescription>
                CTA effectiveness and conversion optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ctaPerformance.map((cta, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <p className="font-medium text-foreground mb-1">{cta.text}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(cta.clicks)} clicks
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground mb-1">
                        {cta.ctr}%
                      </div>
                      <p className="text-xs text-muted-foreground">CTR</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI-Powered Insights
              </CardTitle>
              <CardDescription>
                Machine learning recommendations for optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              {insights.length > 0 ? (
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div key={insight.id} className="p-4 rounded-lg bg-muted/30">
                      <p className="font-medium text-foreground mb-2">{insight.summary}</p>
                      <div className="space-y-2">
                        {insight.recommendations?.map((rec, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-foreground mb-2">Analytics Coming Soon</h3>
                  <p className="text-sm text-muted-foreground">
                    AI insights will appear here once your content starts performing.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Best Performing Content Type</h4>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  Behind-the-Scenes
                </Badge>
                <span className="text-sm text-muted-foreground">94% avg performance</span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Optimal Posting Time</h4>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">7:00 PM - 9:00 PM</span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Growth Trend</h4>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">+23% this week</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};