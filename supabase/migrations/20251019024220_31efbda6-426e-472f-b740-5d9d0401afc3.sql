-- Create screen_recordings table
CREATE TABLE public.screen_recordings (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_size BIGINT,
  duration_seconds INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflow_understandings table
CREATE TABLE public.workflow_understandings (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES public.screen_recordings(id) ON DELETE CASCADE,
  understanding_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflow_actions table
CREATE TABLE public.workflow_actions (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  understanding_id UUID NOT NULL REFERENCES public.workflow_understandings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  action_type TEXT NOT NULL,
  instructions TEXT NOT NULL,
  confidence_score DECIMAL(5,2) DEFAULT 0,
  estimated_time_seconds INTEGER DEFAULT 0,
  checkpoint_config JSONB,
  action_data JSONB,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create music_items table
CREATE TABLE public.music_items (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  platform TEXT NOT NULL,
  title TEXT NOT NULL,
  artists TEXT[] DEFAULT '{}',
  cover_art_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create angle_bank table
CREATE TABLE public.angle_bank (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  hook TEXT NOT NULL,
  duration_hint TEXT,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
  sound_fit INTEGER DEFAULT 0 CHECK (sound_fit >= 0 AND sound_fit <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content_queue table
CREATE TABLE public.content_queue (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  music_item_id UUID NOT NULL REFERENCES public.music_items(id) ON DELETE CASCADE,
  angle_id UUID REFERENCES public.angle_bank(id) ON DELETE SET NULL,
  day DATE NOT NULL,
  script TEXT,
  caption TEXT,
  hashtags TEXT[] DEFAULT '{}',
  cta TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  performance_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content_assets table
CREATE TABLE public.content_assets (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  content_queue_id UUID NOT NULL REFERENCES public.content_queue(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  variant TEXT,
  metadata JSONB,
  generation_params JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content_insights table
CREATE TABLE public.content_insights (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  music_item_id UUID NOT NULL REFERENCES public.music_items(id) ON DELETE CASCADE,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  angle_performance JSONB,
  hook_performance JSONB,
  cta_performance JSONB,
  color_performance JSONB,
  recommendations TEXT[] DEFAULT '{}',
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.screen_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_understandings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.angle_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for screen_recordings
CREATE POLICY "Users can view their own recordings"
ON public.screen_recordings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recordings"
ON public.screen_recordings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recordings"
ON public.screen_recordings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recordings"
ON public.screen_recordings FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for workflow_understandings
CREATE POLICY "Users can view understandings for their recordings"
ON public.workflow_understandings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.screen_recordings
    WHERE screen_recordings.id = workflow_understandings.recording_id
    AND screen_recordings.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert understandings for their recordings"
ON public.workflow_understandings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.screen_recordings
    WHERE screen_recordings.id = workflow_understandings.recording_id
    AND screen_recordings.user_id = auth.uid()
  )
);

-- RLS Policies for workflow_actions
CREATE POLICY "Users can view actions for their understandings"
ON public.workflow_actions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.workflow_understandings wu
    JOIN public.screen_recordings sr ON wu.recording_id = sr.id
    WHERE wu.id = workflow_actions.understanding_id
    AND sr.user_id = auth.uid()
  )
);

-- RLS Policies for music_items
CREATE POLICY "Users can view their own music items"
ON public.music_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own music items"
ON public.music_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own music items"
ON public.music_items FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own music items"
ON public.music_items FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for angle_bank (everyone can read, only authenticated can insert)
CREATE POLICY "Everyone can view angles"
ON public.angle_bank FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert angles"
ON public.angle_bank FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for content_queue
CREATE POLICY "Users can view content for their music items"
ON public.content_queue FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.music_items
    WHERE music_items.id = content_queue.music_item_id
    AND music_items.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert content for their music items"
ON public.content_queue FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.music_items
    WHERE music_items.id = content_queue.music_item_id
    AND music_items.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update content for their music items"
ON public.content_queue FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.music_items
    WHERE music_items.id = content_queue.music_item_id
    AND music_items.user_id = auth.uid()
  )
);

-- RLS Policies for content_assets
CREATE POLICY "Users can view assets for their content"
ON public.content_assets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.content_queue cq
    JOIN public.music_items mi ON cq.music_item_id = mi.id
    WHERE cq.id = content_assets.content_queue_id
    AND mi.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert assets for their content"
ON public.content_assets FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.content_queue cq
    JOIN public.music_items mi ON cq.music_item_id = mi.id
    WHERE cq.id = content_assets.content_queue_id
    AND mi.user_id = auth.uid()
  )
);

-- RLS Policies for content_insights
CREATE POLICY "Users can view insights for their music items"
ON public.content_insights FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.music_items
    WHERE music_items.id = content_insights.music_item_id
    AND music_items.user_id = auth.uid()
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_screen_recordings_updated_at
BEFORE UPDATE ON public.screen_recordings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_screen_recordings_user_id ON public.screen_recordings(user_id);
CREATE INDEX idx_workflow_understandings_recording_id ON public.workflow_understandings(recording_id);
CREATE INDEX idx_workflow_actions_understanding_id ON public.workflow_actions(understanding_id);
CREATE INDEX idx_music_items_user_id ON public.music_items(user_id);
CREATE INDEX idx_content_queue_music_item_id ON public.content_queue(music_item_id);
CREATE INDEX idx_content_queue_day ON public.content_queue(day);
CREATE INDEX idx_content_assets_content_queue_id ON public.content_assets(content_queue_id);
CREATE INDEX idx_content_insights_music_item_id ON public.content_insights(music_item_id);