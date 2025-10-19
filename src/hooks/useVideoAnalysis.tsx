import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WorkflowStep {
  id: string;
  step_number: number;
  timestamp_ms: number;
  action_type: string;
  action_description: string;
  target_element: string;
  coordinates?: any;
  confidence_score: number;
  metadata?: any;
  screenshot_path?: string;
  analysis_id?: string;
  created_at?: string;
}

interface VideoAnalysis {
  id: string;
  recording_id: string;
  status: string;
  total_frames: number;
  frames_analyzed: number;
  complexity_score: number;
  markdown_path?: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export function useVideoAnalysis(recordingId: string | null) {
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recordingId) {
      setAnalysis(null);
      setSteps([]);
      return;
    }

    loadAnalysis();
  }, [recordingId]);

  const loadAnalysis = async () => {
    if (!recordingId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch analysis
      const { data: analysisData, error: analysisError } = await supabase
        .from('video_analyses')
        .select('*')
        .eq('recording_id', recordingId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (analysisError) {
        throw analysisError;
      }

      if (!analysisData) {
        setAnalysis(null);
        setSteps([]);
        return;
      }

      setAnalysis(analysisData);

      // If completed, fetch steps
      if (analysisData.status === 'completed') {
        const { data: stepsData, error: stepsError } = await supabase
          .from('workflow_steps')
          .select('*')
          .eq('analysis_id', analysisData.id)
          .order('step_number', { ascending: true });

        if (stepsError) {
          throw stepsError;
        }

        setSteps((stepsData || []) as WorkflowStep[]);
      }

      // If processing, poll for updates
      if (analysisData.status === 'processing') {
        setTimeout(loadAnalysis, 3000); // Poll every 3 seconds
      }

    } catch (err) {
      console.error('Error loading analysis:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analysis';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadMarkdown = async () => {
    if (!analysis?.markdown_path) return;

    try {
      const { data, error } = await supabase.storage
        .from('analysis-artifacts')
        .download(analysis.markdown_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'videounderstanding.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading markdown:', err);
      throw err;
    }
  };

  return {
    analysis,
    steps,
    isLoading,
    error,
    downloadMarkdown,
    refresh: loadAnalysis
  };
}
