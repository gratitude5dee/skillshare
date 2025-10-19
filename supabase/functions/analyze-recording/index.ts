import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STORAGE_THRESHOLD = 20_000_000; // 20MB in bytes

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { recordingId } = await req.json();

    if (!recordingId) {
      return new Response(
        JSON.stringify({ error: 'recordingId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Analysis] Starting analysis for recording: ${recordingId}`);

    // Fetch recording metadata
    const { data: recording, error: recordingError } = await supabase
      .from('screen_recordings')
      .select('*')
      .eq('id', recordingId)
      .single();

    if (recordingError || !recording) {
      console.error('[Analysis] Recording not found:', recordingError);
      return new Response(
        JSON.stringify({ error: 'Recording not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create analysis record
    const { data: analysis, error: analysisError } = await supabase
      .from('video_analyses')
      .insert({
        recording_id: recordingId,
        status: 'processing'
      })
      .select()
      .single();

    if (analysisError) {
      console.error('[Analysis] Failed to create analysis record:', analysisError);
      throw analysisError;
    }

    console.log(`[Analysis] Created analysis record: ${analysis.id}`);

    // Download video based on storage type
    let videoData: Blob;
    
    if (recording.storage_type === 'supabase' && recording.file_url) {
      // Download from Supabase Storage (>20MB files)
      const storagePath = recording.file_url.split('/').slice(-2).join('/');
      console.log(`[Analysis] Downloading from storage: ${storagePath}`);
      
      const { data, error } = await supabase.storage
        .from('recordings')
        .download(storagePath);
      
      if (error || !data) {
        throw new Error(`Failed to download video: ${error?.message}`);
      }
      videoData = data;
    } else if (recording.storage_type === 'local' && recording.raw_data?.video_data) {
      // Retrieve inline data (≤20MB files)
      console.log(`[Analysis] Using inline video data`);
      const base64Data = recording.raw_data.video_data;
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      videoData = new Blob([binaryData], { type: recording.mime_type || 'video/webm' });
    } else {
      throw new Error('Invalid storage configuration - no valid video data source');
    }

    console.log(`[Analysis] Downloaded video: ${videoData.size} bytes`);

    // Convert Blob to base64 for Gemini
    const arrayBuffer = await videoData.arrayBuffer();
    const base64Video = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    // Analyze with Lovable AI (Gemini)
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const analysisPrompt = `
You are an expert at analyzing screen recordings to extract detailed workflow automation steps.

Analyze this screen recording video frame-by-frame at 1 FPS.

For EACH significant user action detected, provide:

1. **stepNumber**: Sequential number (1, 2, 3...)
2. **timestampMs**: Exact timestamp in milliseconds when action occurred
3. **actionType**: One of: click, doubleClick, rightClick, type, navigate, scroll, select, drag, hover, keyPress
4. **actionDescription**: Clear, detailed description of what the user did
5. **targetElement**: Description of the UI element
6. **coordinates**: If visible, provide {x, y, width, height} in pixels
7. **confidenceScore**: Your confidence in this detection (0.0 to 1.0)
8. **frameAnalysis**: Brief description of what's visible

Also provide overall metrics:
- **totalDuration**: Total video length in seconds
- **framesAnalyzed**: Total frames examined
- **complexityScore**: 0.0 to 1.0 rating of workflow complexity
- **detectedUIElements**: Count of unique UI elements identified
- **workflowSummary**: 2-3 sentence summary

Return ONLY valid JSON in this format:
{
  "totalDuration": 120,
  "framesAnalyzed": 120,
  "complexityScore": 0.65,
  "detectedUIElements": 15,
  "workflowSummary": "User navigated to automation hub...",
  "steps": [
    {
      "stepNumber": 1,
      "timestampMs": 3000,
      "actionType": "click",
      "actionDescription": "Clicked on menu item",
      "targetElement": "Navigation menu item",
      "coordinates": { "x": 27, "y": 224, "width": 120, "height": 40 },
      "confidenceScore": 0.95,
      "frameAnalysis": "Dashboard view visible"
    }
  ]
}`;

    console.log('[Analysis] Sending to Lovable AI...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: analysisPrompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${recording.mime_type || 'video/webm'};base64,${base64Video}`
                }
              }
            ]
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[Analysis] AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI credits exhausted. Please add funds to your workspace.');
      }
      throw new Error(`AI analysis failed: ${errorText}`);
    }

    const aiResult = await aiResponse.json();
    const responseText = aiResult.choices?.[0]?.message?.content;

    if (!responseText) {
      throw new Error('No response from AI');
    }

    console.log('[Analysis] AI response received, parsing...');

    // Parse JSON response
    let analysisData;
    try {
      // Handle markdown code blocks
      let jsonText = responseText;
      if (responseText.includes('```json')) {
        jsonText = responseText.split('```json')[1].split('```')[0].trim();
      } else if (responseText.includes('```')) {
        jsonText = responseText.split('```')[1].split('```')[0].trim();
      }
      analysisData = JSON.parse(jsonText);
    } catch (e) {
      console.error('[Analysis] Failed to parse AI response:', e);
      throw new Error('Failed to parse AI response');
    }

    console.log(`[Analysis] Extracted ${analysisData.steps?.length || 0} steps`);

    // Save workflow steps
    if (analysisData.steps && analysisData.steps.length > 0) {
      const steps = analysisData.steps.map((step: any) => ({
        analysis_id: analysis.id,
        step_number: step.stepNumber,
        timestamp_ms: step.timestampMs,
        action_type: step.actionType,
        action_description: step.actionDescription,
        target_element: step.targetElement,
        coordinates: step.coordinates,
        confidence_score: step.confidenceScore,
        metadata: {
          frameAnalysis: step.frameAnalysis
        }
      }));

      const { error: stepsError } = await supabase
        .from('workflow_steps')
        .insert(steps);

      if (stepsError) {
        console.error('[Analysis] Failed to save steps:', stepsError);
        throw stepsError;
      }
    }

    // Generate markdown
    const markdown = generateMarkdown(analysisData, recording);
    const markdownPath = `${recording.user_id}/${recordingId}/videounderstanding.md`;
    
    const { error: markdownError } = await supabase.storage
      .from('analysis-artifacts')
      .upload(markdownPath, markdown, {
        contentType: 'text/markdown',
        upsert: true
      });

    if (markdownError) {
      console.warn('[Analysis] Failed to save markdown:', markdownError);
    }

    // Update analysis record
    const { error: updateError } = await supabase
      .from('video_analyses')
      .update({
        total_frames: analysisData.framesAnalyzed,
        frames_analyzed: analysisData.framesAnalyzed,
        complexity_score: analysisData.complexityScore,
        markdown_path: markdownPath,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', analysis.id);

    if (updateError) {
      console.error('[Analysis] Failed to update analysis:', updateError);
      throw updateError;
    }

    console.log('[Analysis] Analysis completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        analysisId: analysis.id,
        stepsCount: analysisData.steps?.length || 0,
        markdownPath
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Analysis] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
    const errorDetails = error instanceof Error ? error.toString() : String(error);
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: errorDetails
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper function to generate markdown
function generateMarkdown(result: any, recording: any): string {
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return `# Video Workflow Analysis Report

## 📊 Metadata

| Property | Value |
|----------|-------|
| **Recording ID** | \`${recording.id}\` |
| **Title** | ${recording.title || 'Untitled'} |
| **Analysis Date** | ${new Date().toISOString()} |
| **Total Duration** | ${result.totalDuration}s |
| **Frames Analyzed** | ${result.framesAnalyzed} frames @ 1 FPS |
| **Complexity Score** | ${(result.complexityScore * 100).toFixed(0)}% |

---

## 📝 Executive Summary

${result.workflowSummary}

### Key Metrics

- **Total Actions Detected**: ${result.steps?.length || 0}
- **UI Elements Identified**: ${result.detectedUIElements}
- **Average Confidence**: ${result.steps?.length ? (result.steps.reduce((sum: number, s: any) => sum + s.confidenceScore, 0) / result.steps.length * 100).toFixed(1) : 0}%

---

## 🔄 Workflow Steps

${result.steps?.map((step: any) => `
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
`).join('\n') || 'No steps detected'}

---

*Generated by SkillShare Automation Hub - Powered by Gemini AI*
`;
}
