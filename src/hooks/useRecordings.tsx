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
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `recordings/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('content-library')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('content-library')
        .getPublicUrl(filePath);

      // Create recording record
      const { data: recording, error: dbError } = await supabase
        .from('screen_recordings')
        .insert([{
          title: metadata.title,
          description: metadata.description,
          file_url: urlData.publicUrl,
          file_size: file.size,
          raw_data: { 
            original_filename: file.name,
            file_type: file.type,
            uploaded_at: new Date().toISOString()
          },
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
      
      // Delete file from storage if it exists
      if (recording?.file_url) {
        const filePath = recording.file_url.split('/').pop();
        if (filePath) {
          await supabase.storage
            .from('content-library')
            .remove([`recordings/${filePath}`]);
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

  return {
    recordings,
    isLoading,
    uploadRecording,
    deleteRecording,
    loadRecordings
  };
}