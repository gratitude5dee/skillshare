import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";
import { GoogleAIFileManager } from "https://esm.sh/@google/generative-ai@0.21.0/server";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Coordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WorkflowStep {
  stepNumber: number;
  timestampMs: number;
  actionType: string;
  actionDescription: string;
  targetElement: string;
  coordinates: Coordinates | null;
  confidenceScore: number;
  frameAnalysis?: string;
}

interface VideoAnalysisResult {
  totalDurationMs: number;
  framesAnalyzed: number;
  complexityScore: number;
  workflowSummary: string;
  detectedUIElements?: number;
  steps: WorkflowStep[];
}

// Validation function for analysis results
function validateAnalysisResult(data: any): VideoAnalysisResult {
  // Validate required top-level fields
  if (!data.totalDurationMs || typeof data.totalDurationMs !== 'number') {
    throw new Error('Missing or invalid totalDurationMs');
  }
  
  if (typeof data.framesAnalyzed !== 'number') {
    throw new Error('Missing or invalid framesAnalyzed');
  }
  
  if (typeof data.complexityScore !== 'number' || data.complexityScore < 0 || data.complexityScore > 1) {
    throw new Error('complexityScore must be between 0.0 and 1.0');
  }
  
  if (!data.workflowSummary || typeof data.workflowSummary !== 'string') {
    throw new Error('Missing or invalid workflowSummary');
  }
  
  if (!Array.isArray(data.steps) || data.steps.length === 0) {
    throw new Error('Missing or invalid steps array - at least one step is required');
  }
  
  // Validate each step
  data.steps.forEach((step: any, idx: number) => {
    if (!step.stepNumber || typeof step.stepNumber !== 'number') {
      throw new Error(`Step ${idx}: missing or invalid stepNumber`);
    }
    
    if (!step.timestampMs || typeof step.timestampMs !== 'number') {
      throw new Error(`Step ${idx}: missing or invalid timestampMs`);
    }
    
    if (!step.actionType || typeof step.actionType !== 'string') {
      throw new Error(`Step ${idx}: missing or invalid actionType`);
    }
    
    if (!step.actionDescription || typeof step.actionDescription !== 'string') {
      throw new Error(`Step ${idx}: missing or invalid actionDescription`);
    }
    
    if (!step.targetElement || typeof step.targetElement !== 'string') {
      throw new Error(`Step ${idx}: missing or invalid targetElement`);
    }
    
    if (typeof step.confidenceScore !== 'number' || step.confidenceScore < 0 || step.confidenceScore > 1) {
      throw new Error(`Step ${idx}: confidenceScore must be between 0.0 and 1.0`);
    }
    
    // Validate coordinates if present
    if (step.coordinates !== null && step.coordinates !== undefined) {
      if (
        typeof step.coordinates.x !== 'number' ||
        typeof step.coordinates.y !== 'number' ||
        typeof step.coordinates.width !== 'number' ||
        typeof step.coordinates.height !== 'number'
      ) {
        console.warn(`Step ${idx}: Invalid coordinates structure, setting to null`);
        step.coordinates = null;
      }
    }
  });
  
  return data as VideoAnalysisResult;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Extract JWT token from Authorization header
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      console.error('[Analysis] Missing Authorization header');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'UNAUTHORIZED',
          message: 'Authentication required. Please sign in.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the JWT and get user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader);
    
    if (authError || !user) {
      console.error('[Analysis] Authentication failed:', authError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Invalid or expired authentication token. Please sign in again.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    const { recordingId } = await req.json();

    if (!recordingId) {
      throw new Error('Recording ID is required');
    }

    console.log(`[Analysis] Starting analysis for recording: ${recordingId}`);

    // Check user quota
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('api_quota_remaining, subscription_tier')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Failed to fetch user profile');
    }

    if (profile.api_quota_remaining <= 0) {
      console.error('[Analysis] Quota exceeded for user:', user.id);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'QUOTA_EXCEEDED',
          message: 'Monthly analysis quota exceeded. Please upgrade your plan or wait for quota reset.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429,
        }
      );
    }

    console.log(`[Analysis] User has ${profile.api_quota_remaining} analyses remaining`);

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

    // Convert video to base64 for inline embedding
    console.log('[Analysis] Converting video to base64...');
    const arrayBuffer = await videoData.arrayBuffer();
    const base64Video = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    console.log('[Analysis] Video prepared for analysis');

    const analysisPrompt = `You are an expert at analyzing screen recordings to extract detailed workflow automation steps.

Analyze this screen recording video frame-by-frame at 1 FPS.

For EACH significant user action detected, provide:

1.  **stepNumber**: Sequential number (1, 2, 3...)
2.  **timestampMs**: Exact timestamp in milliseconds when action occurred
3.  **actionType**: One of: 'CLICK', 'DOUBLE_CLICK', 'RIGHT_CLICK', 'TYPE_TEXT', 'NAVIGATE_URL', 'SCROLL', 'SELECT_OPTION', 'DRAG', 'HOVER', 'KEY_PRESS'
4.  **actionDescription**: Clear, detailed description of what the user did (e.g., "Clicked the 'Start Recording' button")
5.  **targetElement**: Description of the UI element (e.g., "Blue button labeled 'Start Recording'")
6.  **coordinates**: If visible, provide {x, y, width, height} in pixels from top-left. Use null if not applicable.
7.  **confidenceScore**: Your confidence in this detection (0.0 to 1.0)
8.  **frameAnalysis**: Brief description of what's visible in the frame at this moment

Also provide overall metrics:
-   **totalDurationMs**: Total video length in milliseconds
-   **framesAnalyzed**: Total frames you examined
-   **complexityScore**: 0.0 to 1.0 rating of workflow complexity
-   **detectedUIElements**: Count of unique UI elements you identified
-   **workflowSummary**: 2-3 sentence summary of the overall workflow

CRITICAL REQUIREMENTS:
-   Detect EVERY interaction.
-   Be extremely precise with timestamps.
-   Provide actionable descriptions suitable for automation.
-   Maintain high confidence scores only for clear actions.

You MUST respond with ONLY a valid JSON object that strictly adheres to the following schema:

{
  "totalDurationMs": 120000,
  "framesAnalyzed": 120,
  "complexityScore": 0.65,
  "detectedUIElements": 15,
  "workflowSummary": "User navigated through the automation interface, created a new workflow, and configured multiple steps including API calls and data transformations.",
  "steps": [
    {
      "stepNumber": 1,
      "timestampMs": 3000,
      "actionType": "CLICK",
      "actionDescription": "Clicked on the 'Automation' navigation menu item to access the automation dashboard",
      "targetElement": "Navigation menu button labeled 'Automation' in the left sidebar",
      "coordinates": { "x": 27, "y": 224, "width": 120, "height": 40 },
      "confidenceScore": 0.95,
      "frameAnalysis": "Dashboard view with left navigation bar visible, user cursor hovering over automation menu item"
    },
    {
      "stepNumber": 2,
      "timestampMs": 7500,
      "actionType": "TYPE_TEXT",
      "actionDescription": "Typed 'Daily Report Automation' into the workflow name input field",
      "targetElement": "Text input field with placeholder 'Enter workflow name'",
      "coordinates": null,
      "confidenceScore": 0.88,
      "frameAnalysis": "Create workflow dialog open with input field focused and text being entered"
    }
  ]
}

Do not include any other text, markdown formatting, or explanations outside the JSON object.`;

    console.log('[Analysis] Analyzing video with Gemini API...');

    // Send to Gemini using inline base64 data
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: recording.mime_type || "video/webm",
          data: base64Video,
        },
      },
      { text: analysisPrompt },
    ]);

    const response = await result.response;
    const analysisText = response.text();
    
    console.log('[Analysis] Received response from Gemini');

    // Parse and validate the JSON response
    let analysisResult: VideoAnalysisResult;
    try {
      // Aggressive markdown and text cleanup
      const cleanedText = analysisText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .replace(/^[^{]*/, '') // Remove text before first {
        .replace(/[^}]*$/, '') // Remove text after last }
        .trim();
      
      console.log('[Analysis] Parsing cleaned JSON response...');
      const rawResult = JSON.parse(cleanedText);
      
      // Validate schema
      console.log('[Analysis] Validating analysis result schema...');
      analysisResult = validateAnalysisResult(rawResult);
      
      console.log(`[Analysis] Successfully validated ${analysisResult.steps.length} workflow steps`);
      
    } catch (parseError) {
      console.error('[Analysis] Failed to parse or validate JSON response');
      console.error('[Analysis] Raw response:', analysisText);
      
      if (parseError instanceof Error) {
        console.error('[Analysis] Error details:', parseError.message);
        throw new Error(`AI response validation failed: ${parseError.message}. The model may need to re-analyze this video.`);
      }
      
      throw new Error('Failed to parse AI response: Unknown error occurred');
    }

    console.log(`[Analysis] Successfully extracted and validated ${analysisResult.steps.length} workflow steps`);
    console.log(`[Analysis] Complexity score: ${analysisResult.complexityScore.toFixed(2)}, Frames analyzed: ${analysisResult.framesAnalyzed}`);

    // Decrement user quota
    const { error: quotaError } = await supabaseClient.rpc('decrement_user_quota', {
      user_uuid: user.id
    });

    if (quotaError) {
      console.error('[Analysis] Failed to decrement quota:', quotaError);
    }

    // Log API usage
    const startTime = Date.now();
    const processingTime = Date.now() - startTime;

    await supabaseClient
      .from('api_usage_logs')
      .insert({
        user_id: user.id,
        recording_id: recordingId,
        action: 'analyze_recording',
        response_time_ms: processingTime,
        metadata: {
          steps_extracted: analysisResult.steps.length,
          frames_analyzed: analysisResult.framesAnalyzed,
          complexity_score: analysisResult.complexityScore
        }
      });

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
**Duration:** ${(analysisResult.totalDurationMs / 1000).toFixed(1)}s

---

## 📊 Analysis Summary

${analysisResult.workflowSummary}

### Metrics

| Metric | Value |
|--------|-------|
| **Total Duration** | ${(analysisResult.totalDurationMs / 1000).toFixed(1)} seconds |
| **Frames Analyzed** | ${analysisResult.framesAnalyzed} |
| **Complexity Score** | ${(analysisResult.complexityScore * 100).toFixed(1)}% |
| **UI Elements Detected** | ${analysisResult.detectedUIElements || 'N/A'} |
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
