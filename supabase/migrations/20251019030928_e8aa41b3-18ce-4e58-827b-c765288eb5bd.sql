-- Add columns to screen_recordings table
ALTER TABLE public.screen_recordings 
  ADD COLUMN IF NOT EXISTS storage_type VARCHAR(20) CHECK (storage_type IN ('local', 'supabase')) DEFAULT 'supabase',
  ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100) DEFAULT 'video/webm';

-- Rename duration_seconds to duration if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'screen_recordings' 
    AND column_name = 'duration_seconds'
  ) THEN
    ALTER TABLE public.screen_recordings 
      RENAME COLUMN duration_seconds TO duration;
  END IF;
END $$;

-- Create video_analyses table
CREATE TABLE IF NOT EXISTS public.video_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID REFERENCES public.screen_recordings(id) ON DELETE CASCADE NOT NULL,
  gemini_file_id VARCHAR(255),
  total_frames INTEGER,
  frames_analyzed INTEGER,
  analysis_duration INTEGER,
  complexity_score DECIMAL(3,2),
  markdown_path VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create workflow_steps table (enhanced version of workflow_actions)
CREATE TABLE IF NOT EXISTS public.workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.video_analyses(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL,
  timestamp_ms INTEGER NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  action_description TEXT NOT NULL,
  target_element VARCHAR(255),
  coordinates JSONB,
  screenshot_path VARCHAR(500),
  confidence_score DECIMAL(3,2),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.video_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for video_analyses
CREATE POLICY "Users can view their own video analyses"
  ON public.video_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.screen_recordings
      WHERE screen_recordings.id = video_analyses.recording_id
      AND screen_recordings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own video analyses"
  ON public.video_analyses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.screen_recordings
      WHERE screen_recordings.id = video_analyses.recording_id
      AND screen_recordings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own video analyses"
  ON public.video_analyses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.screen_recordings
      WHERE screen_recordings.id = video_analyses.recording_id
      AND screen_recordings.user_id = auth.uid()
    )
  );

-- RLS Policies for workflow_steps
CREATE POLICY "Users can view their own workflow steps"
  ON public.workflow_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.video_analyses va
      JOIN public.screen_recordings sr ON va.recording_id = sr.id
      WHERE va.id = workflow_steps.analysis_id
      AND sr.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own workflow steps"
  ON public.workflow_steps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.video_analyses va
      JOIN public.screen_recordings sr ON va.recording_id = sr.id
      WHERE va.id = workflow_steps.analysis_id
      AND sr.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_analyses_recording_id ON public.video_analyses(recording_id);
CREATE INDEX IF NOT EXISTS idx_video_analyses_status ON public.video_analyses(status);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_analysis_id ON public.workflow_steps(analysis_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_step_number ON public.workflow_steps(step_number);

-- Create storage bucket for analysis artifacts (markdown, screenshots)
INSERT INTO storage.buckets (id, name, public)
VALUES ('analysis-artifacts', 'analysis-artifacts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for analysis-artifacts
CREATE POLICY "Users can upload their own analysis artifacts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'analysis-artifacts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own analysis artifacts"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'analysis-artifacts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own analysis artifacts"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'analysis-artifacts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own analysis artifacts"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'analysis-artifacts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );