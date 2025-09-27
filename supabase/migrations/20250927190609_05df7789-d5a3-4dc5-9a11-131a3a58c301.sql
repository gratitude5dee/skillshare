-- Screen Recordings Table
CREATE TABLE public.screen_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_size BIGINT,
  duration_seconds INTEGER,
  raw_data JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'error'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.screen_recordings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create their own recordings" ON public.screen_recordings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own recordings" ON public.screen_recordings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own recordings" ON public.screen_recordings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recordings" ON public.screen_recordings
  FOR DELETE USING (auth.uid() = user_id);

-- Workflow Understanding (AI Analysis Results)
CREATE TABLE public.workflow_understandings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES public.screen_recordings(id) ON DELETE CASCADE,
  processed_data JSONB DEFAULT '{}'::jsonb,
  manus_response JSONB DEFAULT '{}'::jsonb,
  actions_identified INTEGER DEFAULT 0,
  analysis_summary TEXT,
  confidence_score DOUBLE PRECISION DEFAULT 0.0,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'error'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflow_understandings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view understandings for their recordings" ON public.workflow_understandings
  FOR SELECT USING (recording_id IN (
    SELECT id FROM public.screen_recordings WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create understandings for their recordings" ON public.workflow_understandings
  FOR INSERT WITH CHECK (recording_id IN (
    SELECT id FROM public.screen_recordings WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update understandings for their recordings" ON public.workflow_understandings
  FOR UPDATE USING (recording_id IN (
    SELECT id FROM public.screen_recordings WHERE user_id = auth.uid()
  ));

-- Executable Workflow Actions
CREATE TABLE public.workflow_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  understanding_id UUID NOT NULL REFERENCES public.workflow_understandings(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'click', 'form_fill', 'navigation', 'data_entry', 'wait', 'screenshot'
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT, -- Natural language instructions for execution
  action_data JSONB DEFAULT '{}'::jsonb, -- Structured action parameters
  confidence_score DOUBLE PRECISION DEFAULT 0.0,
  estimated_time_seconds INTEGER DEFAULT 60,
  checkpoint_config JSONB DEFAULT '{"enabled": true, "importance": 5}'::jsonb,
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflow_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies  
CREATE POLICY "Users can view actions for their workflows" ON public.workflow_actions
  FOR SELECT USING (understanding_id IN (
    SELECT wu.id FROM public.workflow_understandings wu
    JOIN public.screen_recordings sr ON wu.recording_id = sr.id
    WHERE sr.user_id = auth.uid()
  ));

CREATE POLICY "Users can create actions for their workflows" ON public.workflow_actions
  FOR INSERT WITH CHECK (understanding_id IN (
    SELECT wu.id FROM public.workflow_understandings wu
    JOIN public.screen_recordings sr ON wu.recording_id = sr.id
    WHERE sr.user_id = auth.uid()
  ));

CREATE POLICY "Users can update actions for their workflows" ON public.workflow_actions
  FOR UPDATE USING (understanding_id IN (
    SELECT wu.id FROM public.workflow_understandings wu
    JOIN public.screen_recordings sr ON wu.recording_id = sr.id
    WHERE sr.user_id = auth.uid()
  ));

-- Execution Logs (Real-time Tracking)
CREATE TABLE public.execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id UUID NOT NULL REFERENCES public.workflow_actions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'started', -- 'started', 'running', 'completed', 'failed', 'cancelled'
  start_time TIMESTAMPTZ DEFAULT now(),
  end_time TIMESTAMPTZ,
  duration_seconds DOUBLE PRECISION,
  checkpoints_shown INTEGER DEFAULT 0,
  checkpoints_modified INTEGER DEFAULT 0,
  checkpoints_cancelled INTEGER DEFAULT 0,
  execution_data JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  screenshot_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.execution_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own execution logs" ON public.execution_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own execution logs" ON public.execution_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own execution logs" ON public.execution_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- User Automation Preferences
CREATE TABLE public.user_automation_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  checkpoint_frequency TEXT NOT NULL DEFAULT 'medium', -- 'high', 'medium', 'low', 'off'
  importance_threshold INTEGER NOT NULL DEFAULT 5, -- 1-10 scale
  auto_retry_count INTEGER NOT NULL DEFAULT 3,
  timeout_seconds INTEGER NOT NULL DEFAULT 300,
  saved_decisions JSONB DEFAULT '{}'::jsonb, -- Cached user checkpoint decisions
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_automation_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own preferences" ON public.user_automation_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" ON public.user_automation_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_automation_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Analytics Data (Performance Metrics)
CREATE TABLE public.automation_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action_id UUID REFERENCES public.workflow_actions(id),
  execution_log_id UUID REFERENCES public.execution_logs(id),
  metric_type TEXT NOT NULL, -- 'execution_time', 'time_saved', 'success_rate', 'automation_level'
  metric_value DOUBLE PRECISION,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.automation_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own analytics" ON public.automation_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics" ON public.automation_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_screen_recordings_user_id ON public.screen_recordings(user_id);
CREATE INDEX idx_screen_recordings_status ON public.screen_recordings(status);
CREATE INDEX idx_workflow_understandings_recording_id ON public.workflow_understandings(recording_id);
CREATE INDEX idx_workflow_actions_understanding_id ON public.workflow_actions(understanding_id);
CREATE INDEX idx_execution_logs_user_id ON public.execution_logs(user_id);
CREATE INDEX idx_execution_logs_action_id ON public.execution_logs(action_id);
CREATE INDEX idx_automation_analytics_user_id ON public.automation_analytics(user_id);

-- Create update timestamp triggers
CREATE TRIGGER update_screen_recordings_updated_at
  BEFORE UPDATE ON public.screen_recordings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_workflow_understandings_updated_at
  BEFORE UPDATE ON public.workflow_understandings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_automation_preferences_updated_at
  BEFORE UPDATE ON public.user_automation_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();