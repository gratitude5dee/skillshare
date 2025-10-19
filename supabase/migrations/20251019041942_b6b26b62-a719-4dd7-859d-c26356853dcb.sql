-- Phase 1: Add subscription management and usage tracking

-- 1. Add subscription and quota fields to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS api_quota_remaining INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS api_quota_limit INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS quota_reset_at TIMESTAMP DEFAULT (NOW() + INTERVAL '1 month');

-- 2. Create API usage logs table for tracking
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recording_id UUID REFERENCES public.screen_recordings(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,4) DEFAULT 0.0000,
  response_time_ms INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create shared workflows table for collaboration features
CREATE TABLE IF NOT EXISTS public.shared_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID REFERENCES public.screen_recordings(id) ON DELETE CASCADE NOT NULL,
  shared_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  share_token VARCHAR(255) UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255),
  expires_at TIMESTAMP,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Enable RLS on new tables
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_workflows ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for api_usage_logs
CREATE POLICY "Users can view their own usage logs"
  ON public.api_usage_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage logs"
  ON public.api_usage_logs
  FOR INSERT
  WITH CHECK (true);

-- 6. RLS Policies for shared_workflows
CREATE POLICY "Users can view their own shared workflows"
  ON public.shared_workflows
  FOR SELECT
  USING (auth.uid() = shared_by_user_id);

CREATE POLICY "Users can create shared workflows for their recordings"
  ON public.shared_workflows
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.screen_recordings 
      WHERE id = recording_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own shared workflows"
  ON public.shared_workflows
  FOR UPDATE
  USING (auth.uid() = shared_by_user_id);

CREATE POLICY "Users can delete their own shared workflows"
  ON public.shared_workflows
  FOR DELETE
  USING (auth.uid() = shared_by_user_id);

CREATE POLICY "Public shared workflows are viewable by token"
  ON public.shared_workflows
  FOR SELECT
  USING (is_public = true);

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON public.api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON public.api_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_shared_workflows_token ON public.shared_workflows(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_workflows_user ON public.shared_workflows(shared_by_user_id);

-- 8. Create function to reset monthly quotas
CREATE OR REPLACE FUNCTION public.reset_user_quota(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_tier VARCHAR(50);
  new_limit INTEGER;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO user_tier
  FROM public.profiles
  WHERE id = user_uuid;
  
  -- Set quota limit based on tier
  new_limit := CASE user_tier
    WHEN 'pro' THEN 100
    WHEN 'enterprise' THEN 999999
    ELSE 10
  END;
  
  -- Reset quota
  UPDATE public.profiles
  SET 
    api_quota_remaining = new_limit,
    api_quota_limit = new_limit,
    quota_reset_at = NOW() + INTERVAL '1 month'
  WHERE id = user_uuid;
END;
$$;

-- 9. Create function to decrement quota
CREATE OR REPLACE FUNCTION public.decrement_user_quota(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  quota_remaining INTEGER;
BEGIN
  -- Get current quota
  SELECT api_quota_remaining INTO quota_remaining
  FROM public.profiles
  WHERE id = user_uuid;
  
  -- Check if quota is available
  IF quota_remaining <= 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Decrement quota
  UPDATE public.profiles
  SET api_quota_remaining = api_quota_remaining - 1
  WHERE id = user_uuid;
  
  RETURN TRUE;
END;
$$;

-- 10. Update trigger for updated_at on shared_workflows
CREATE OR REPLACE TRIGGER update_shared_workflows_updated_at
  BEFORE UPDATE ON public.shared_workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();