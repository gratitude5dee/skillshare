-- Add metadata column to music_items table if it doesn't exist
ALTER TABLE public.music_items 
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;