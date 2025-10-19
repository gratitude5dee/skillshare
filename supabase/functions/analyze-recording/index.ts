import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";
import { GoogleAIFileManager } from "https://esm.sh/@google/generative-ai@0.21.0/server";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VideoAnalysisResult {
  totalDuration: number;
  framesAnalyzed: number;
  complexityScore: number;
  detectedUIElements: number;
  workflowSummary: string;
  steps: Array<{
    stepNumber: number;
    timestampMs: number;
    actionType: string;
    actionDescription: string;
    targetElement: string;
    coordinates?: { x: number; y: number; width: number; height: number };
    confidenceScore: number;
    frameAnalysis: string;
  }>;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { recordingId } = await req.json();

    if (!recordingId) {
      throw new Error('Recording ID is required');
    }

    console.log(`[Analysis] Starting analysis for recording: ${recordingId}`);

    // Update status to analyzing
    await supabaseClient
      .from('screen_recordings')
      .update({ 
        analysis_status: 'analyzing',
        updated_at: new Date().toISOString()
      })
      .eq('id', recordingId);

    // Fetch recording data
    const { data: recording, error: fetchError } = await supabaseClient
      .from('screen_recordings')
      .select('*')
      .eq('id', recordingId)
      .single();

    if (fetchError || !recording) {
      throw new Error('Recording not found');
    }

    console.log(`[Analysis] Recording found: ${recording.title}`);

    // Download video data
    let videoData: Blob;
    
    if (recording.storage_type === 'supabase' && recording.file_url) {
      // Download from Supabase Storage
      console.log(`[Analysis] Downloading from storage: ${recording.file_url}`);
      const { data, error } = await supabaseClient.storage
        .from('screen-recordings')
        .download(recording.file_url);

      if (error) {
        throw new Error(`Failed to download video: ${error.message}`);
      }
      videoData = data;
    } else if (recording.storage_type === 'local' && recording.raw_data?.video_data) {
      // Use inline video data for small files (<20MB)
      console.log(`[Analysis] Using inline video data`);
      const base64Data = recording.raw_data.video_data;
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      videoData = new Blob([binaryData], { type: recording.mime_type || 'video/webm' });
    } else {
      throw new Error('No valid video data source found');
    }

    console.log(`[Analysis] Video loaded: ${videoData.size} bytes`);

    // Initialize Gemini API
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    if (!GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const fileManager = new GoogleAIFileManager(GOOGLE_API_KEY);
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    // Save video to temporary file
    const tempFilePath = await Deno.makeTempFile({ suffix: ".webm" });
    const arrayBuffer = await videoData.arrayBuffer();
    await Deno.writeFile(tempFilePath, new Uint8Array(arrayBuffer));
    
    console.log('[Analysis] Uploading video to Gemini File API...');

    // Upload video to Gemini File API
    const uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType: recording.mime_type || "video/webm",
      displayName: recording.file_name || `recording-${recordingId}`,
    });

    console.log(`[Analysis] File uploaded to Gemini: ${uploadResult.file.uri}`);

    const analysisPrompt = `You are an expert at analyzing screen recordings to extract detailed workflow automation steps.

Analyze this screen recording video carefully. Process it at 1 FPS to capture all user interactions.

For EACH significant user action detected, provide:

1. **stepNumber**: Sequential number (1, 2, 3...)
2. **timestampMs**: Exact timestamp in milliseconds when action occurred
3. **actionType**: One of: click, doubleClick, rightClick, type, navigate, scroll, select, drag, hover, keyPress
4. **actionDescription**: Clear, detailed description of what the user did
5. **targetElement**: Description of the UI element interacted with
6. **coordinates**: If visible, provide {x, y, width, height} in pixels
7. **confidenceScore**: Your confidence in this detection (0.0 to 1.0)
8. **frameAnalysis**: Brief description of what's visible in the frame

Also provide overall metrics:
- **totalDuration**: Total video length in seconds
- **framesAnalyzed**: Total frames examined
- **complexityScore**: 0.0 to 1.0 rating of workflow complexity
- **detectedUIElements**: Count of unique UI elements identified
- **workflowSummary**: 2-3 sentence summary of the workflow

Return ONLY valid JSON in this exact format:
{
  "totalDuration": 120,
  "framesAnalyzed": 120,
  "complexityScore": 0.65,
  "detectedUIElements": 15,
  "workflowSummary": "User navigated through the automation interface...",
  "steps": [
    {
      "stepNumber": 1,
      "timestampMs": 3000,
      "actionType": "click",
      "actionDescription": "Clicked on the navigation menu",
      "targetElement": "Menu button in top navigation",
      "coordinates": { "x": 27, "y": 224, "width": 120, "height": 40 },
      "confidenceScore": 0.95,
      "frameAnalysis": "Dashboard view with navigation bar visible"
    }
  ]
}`;

    console.log('[Analysis] Analyzing video with Gemini API...');

    // Send to Gemini using file URI (avoids memory issues with base64)
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResult.file.mimeType,
          fileUri: uploadResult.file.uri,
        },
      },
      { text: analysisPrompt },
    ]);

    const response = await result.response;
    const analysisText = response.text();
    
    console.log('[Analysis] Received response from Gemini');

    // Parse the JSON response
    let analysisResult: VideoAnalysisResult;
    try {
      // Remove markdown code blocks if present
      const cleanedText = analysisText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      analysisResult = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('[Analysis] Failed to parse JSON:', analysisText);
      const errorMsg = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
      throw new Error(`Failed to parse AI response: ${errorMsg}`);
    }

    // Validate the analysis result
    if (!analysisResult.steps || !Array.isArray(analysisResult.steps)) {
      throw new Error('Invalid analysis result: missing steps array');
    }

    console.log(`[Analysis] Extracted ${analysisResult.steps.length} workflow steps`);

    // Generate comprehensive markdown report
    const formatTime = (ms: number): string => {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const markdownReport = `# 🎬 Workflow Analysis Report

**Recording:** ${recording.title}  
**Analyzed:** ${new Date().toLocaleString()}  
**Duration:** ${analysisResult.totalDuration}s  

---

## 📊 Analysis Summary

${analysisResult.workflowSummary}

### Metrics

| Metric | Value |
|--------|-------|
| **Total Duration** | ${analysisResult.totalDuration} seconds |
| **Frames Analyzed** | ${analysisResult.framesAnalyzed} |
| **Complexity Score** | ${(analysisResult.complexityScore * 100).toFixed(1)}% |
| **UI Elements Detected** | ${analysisResult.detectedUIElements} |
| **Total Steps** | ${analysisResult.steps.length} |
| **Average Confidence** | ${analysisResult.steps.length > 0 ? (analysisResult.steps.reduce((sum, s) => sum + s.confidenceScore, 0) / analysisResult.steps.length * 100).toFixed(1) : 0}% |

---

## 🔄 Workflow Steps

${analysisResult.steps.map((step) => `
### Step ${step.stepNumber}: ${step.actionDescription}

| Attribute | Value |
|-----------|-------|
| **Timestamp** | ${formatTime(step.timestampMs)} |
| **Action Type** | \`${step.actionType}\` |
| **Target Element** | ${step.targetElement} |
| **Confidence** | ${(step.confidenceScore * 100).toFixed(1)}% |
${step.coordinates ? `| **Position** | X: ${step.coordinates.x}px, Y: ${step.coordinates.y}px |` : ''}

${step.frameAnalysis ? `**Frame Context**: ${step.frameAnalysis}\n` : ''}

---
`).join('\n')}

