-- Add analysis fields to screen_recordings table
ALTER TABLE screen_recordings 
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'analyzing', 'completed', 'failed')),
  ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS analysis_data JSONB,
  ADD COLUMN IF NOT EXISTS analysis_markdown TEXT;

-- Create index for analysis status queries
CREATE INDEX IF NOT EXISTS idx_screen_recordings_analysis_status ON screen_recordings(analysis_status);

-- Create storage bucket for screen recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('screen-recordings', 'screen-recordings', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for screen recordings bucket
DROP POLICY IF EXISTS "Users can upload their own screen recordings" ON storage.objects;
CREATE POLICY "Users can upload their own screen recordings"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'screen-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can view their own screen recordings" ON storage.objects;
CREATE POLICY "Users can view their own screen recordings"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'screen-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete their own screen recordings" ON storage.objects;
CREATE POLICY "Users can delete their own screen recordings"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'screen-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);