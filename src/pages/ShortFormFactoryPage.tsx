import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { 
  Play, 
  Music, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  Video, 
  Image as ImageIcon,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Download,
  Share2,
  Target,
  Zap,
  Brain
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ShortFormWorkflowService } from '@/services/ShortFormWorkflowService';
import { WorkflowVisualization } from '@/components/short-form/WorkflowVisualization';
import { ContentCalendar } from '@/components/short-form/ContentCalendar';
import { AnalyticsDashboard } from '@/components/short-form/AnalyticsDashboard';
import { AssetGallery } from '@/components/short-form/AssetGallery';

interface MusicItem {
  id: string;
  source_url: string;
  platform: string;
  title: string;
  artists: string[];
  cover_art_url?: string;
  status?: string;
  created_at: string;
}

export const ShortFormFactoryPage: React.FC = () => {
  const { toast } = useToast();
  const [sourceUrl, setSourceUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [musicItems, setMusicItems] = useState<MusicItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MusicItem | null>(null);
  const [activeTab, setActiveTab] = useState('workflow');
  const [workflowStatus, setWorkflowStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    loadMusicItems();
  }, []);

  const loadMusicItems = async () => {
    try {
      const { data, error } = await supabase
        .from('music_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMusicItems(data || []);
    } catch (error) {
      console.error('Error loading music items:', error);
      toast({
        title: "Error",
        description: "Failed to load music items",
        variant: "destructive"
      });
    }
  };

  const detectPlatform = (url: string): string => {
    if (url.includes('spotify.com')) return 'spotify';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    return 'unknown';
  };

  const validateUrl = (url: string): boolean => {
    const platform = detectPlatform(url);
    if (platform === 'unknown') return false;
    
    // Basic URL validation
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sourceUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a source URL",
        variant: "destructive"
      });
      return;
    }

    if (!validateUrl(sourceUrl)) {
      toast({
        title: "Error",
        description: "Please enter a valid Spotify or YouTube URL",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const platform = detectPlatform(sourceUrl);
      
      // Start the workflow
      const result = await ShortFormWorkflowService.startWorkflow({
        source_url: sourceUrl,
        platform
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Workflow started! Your content will be ready soon.",
        });
        
        setSourceUrl('');
        loadMusicItems();
        
        // Set the newly created item as selected
        if (result.musicItemId) {
          const newItem = musicItems.find(item => item.id === result.musicItemId);
          if (newItem) setSelectedItem(newItem);
        }
      } else {
        throw new Error(result.error || 'Failed to start workflow');
      }
    } catch (error) {
      console.error('Error starting workflow:', error);
      toast({
        title: "Error",
        description: "Failed to start content creation workflow",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'processing': return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'failed': return <AlertCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Powered by Gemini
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              Turn Any Track Into
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Viral Content</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Drop a Spotify track or YouTube video and watch our AI create a complete content strategy 
              with trending angles, beat-synced videos, and performance insights.
            </p>

            {/* Input Form */}
            <Card className="max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border border-border/50">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="source-url" className="text-sm font-medium">
                      Spotify Track/Album or YouTube Video/Playlist
                    </Label>
                    <div className="relative">
                      <Input
                        id="source-url"
                        type="url"
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        placeholder="https://open.spotify.com/track/... or https://youtube.com/watch?v=..."
                        className="pr-12"
                        disabled={isProcessing}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <Music className="h-4 w-4 text-muted-foreground" />
                        <Play className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Content...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Start Content Factory
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Music Items Grid */}
          {musicItems.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Your Content Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {musicItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedItem?.id === item.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {item.cover_art_url ? (
                          <img 
                            src={item.cover_art_url} 
                            alt={item.title}
                            className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                            <Music className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">{item.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {item.artists?.join(', ') || 'Unknown Artist'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {item.platform}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getStatusColor(item.status)}`}
                            >
                              {getStatusIcon(item.status)}
                              {item.status || 'pending'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Content Tabs */}
          {selectedItem && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-muted/50">
                <TabsTrigger value="workflow" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Workflow
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="assets" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Assets
                </TabsTrigger>
              </TabsList>

              <TabsContent value="workflow" className="space-y-6">
                <WorkflowVisualization musicItem={selectedItem} />
              </TabsContent>

              <TabsContent value="calendar" className="space-y-6">
                <ContentCalendar musicItemId={selectedItem.id} />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <AnalyticsDashboard musicItemId={selectedItem.id} />
              </TabsContent>

              <TabsContent value="assets" className="space-y-6">
                <AssetGallery musicItemId={selectedItem.id} />
              </TabsContent>
            </Tabs>
          )}

          {/* Empty State */}
          {musicItems.length === 0 && !isProcessing && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No content projects yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by adding a Spotify track or YouTube video above to create your first viral content.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};