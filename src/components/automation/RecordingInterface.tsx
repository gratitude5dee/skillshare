import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Trash2, PlayCircle, StopCircle, Download, CheckCircle, Loader, Video, FileText, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function RecordingInterface() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingState, setProcessingState] = useState<'idle' | 'uploading' | 'analyzing' | 'complete'>('idle');
  const [videoAnalysis, setVideoAnalysis] = useState<any>(null);
  const [extractedSteps, setExtractedSteps] = useState<any[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);


  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' } as any,
        audio: true
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedVideo({
          blob,
          url: URL.createObjectURL(blob),
          size: blob.size,
          timestamp: new Date().toISOString()
        });
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording failed:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const processVideoWithGemini = async () => {
    if (!recordedVideo) return;
    
    setProcessingState('uploading');
    
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    try {
      // First upload the recording
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      // Always use Supabase Storage to avoid database timeouts
      const fileSize = recordedVideo.size;
      const fileName = `${user.id}/${Date.now()}.webm`;
      
      console.log(`[Upload] Uploading ${(fileSize / 1024 / 1024).toFixed(2)}MB to storage...`);
      
      const { data, error: storageError } = await supabase.storage
        .from('screen-recordings')
        .upload(fileName, recordedVideo.blob, {
          contentType: 'video/webm',
          cacheControl: '3600'
        });

      if (storageError) {
        console.error('[Upload] Storage error:', storageError);
        throw new Error(`Failed to upload video: ${storageError.message}`);
      }
      
      console.log('[Upload] File uploaded successfully:', fileName);

      // Insert recording into database
      const { data: recording, error: insertError } = await supabase
        .from('screen_recordings')
        .insert({
          user_id: user.id,
          title: 'Screen Recording',
          description: 'Automated workflow capture',
          file_url: fileName,
          file_name: `recording-${Date.now()}.webm`,
          file_size: fileSize,
          mime_type: 'video/webm',
          storage_type: 'supabase',
          analysis_status: 'pending'
        })
        .select()
        .single();

      if (insertError) {
        console.error('[Upload] Database insert error:', insertError);
        throw new Error(`Failed to create recording: ${insertError.message}`);
      }
      
      if (!recording) {
        throw new Error('Failed to create recording: No data returned');
      }
      
      console.log('[Upload] Recording created in database:', recording.id);

      clearInterval(uploadInterval);
      setUploadProgress(100);
      setProcessingState('analyzing');

      // Call the analyze-recording edge function
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-recording', {
        body: { recordingId: recording.id }
      });

      if (analysisError) throw analysisError;

      // Fetch the updated recording with analysis results
      const { data: updatedRecording, error: fetchError } = await supabase
        .from('screen_recordings')
        .select('*')
        .eq('id', recording.id)
        .single();

      if (fetchError || !updatedRecording) throw fetchError || new Error('Failed to fetch analysis');

      const analysis = updatedRecording.analysis_data as any;
      
      setVideoAnalysis({
        duration: analysis.totalDuration,
        framesAnalyzed: analysis.framesAnalyzed,
        steps: analysis.steps,
        insights: {
          totalActions: analysis.steps.length,
          averageStepDuration: analysis.totalDuration / analysis.steps.length,
          complexity: analysis.complexityScore > 0.7 ? 'High' : analysis.complexityScore > 0.4 ? 'Medium' : 'Low',
          uiElements: analysis.detectedUIElements
        }
      });
      
      setExtractedSteps(analysis.steps.map((step: any, idx: number) => ({
        id: idx + 1,
        timestamp: formatTime(step.timestampMs),
        action: step.actionDescription,
        confidence: step.confidenceScore
      })));
      
      setProcessingState('complete');
    } catch (error) {
      console.error('Processing error:', error);
      clearInterval(uploadInterval);
      setProcessingState('idle');
      setUploadProgress(0);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to process video: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`);
    }
  };

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRecordedVideo({
        blob: file,
        url: URL.createObjectURL(file),
        size: file.size,
        timestamp: new Date().toISOString()
      });
    }
  };

  const deleteRecording = () => {
    if (recordedVideo?.url) {
      URL.revokeObjectURL(recordedVideo.url);
    }
    setRecordedVideo(null);
    setProcessingState('idle');
    setUploadProgress(0);
    setVideoAnalysis(null);
    setExtractedSteps([]);
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-full p-6">
      <div className="col-span-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="text-primary" size={24} />
              Screen Recording
            </CardTitle>
            <CardDescription>Capture your workflow to create automation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isRecording && (
              <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 rounded-lg w-fit">
                <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                <span className="font-mono text-destructive font-semibold">{formatTime(recordingTime)}</span>
              </div>
            )}

            {!recordedVideo ? (
              <div className="space-y-4">
                <div className="bg-muted rounded-lg border-2 border-dashed border-border p-12 text-center">
                  <Camera className="mx-auto text-muted-foreground mb-4" size={64} />
                  <p className="text-foreground font-medium mb-2">
                    {isRecording ? 'Recording in progress...' : 'Ready to record'}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {isRecording ? 'Click stop when you\'re finished' : 'Click start to begin capturing your screen'}
                  </p>
                </div>

                <div className="flex gap-3">
                  {!isRecording ? (
                    <>
                      <Button onClick={startRecording} className="flex-1 gap-2">
                        <Camera size={20} />
                        Start Recording
                      </Button>
                      <Button variant="outline" className="flex-1 gap-2" asChild>
                        <label className="cursor-pointer">
                          <Upload size={20} />
                          Upload Video
                          <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
                        </label>
                      </Button>
                    </>
                  ) : (
                    <Button onClick={stopRecording} variant="destructive" className="w-full gap-2">
                      <StopCircle size={20} />
                      Stop Recording
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-black rounded-lg overflow-hidden">
                  <video src={recordedVideo.url} controls className="w-full" style={{ maxHeight: '400px' }} />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Video className="text-primary" size={20} />
                    <div>
                      <p className="font-medium text-foreground">Recording captured</p>
                      <p className="text-sm text-muted-foreground">
                        {(recordedVideo.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button onClick={deleteRecording} variant="ghost" size="icon" className="text-destructive">
                    <Trash2 size={20} />
                  </Button>
                </div>

                {processingState === 'idle' && (
                  <Button onClick={processVideoWithGemini} className="w-full gap-2">
                    <Sparkles size={20} />
                    Process with Gemini AI
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {processingState !== 'idle' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader className="animate-spin text-primary" size={20} />
                Processing Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {processingState === 'uploading' && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Uploading...</span>
                    <span className="font-semibold text-primary">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {processingState === 'analyzing' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Loader className="animate-spin text-primary" size={16} />
                    <span>Analyzing frames with Gemini AI...</span>
                  </div>
                </div>
              )}

              {processingState === 'complete' && videoAnalysis && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <CheckCircle size={20} />
                    Processing Complete
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="text-lg font-bold text-foreground">{videoAnalysis.duration}s</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Frames</p>
                      <p className="text-lg font-bold text-foreground">{videoAnalysis.framesAnalyzed}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Steps</p>
                      <p className="text-lg font-bold text-foreground">{videoAnalysis.insights.totalActions}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Complexity</p>
                      <p className="text-lg font-bold text-foreground">{videoAnalysis.insights.complexity}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {extractedSteps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="text-primary" size={20} />
                Extracted Workflow Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {extractedSteps.map((step, idx) => (
                  <div key={step.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors border border-border">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{step.action}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground font-mono">{step.timestamp}</span>
                        <span className="text-xs text-green-600 font-medium">
                          {(step.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="col-span-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" size={20} />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                <span className="text-muted-foreground">Record or upload your workflow video</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                <span className="text-muted-foreground">AI analyzes every frame for actions</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                <span className="text-muted-foreground">Steps are extracted and documented</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
                <span className="text-muted-foreground">Create automation from workflow</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="text-green-600 flex-shrink-0" size={16} />
              <p className="text-muted-foreground">Videos are stored securely for processing</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
