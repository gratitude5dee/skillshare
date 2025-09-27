import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, 
  Image as ImageIcon, 
  Download, 
  Share2, 
  Eye, 
  MoreHorizontal,
  Play,
  Edit,
  Copy,
  Trash2,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AssetGalleryProps {
  musicItemId: string;
}

interface Asset {
  id: string;
  asset_type: string;
  file_url: string;
  variant?: string;
  metadata: any;
  generation_params: any;
  created_at: string;
  content_queue?: {
    day: string;
    status: string;
    angle?: {
      hook: string;
      duration_hint: string;
    };
  };
}

export const AssetGallery: React.FC<AssetGalleryProps> = ({ musicItemId }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssets();
  }, [musicItemId]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      
      // Get all content queue items for this music item
      const { data: contentQueue, error: queueError } = await supabase
        .from('content_queue')
        .select('id')
        .eq('music_item_id', musicItemId);

      if (queueError) throw queueError;

      const contentQueueIds = contentQueue?.map(item => item.id) || [];

      if (contentQueueIds.length === 0) {
        setAssets([]);
        return;
      }

      // Get assets for these content queue items
      const { data: assetsData, error: assetsError } = await supabase
        .from('content_assets')
        .select(`
          *,
          content_queue:content_queue_id (
            day,
            status,
            angle:angle_id (
              hook,
              duration_hint
            )
          )
        `)
        .in('content_queue_id', contentQueueIds)
        .order('created_at', { ascending: false });

      if (assetsError) throw assetsError;
      setAssets(assetsData || []);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAssets = () => {
    if (filterType === 'all') return assets;
    return assets.filter(asset => asset.asset_type === filterType);
  };

  const getAssetTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'thumbnail': return <ImageIcon className="h-4 w-4" />;
      case 'audio': return <Play className="h-4 w-4" />;
      case 'image': return <ImageIcon className="h-4 w-4" />;
      default: return <ImageIcon className="h-4 w-4" />;
    }
  };

  const getAssetTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'thumbnail': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'audio': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'image': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  const handleDownload = async (asset: Asset) => {
    try {
      const response = await fetch(asset.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${asset.asset_type}-${asset.id}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading asset:', error);
    }
  };

  const assetTypes = [
    { value: 'all', label: 'All Assets', count: assets.length },
    { value: 'video', label: 'Videos', count: assets.filter(a => a.asset_type === 'video').length },
    { value: 'thumbnail', label: 'Thumbnails', count: assets.filter(a => a.asset_type === 'thumbnail').length },
    { value: 'image', label: 'Images', count: assets.filter(a => a.asset_type === 'image').length },
    { value: 'audio', label: 'Audio', count: assets.filter(a => a.asset_type === 'audio').length }
  ];

  const filteredAssets = getFilteredAssets();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Asset Gallery
              </CardTitle>
              <CardDescription>
                Generated videos, thumbnails, and media assets
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {assetTypes.map((type) => (
          <Button
            key={type.value}
            variant={filterType === type.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType(type.value)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            {type.value !== 'all' && getAssetTypeIcon(type.value)}
            {type.label}
            <Badge variant="secondary" className="ml-1">
              {type.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Assets Grid/List */}
      {filteredAssets.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-4'
        }>
          {filteredAssets.map((asset) => (
            <Card 
              key={asset.id} 
              className="group cursor-pointer transition-all hover:shadow-lg"
              onClick={() => setSelectedAsset(asset)}
            >
              <CardContent className={viewMode === 'grid' ? 'p-0' : 'p-4'}>
                {viewMode === 'grid' ? (
                  <div>
                    {/* Asset Preview */}
                    <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
                      {asset.asset_type === 'video' ? (
                        <video 
                          className="w-full h-full object-cover"
                          poster={asset.metadata?.thumbnail_url}
                        >
                          <source src={asset.file_url} type="video/mp4" />
                        </video>
                      ) : (
                        <img 
                          src={asset.file_url} 
                          alt={`${asset.asset_type} asset`}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      <div className="absolute top-2 right-2">
                        <Badge 
                          variant="outline" 
                          className={`${getAssetTypeColor(asset.asset_type)} text-xs`}
                        >
                          {getAssetTypeIcon(asset.asset_type)}
                          {asset.asset_type}
                        </Badge>
                      </div>
                      {asset.asset_type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="h-6 w-6 text-black ml-1" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Asset Info */}
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {asset.content_queue?.angle?.hook || `${asset.asset_type} asset`}
                        </p>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {asset.variant && (
                          <span className="bg-muted/50 px-2 py-1 rounded">
                            {asset.variant}
                          </span>
                        )}
                        {asset.content_queue?.angle?.duration_hint && (
                          <span>{asset.content_queue.angle.duration_hint}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 relative overflow-hidden rounded-lg bg-muted flex-shrink-0">
                      {asset.asset_type === 'video' ? (
                        <video 
                          className="w-full h-full object-cover"
                          poster={asset.metadata?.thumbnail_url}
                        >
                          <source src={asset.file_url} type="video/mp4" />
                        </video>
                      ) : (
                        <img 
                          src={asset.file_url} 
                          alt={`${asset.asset_type} asset`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-foreground truncate">
                          {asset.content_queue?.angle?.hook || `${asset.asset_type} asset`}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`${getAssetTypeColor(asset.asset_type)} text-xs ml-2`}
                        >
                          {getAssetTypeIcon(asset.asset_type)}
                          {asset.asset_type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        {asset.variant && (
                          <span className="bg-muted/50 px-2 py-1 rounded text-xs">
                            {asset.variant}
                          </span>
                        )}
                        {asset.content_queue?.angle?.duration_hint && (
                          <span>{asset.content_queue.angle.duration_hint}</span>
                        )}
                        <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleDownload(asset)}>
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-3 w-3 mr-1" />
                          Share
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Video className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-foreground mb-2">No assets generated yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Assets will appear here as your content progresses through the generation pipeline.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Asset Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Asset Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {assets.filter(a => a.asset_type === 'video').length}
              </div>
              <div className="text-sm text-muted-foreground">Videos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {assets.filter(a => a.asset_type === 'thumbnail').length}
              </div>
              <div className="text-sm text-muted-foreground">Thumbnails</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {assets.filter(a => a.asset_type === 'image').length}
              </div>
              <div className="text-sm text-muted-foreground">Images</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {assets.filter(a => a.asset_type === 'audio').length}
              </div>
              <div className="text-sm text-muted-foreground">Audio Files</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};