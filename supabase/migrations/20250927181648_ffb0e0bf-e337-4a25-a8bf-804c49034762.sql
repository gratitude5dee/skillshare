-- Create tables for Short-Form Factory workflow

-- Music items table for storing track/album metadata
CREATE TABLE IF NOT EXISTS public.music_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_url TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('spotify', 'youtube')),
  title TEXT NOT NULL,
  artists TEXT[],
  album TEXT,
  cover_art_url TEXT,
  release_date DATE,
  spotify_id TEXT,
  youtube_id TEXT,
  isrc TEXT,
  bpm INTEGER,
  key TEXT,
  mode TEXT,
  energy REAL,
  danceability REAL,
  valence REAL,
  duration INTEGER,
  channel TEXT,
  tags TEXT[],
  publish_date DATE,
  thumb_url TEXT,
  mood_tags TEXT[],
  genre_tags TEXT[],
  tempo_estimate INTEGER,
  instrumentation TEXT[],
  color_palette JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Angle bank for trend-based content angles
CREATE TABLE IF NOT EXISTS public.angle_bank (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  music_item_id UUID NOT NULL REFERENCES public.music_items(id) ON DELETE CASCADE,
  hook TEXT NOT NULL,
  variant_hooks TEXT[3],
  visual_pattern TEXT,
  edit_style TEXT,
  duration_hint TEXT,
  cta_type TEXT,
  example_links TEXT[],
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  sound_fit INTEGER CHECK (sound_fit BETWEEN 0 AND 100),
  notes TEXT,
  trend_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Content queue for scheduled content
CREATE TABLE IF NOT EXISTS public.content_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  music_item_id UUID NOT NULL REFERENCES public.music_items(id) ON DELETE CASCADE,
  angle_id UUID NOT NULL REFERENCES public.angle_bank(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  script TEXT NOT NULL,
  beats JSONB,
  caption TEXT,
  hashtags TEXT[],
  cta TEXT,
  palette JSONB,
  thumb_prompt TEXT,
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'drafted', 'published', 'archived')),
  performance_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Assets for generated content
CREATE TABLE IF NOT EXISTS public.content_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_queue_id UUID NOT NULL REFERENCES public.content_queue(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('video', 'thumbnail', 'audio', 'image')),
  file_url TEXT NOT NULL,
  file_path TEXT,
  variant TEXT,
  metadata JSONB DEFAULT '{}',
  generation_params JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insights for analytics and feedback
CREATE TABLE IF NOT EXISTS public.content_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  music_item_id UUID REFERENCES public.music_items(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  angle_performance JSONB,
  hook_performance JSONB,
  cta_performance JSONB,
  color_performance JSONB,
  recommendations TEXT[],
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.music_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.angle_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for music_items
CREATE POLICY "Users can create their own music items" ON public.music_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own music items" ON public.music_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own music items" ON public.music_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own music items" ON public.music_items
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for angle_bank
CREATE POLICY "Users can view angles for their music items" ON public.angle_bank
  FOR SELECT USING (music_item_id IN (
    SELECT id FROM public.music_items WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create angles for their music items" ON public.angle_bank
  FOR INSERT WITH CHECK (music_item_id IN (
    SELECT id FROM public.music_items WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update angles for their music items" ON public.angle_bank
  FOR UPDATE USING (music_item_id IN (
    SELECT id FROM public.music_items WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete angles for their music items" ON public.angle_bank
  FOR DELETE USING (music_item_id IN (
    SELECT id FROM public.music_items WHERE user_id = auth.uid()
  ));

-- RLS Policies for content_queue
CREATE POLICY "Users can view content for their music items" ON public.content_queue
  FOR SELECT USING (music_item_id IN (
    SELECT id FROM public.music_items WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create content for their music items" ON public.content_queue
  FOR INSERT WITH CHECK (music_item_id IN (
    SELECT id FROM public.music_items WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update content for their music items" ON public.content_queue
  FOR UPDATE USING (music_item_id IN (
    SELECT id FROM public.music_items WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete content for their music items" ON public.content_queue
  FOR DELETE USING (music_item_id IN (
    SELECT id FROM public.music_items WHERE user_id = auth.uid()
  ));

-- RLS Policies for content_assets
CREATE POLICY "Users can view assets for their content" ON public.content_assets
  FOR SELECT USING (content_queue_id IN (
    SELECT cq.id FROM public.content_queue cq
    JOIN public.music_items mi ON cq.music_item_id = mi.id
    WHERE mi.user_id = auth.uid()
  ));

CREATE POLICY "Users can create assets for their content" ON public.content_assets
  FOR INSERT WITH CHECK (content_queue_id IN (
    SELECT cq.id FROM public.content_queue cq
    JOIN public.music_items mi ON cq.music_item_id = mi.id
    WHERE mi.user_id = auth.uid()
  ));

CREATE POLICY "Users can update assets for their content" ON public.content_assets
  FOR UPDATE USING (content_queue_id IN (
    SELECT cq.id FROM public.content_queue cq
    JOIN public.music_items mi ON cq.music_item_id = mi.id
    WHERE mi.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete assets for their content" ON public.content_assets
  FOR DELETE USING (content_queue_id IN (
    SELECT cq.id FROM public.content_queue cq
    JOIN public.music_items mi ON cq.music_item_id = mi.id
    WHERE mi.user_id = auth.uid()
  ));

-- RLS Policies for content_insights
CREATE POLICY "Users can view insights for their music items" ON public.content_insights
  FOR SELECT USING (music_item_id IN (
    SELECT id FROM public.music_items WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create insights for their music items" ON public.content_insights
  FOR INSERT WITH CHECK (music_item_id IN (
    SELECT id FROM public.music_items WHERE user_id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_music_items_user_id ON public.music_items(user_id);
CREATE INDEX IF NOT EXISTS idx_music_items_platform ON public.music_items(platform);
CREATE INDEX IF NOT EXISTS idx_angle_bank_music_item_id ON public.angle_bank(music_item_id);
CREATE INDEX IF NOT EXISTS idx_angle_bank_sound_fit ON public.angle_bank(sound_fit);
CREATE INDEX IF NOT EXISTS idx_content_queue_music_item_id ON public.content_queue(music_item_id);
CREATE INDEX IF NOT EXISTS idx_content_queue_day ON public.content_queue(day);
CREATE INDEX IF NOT EXISTS idx_content_queue_status ON public.content_queue(status);
CREATE INDEX IF NOT EXISTS idx_content_assets_content_queue_id ON public.content_assets(content_queue_id);
CREATE INDEX IF NOT EXISTS idx_content_assets_asset_type ON public.content_assets(asset_type);

-- Create update triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_music_items_updated_at
  BEFORE UPDATE ON public.music_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_angle_bank_updated_at
  BEFORE UPDATE ON public.angle_bank
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_queue_updated_at
  BEFORE UPDATE ON public.content_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();