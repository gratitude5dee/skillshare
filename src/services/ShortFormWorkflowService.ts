import { supabase } from '@/integrations/supabase/client';
import { ManusAPIService } from './ManusAPIService';

export interface WorkflowStartParams {
  source_url: string;
  platform: string;
  artist_name?: string;
  smart_link?: string;
  release_date?: string;
  priority_regions?: string[];
  themes?: string[];
}

export interface WorkflowResult {
  success: boolean;
  musicItemId?: string;
  error?: string;
}

export class ShortFormWorkflowService {
  
  static async startWorkflow(params: WorkflowStartParams): Promise<WorkflowResult> {
    try {
      // Step 1: Create initial music item record
      const { data: musicItem, error: insertError } = await supabase
        .from('music_items')
        .insert([{
          source_url: params.source_url,
          platform: params.platform,
          title: 'Processing...', // Will be updated after enrichment
          artists: params.artist_name ? [params.artist_name] : [],
          user_id: (await supabase.auth.getUser()).data.user?.id!,
          metadata: {
            smart_link: params.smart_link,
            release_date: params.release_date,
            priority_regions: params.priority_regions,
            themes: params.themes
          }
        }])
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to create music item: ${insertError.message}`);
      }

      // Step 2: Start C0 - Resolve & Enrich workflow
      await this.startEnrichmentWorkflow(musicItem.id, params);

      return {
        success: true,
        musicItemId: musicItem.id
      };
    } catch (error) {
      console.error('Error starting workflow:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async startEnrichmentWorkflow(musicItemId: string, params: WorkflowStartParams) {
    const prompt = `
C0) Resolve & Enrich - Music Content Analysis

Source URL: ${params.source_url}
Platform: ${params.platform}

Task Instructions:
Detect platform/type from source_url and extract comprehensive metadata:

For Spotify Track/Album:
- Scrape oEmbed + page HTML with Cloud Browser
- Extract: {title, artists[], album, cover_art_url, release_date, isrc, spotify_id}
- If SPOTIFY_TOKEN available, call audio-features for: {bpm, key, mode, energy, danceability, valence, duration}

For YouTube Video/Playlist:
- Fetch oEmbed + page HTML
- Extract: {title, channel, tags[], publish_date, thumb_url, video_id}
- If captions present, fetch them
- If playlist, collect top items for album mapping

Audio Analysis:
- If audio URL accessible, send segments to HuggingFace music-tagging
- Infer: {mood_tags, genre_tags, tempo_estimate, instrumentation}

Visual Analysis:
- Sample 5 dominant colors from cover art for design system palette

Data Storage:
- Save all extracted data to Supabase music_items table (ID: ${musicItemId})
- Update the existing record with enriched metadata

Additional Context:
${params.artist_name ? `Artist: ${params.artist_name}` : ''}
${params.smart_link ? `Smart Link: ${params.smart_link}` : ''}
${params.release_date ? `Release Date: ${params.release_date}` : ''}
${params.themes ? `Themes: ${params.themes.join(', ')}` : ''}
    `.trim();

    try {
      const task = await ManusAPIService.createTask(prompt, {
        mode: 'speed',
        connectors: ['Supabase', 'Firecrawl', 'HuggingFace']
      });

      // Update music item with task info
      await supabase
        .from('music_items')
        .update({
          metadata: {
            ...params,
            enrichment_task_id: task.id,
            workflow_status: 'enriching'
          }
        })
        .eq('id', musicItemId);

      // Start subsequent workflows after a delay
      setTimeout(() => {
        this.startTrendMiningWorkflow(musicItemId);
      }, 5000);

      return task;
    } catch (error) {
      console.error('Error starting enrichment workflow:', error);
      throw error;
    }
  }

  static async startTrendMiningWorkflow(musicItemId: string) {
    const prompt = `
C1) Trend Mine → Angle Bank - Daily Content Angle Generation

Music Item ID: ${musicItemId}

Task Instructions:
Mine current social media trends and generate content angles conditioned on the music:

1. Trend Research:
   - Analyze TikTok/YouTube/Instagram trend trackers
   - Study subreddits for emerging patterns
   - Identify: hooks, edit styles, durations, CTAs, filters, sound patterns

2. Music Conditioning:
   - Retrieve music metadata from Supabase (music_items table, ID: ${musicItemId})
   - Filter trends compatible with {bpm, mood, genre, instrumentation}
   - Calculate sound_fit score (0-100) for each trend

3. Generate 20 Content Angles:
   - Create angles with sound_fit ≥ 60
   - Include: hook, variant_hooks[3], visual_pattern, edit_style, duration_hint
   - Add: cta_type, example_links[], difficulty(1-5), notes
   - Set trend_source for attribution

4. Data Storage:
   - Save all angles to Supabase angle_bank table
   - Link each angle to music_item_id: ${musicItemId}

Focus on trends that complement the music's energy and can showcase the track effectively.
    `.trim();

    try {
      const task = await ManusAPIService.createTask(prompt, {
        mode: 'speed',
        connectors: ['Supabase', 'Firecrawl']
      });

      // Start content generation after trend mining
      setTimeout(() => {
        this.startContentGenerationWorkflow(musicItemId);
      }, 10000);

      return task;
    } catch (error) {
      console.error('Error starting trend mining workflow:', error);
      throw error;
    }
  }

  static async startContentGenerationWorkflow(musicItemId: string) {
    const prompt = `
C2) Scripts, Captions, CTAs - Content Queue Generation

Music Item ID: ${musicItemId}

Task Instructions:
Generate 7-day content calendar with beat-aligned scripts:

1. Angle Selection:
   - Query angle_bank for music_item_id: ${musicItemId}
   - Select 14 best angles (sound_fit ≥ 60)
   - Mix durations: 12-20s & 45-58s
   - Distribute across 7 days (2 per day)

2. For Each Selected Angle:
   - Generate script with beat-aligned moments using BPM data
   - Create 3 alternative hooks: lyric-led, behind-the-scenes, challenge/UGC
   - Design on-screen text with timestamps
   - Write captions with 15 relevant hashtags
   - Create CTA variants: stream link, pre-save, challenge hashtag
   - Plan assets: color palette from cover art, overlay types, thumbnail concepts

3. Content Queue Creation:
   - Save each piece to content_queue table
   - Link to music_item_id: ${musicItemId} and respective angle_id
   - Set status: 'ready'
   - Include: script, beats (JSON), caption, hashtags, cta, palette, thumb_prompt

4. Weekly Schedule:
   - Distribute content across next 7 days
   - Ensure variety in angles and formats
   - Optimize for platform-specific best practices

Generate comprehensive content ready for video production and social media publishing.
    `.trim();

    try {
      const task = await ManusAPIService.createTask(prompt, {
        mode: 'speed',
        connectors: ['Supabase']
      });

      // Start video generation after content scripts are ready
      setTimeout(() => {
        this.startVideoGenerationWorkflow(musicItemId);
      }, 15000);

      return task;
    } catch (error) {
      console.error('Error starting content generation workflow:', error);
      throw error;
    }
  }

  static async startVideoGenerationWorkflow(musicItemId: string) {
    const prompt = `
C3) Auto-Assembly of Videos - Beat-Synced Video Creation

Music Item ID: ${musicItemId}

Task Instructions:
Generate videos and thumbnails for all ready content:

1. Content Retrieval:
   - Query content_queue for music_item_id: ${musicItemId} where status='ready'
   - Get music metadata for audio source and BPM timing

2. Video Generation (for each content item):
   
   Audio Preparation:
   - YouTube: Extract audio from first 15-60s around the drop
   - Spotify: Use 30s preview or provided snippet URL
   
   Face-to-Camera Variant:
   - Use HeyGen avatar to speak the hook
   - Enable auto-captions
   - Apply color palette from cover art
   
   Montage Variant (default):
   - Use Invideo template with 8-10 b-roll clips
   - Apply beat-cuts synchronized to BPM
   - Add flash transitions on downbeats
   - Color-grade using cover art palette
   
   Lyrics Mode (if available):
   - Create kinetic typography for chorus lines
   - Sync text animations to beats
   - Apply visual effects matching music energy

3. Thumbnail Generation:
   - Create 3 thumbnail variants per video using Minimax
   - Use thumb_prompt + color palette
   - Add bold typography: {title | artist | OUT NOW}
   - Optimize for mobile viewing

4. Asset Management:
   - Save all generated content to content_assets table
   - Link to respective content_queue_id
   - Update content_queue.status to 'drafted'
   - Store file URLs and metadata

Generate professional-quality short-form videos optimized for viral potential.
    `.trim();

    try {
      const task = await ManusAPIService.createTask(prompt, {
        mode: 'speed',
        connectors: ['Supabase', 'HeyGen', 'Minimax']
      });

      // Start analytics workflow
      setTimeout(() => {
        this.startAnalyticsWorkflow(musicItemId);
      }, 20000);

      return task;
    } catch (error) {
      console.error('Error starting video generation workflow:', error);
      throw error;
    }
  }

  static async startAnalyticsWorkflow(musicItemId: string) {
    const prompt = `
C4) AB-Test & Feedback Loop - Performance Analytics

Music Item ID: ${musicItemId}

Task Instructions:
Set up performance tracking and optimization:

1. Performance Aggregation:
   - Track metrics by: angle family, retention, hook type, CTA type, colorway
   - Monitor: first-2s retention, completion rate, engagement quality
   - Analyze: lyric vs story vs challenge performance

2. Content Optimization:
   - Identify top 10% performing content
   - Promote successful content to evergreen status
   - Generate new variations of high-performers
   - Create alternate first 2 seconds for winning formats

3. Weekly Insights Generation:
   - Summarize performance patterns
   - Identify trending angles and formats
   - Recommend optimization strategies
   - Suggest next week's content focus

4. Data Storage:
   - Save insights to content_insights table
   - Link to music_item_id: ${musicItemId}
   - Include performance data and recommendations
   - Set up automated weekly reporting

5. Future Content Queue:
   - Auto-queue next week's angles based on performance
   - Adjust trend selection criteria
   - Optimize content parameters for better results

Establish ongoing optimization loop for sustained viral content creation.
    `.trim();

    try {
      const task = await ManusAPIService.createTask(prompt, {
        mode: 'speed',
        connectors: ['Supabase']
      });

      return task;
    } catch (error) {
      console.error('Error starting analytics workflow:', error);
      throw error;
    }
  }

  static async getWorkflowStatus(musicItemId: string) {
    try {
      const { data: musicItem, error } = await supabase
        .from('music_items')
        .select('*')
        .eq('id', musicItemId)
        .single();

      if (error) throw error;

      // Get angle count
      const { count: angleCount } = await supabase
        .from('angle_bank')
        .select('*', { count: 'exact' })
        .eq('music_item_id', musicItemId);

      // Get content queue count
      const { count: contentCount } = await supabase
        .from('content_queue')
        .select('*', { count: 'exact' })
        .eq('music_item_id', musicItemId);

      // Get content queue IDs first
      const { data: contentQueueIds } = await supabase
        .from('content_queue')
        .select('id')
        .eq('music_item_id', musicItemId);

      // Get assets count
      const { data: assets } = await supabase
        .from('content_assets')
        .select('asset_type')
        .in('content_queue_id', 
          contentQueueIds?.map(item => item.id) || []
        );

      return {
        musicItem,
        stats: {
          angles: angleCount || 0,
          content: contentCount || 0,
          videos: assets?.filter(a => a.asset_type === 'video').length || 0,
          thumbnails: assets?.filter(a => a.asset_type === 'thumbnail').length || 0
        }
      };
    } catch (error) {
      console.error('Error getting workflow status:', error);
      throw error;
    }
  }
}