---

*Generated by SkillShare Automation Hub - Powered by Gemini 2.0 Flash*
`;

    // Update database with analysis results
    const { error: updateError } = await supabaseClient
      .from('screen_recordings')
      .update({
        analysis_status: 'completed',
        analyzed_at: new Date().toISOString(),
        analysis_data: analysisResult,
        analysis_markdown: markdownReport,
        updated_at: new Date().toISOString()
      })
      .eq('id', recordingId);

    if (updateError) {
      throw new Error(`Failed to update recording: ${updateError.message}`);
    }

    console.log('[Analysis] Analysis completed successfully');

    // Cleanup: Delete temp file and Gemini file
    try {
      await Deno.remove(tempFilePath);
      console.log('[Analysis] Temporary file deleted');
    } catch (cleanupError) {
      console.warn('[Analysis] Failed to delete temp file:', cleanupError);
    }

    try {
      await fileManager.deleteFile(uploadResult.file.name);
      console.log('[Analysis] Gemini file deleted');
    } catch (cleanupError) {
      console.warn('[Analysis] Failed to delete Gemini file:', cleanupError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        recordingId,
        analysis: analysisResult,
        markdown: markdownReport,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('[Analysis] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Check for specific error types
    let userFriendlyMessage = errorMessage;
    if (errorMessage.includes('Memory limit')) {
      userFriendlyMessage = 'Video file is too large to process. Please try a shorter recording.';
    } else if (errorMessage.includes('timeout')) {
      userFriendlyMessage = 'Analysis timed out. Please try a shorter recording or reduce video quality.';
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: userFriendlyMessage,
        details: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
