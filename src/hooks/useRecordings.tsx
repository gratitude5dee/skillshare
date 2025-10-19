import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Recording {
  id: string;
  title: string;
  description: string;
  file_url?: string;
  file_size?: number;
  duration_seconds?: number;
  duration?: number;
  storage_type?: string;
  mime_type?: string;
  raw_data?: any;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useRecordings() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('screen_recordings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading recordings:', error);
        toast({
          title: "Error loading recordings",
          description: "Could not load your screen recordings.",
          variant: "destructive",
        });
        return;
      }

      setRecordings(data || []);
    } catch (error) {
      console.error('Error loading recordings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadRecording = async (file: File, metadata: { title: string; description: string }) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      const STORAGE_THRESHOLD = 20_000_000; // 20MB
      const useInlineStorage = file.size <= STORAGE_THRESHOLD;

      console.log(`[Upload] File size: ${(file.size / 1_000_000).toFixed(2)}MB, strategy: ${useInlineStorage ? 'inline' : 'bucket'}`);

      let fileUrl: string | null = null;
      let rawData: any = null;

      if (useInlineStorage) {
        // Store inline as base64 in database (≤20MB)
        const arrayBuffer = await file.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        rawData = {
          video_data: base64,
          original_filename: file.name,
          file_type: file.type,
          uploaded_at: new Date().toISOString()
        };
        
        toast({
          title: "Storing video inline",
          description: "Small video will be stored in database for fast access",
        });
      } else {
        // Upload to Supabase Storage (>20MB)
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('recordings')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from('recordings')
          .getPublicUrl(fileName);
        
        fileUrl = urlData.publicUrl;
        
        toast({
          title: "Uploading to storage",
          description: "Large video uploaded to cloud storage",
        });
      }

      // Create recording record
      const { data: recording, error: dbError } = await supabase
        .from('screen_recordings')
        .insert([{
          user_id: user.id,
          title: metadata.title,
          description: metadata.description,
          file_url: fileUrl,
          file_size: file.size,
          storage_type: useInlineStorage ? 'local' : 'supabase',
          mime_type: file.type || 'video/webm',
          raw_data: rawData,
          status: 'pending'
        }])
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      // Add to local state
      setRecordings(prev => [recording, ...prev]);

      // Trigger processing
      const { error: processError } = await supabase.functions.invoke('process-recording', {
        body: { recordingId: recording.id }
      });

      if (processError) {
        console.error('Error starting processing:', processError);
        // Update status to error
        await supabase
          .from('screen_recordings')
          .update({ status: 'error' })
          .eq('id', recording.id);
        
        setRecordings(prev => 
          prev.map(r => r.id === recording.id ? { ...r, status: 'error' } : r)
        );
      } else {
        // Update status to processing
        await supabase
          .from('screen_recordings')
          .update({ status: 'processing' })
          .eq('id', recording.id);
        
        setRecordings(prev => 
          prev.map(r => r.id === recording.id ? { ...r, status: 'processing' } : r)
        );
      }

      return recording;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const deleteRecording = async (recordingId: string) => {
    try {
      const recording = recordings.find(r => r.id === recordingId);
      
      // Delete file from storage if it exists (only for bucket storage)
      if (recording?.file_url && recording?.storage_type === 'supabase') {
        const storagePath = recording.file_url.split('/').slice(-2).join('/');
        if (storagePath) {
          await supabase.storage
            .from('recordings')
            .remove([storagePath]);
        }
      }

      // Delete database record
      const { error } = await supabase
        .from('screen_recordings')
        .delete()
        .eq('id', recordingId);

      if (error) {
        throw error;
      }

      // Remove from local state
      setRecordings(prev => prev.filter(r => r.id !== recordingId));

      toast({
        title: "Recording deleted",
        description: "The recording and all associated workflows have been removed.",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error deleting recording",
        description: error.message || "Could not delete the recording.",
        variant: "destructive",
      });
    }
  };

  const analyzeRecording = async (recordingId: string) => {
    try {
      toast({
        title: "Starting analysis",
        description: "Your video is being analyzed by AI...",
      });

      const { data, error } = await supabase.functions.invoke('analyze-recording', {
        body: { recordingId }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Analysis started",
        description: `Analyzing video... (${data.stepsCount} steps detected)`,
      });

      // Reload recordings to get updated analysis status
      await loadRecordings();

      return data;
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error.message || "Could not analyze the recording.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    recordings,
    isLoading,
    uploadRecording,
    deleteRecording,
    analyzeRecording,
    loadRecordings
  };
}