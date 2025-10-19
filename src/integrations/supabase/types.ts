export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      angle_bank: {
        Row: {
          created_at: string
          difficulty: number | null
          duration_hint: string | null
          hook: string
          id: string
          sound_fit: number | null
        }
        Insert: {
          created_at?: string
          difficulty?: number | null
          duration_hint?: string | null
          hook: string
          id?: string
          sound_fit?: number | null
        }
        Update: {
          created_at?: string
          difficulty?: number | null
          duration_hint?: string | null
          hook?: string
          id?: string
          sound_fit?: number | null
        }
        Relationships: []
      }
      api_usage_logs: {
        Row: {
          action: string
          cost_usd: number | null
          created_at: string | null
          id: string
          metadata: Json | null
          recording_id: string | null
          response_time_ms: number | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          action: string
          cost_usd?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          recording_id?: string | null
          response_time_ms?: number | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          action?: string
          cost_usd?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          recording_id?: string | null
          response_time_ms?: number | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "screen_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      content_assets: {
        Row: {
          asset_type: string
          content_queue_id: string
          created_at: string
          file_url: string
          generation_params: Json | null
          id: string
          metadata: Json | null
          variant: string | null
        }
        Insert: {
          asset_type: string
          content_queue_id: string
          created_at?: string
          file_url: string
          generation_params?: Json | null
          id?: string
          metadata?: Json | null
          variant?: string | null
        }
        Update: {
          asset_type?: string
          content_queue_id?: string
          created_at?: string
          file_url?: string
          generation_params?: Json | null
          id?: string
          metadata?: Json | null
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_assets_content_queue_id_fkey"
            columns: ["content_queue_id"]
            isOneToOne: false
            referencedRelation: "content_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      content_insights: {
        Row: {
          angle_performance: Json | null
          color_performance: Json | null
          created_at: string
          cta_performance: Json | null
          hook_performance: Json | null
          id: string
          music_item_id: string
          period_end: string
          period_start: string
          recommendations: string[] | null
          summary: string | null
        }
        Insert: {
          angle_performance?: Json | null
          color_performance?: Json | null
          created_at?: string
          cta_performance?: Json | null
          hook_performance?: Json | null
          id?: string
          music_item_id: string
          period_end: string
          period_start: string
          recommendations?: string[] | null
          summary?: string | null
        }
        Update: {
          angle_performance?: Json | null
          color_performance?: Json | null
          created_at?: string
          cta_performance?: Json | null
          hook_performance?: Json | null
          id?: string
          music_item_id?: string
          period_end?: string
          period_start?: string
          recommendations?: string[] | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_insights_music_item_id_fkey"
            columns: ["music_item_id"]
            isOneToOne: false
            referencedRelation: "music_items"
            referencedColumns: ["id"]
          },
        ]
      }
      content_queue: {
        Row: {
          angle_id: string | null
          caption: string | null
          created_at: string
          cta: string | null
          day: string
          hashtags: string[] | null
          id: string
          music_item_id: string
          performance_data: Json | null
          script: string | null
          status: string
        }
        Insert: {
          angle_id?: string | null
          caption?: string | null
          created_at?: string
          cta?: string | null
          day: string
          hashtags?: string[] | null
          id?: string
          music_item_id: string
          performance_data?: Json | null
          script?: string | null
          status?: string
        }
        Update: {
          angle_id?: string | null
          caption?: string | null
          created_at?: string
          cta?: string | null
          day?: string
          hashtags?: string[] | null
          id?: string
          music_item_id?: string
          performance_data?: Json | null
          script?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_queue_angle_id_fkey"
            columns: ["angle_id"]
            isOneToOne: false
            referencedRelation: "angle_bank"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_queue_music_item_id_fkey"
            columns: ["music_item_id"]
            isOneToOne: false
            referencedRelation: "music_items"
            referencedColumns: ["id"]
          },
        ]
      }
      music_items: {
        Row: {
          artists: string[] | null
          cover_art_url: string | null
          created_at: string
          id: string
          metadata: Json | null
          platform: string
          source_url: string
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          artists?: string[] | null
          cover_art_url?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          platform: string
          source_url: string
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          artists?: string[] | null
          cover_art_url?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          platform?: string
          source_url?: string
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          api_quota_limit: number | null
          api_quota_remaining: number | null
          avatar_url: string | null
          created_at: string
          id: string
          quota_reset_at: string | null
          subscription_tier: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          api_quota_limit?: number | null
          api_quota_remaining?: number | null
          avatar_url?: string | null
          created_at?: string
          id: string
          quota_reset_at?: string | null
          subscription_tier?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          api_quota_limit?: number | null
          api_quota_remaining?: number | null
          avatar_url?: string | null
          created_at?: string
          id?: string
          quota_reset_at?: string | null
          subscription_tier?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      screen_recordings: {
        Row: {
          analysis_data: Json | null
          analysis_markdown: string | null
          analysis_status: string | null
          analyzed_at: string | null
          created_at: string
          description: string | null
          duration: number | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          mime_type: string | null
          raw_data: Json | null
          status: string
          storage_type: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_data?: Json | null
          analysis_markdown?: string | null
          analysis_status?: string | null
          analyzed_at?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          mime_type?: string | null
          raw_data?: Json | null
          status?: string
          storage_type?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_data?: Json | null
          analysis_markdown?: string | null
          analysis_status?: string | null
          analyzed_at?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          mime_type?: string | null
          raw_data?: Json | null
          status?: string
          storage_type?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shared_workflows: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_public: boolean | null
          password_hash: string | null
          recording_id: string
          share_token: string
          shared_by_user_id: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          password_hash?: string | null
          recording_id: string
          share_token: string
          shared_by_user_id: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          password_hash?: string | null
          recording_id?: string
          share_token?: string
          shared_by_user_id?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_workflows_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "screen_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_analyses: {
        Row: {
          analysis_duration: number | null
          completed_at: string | null
          complexity_score: number | null
          created_at: string
          error_message: string | null
          frames_analyzed: number | null
          gemini_file_id: string | null
          id: string
          markdown_path: string | null
          recording_id: string
          status: string | null
          total_frames: number | null
        }
        Insert: {
          analysis_duration?: number | null
          completed_at?: string | null
          complexity_score?: number | null
          created_at?: string
          error_message?: string | null
          frames_analyzed?: number | null
          gemini_file_id?: string | null
          id?: string
          markdown_path?: string | null
          recording_id: string
          status?: string | null
          total_frames?: number | null
        }
        Update: {
          analysis_duration?: number | null
          completed_at?: string | null
          complexity_score?: number | null
          created_at?: string
          error_message?: string | null
          frames_analyzed?: number | null
          gemini_file_id?: string | null
          id?: string
          markdown_path?: string | null
          recording_id?: string
          status?: string | null
          total_frames?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_analyses_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "screen_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_actions: {
        Row: {
          action_data: Json | null
          action_type: string
          checkpoint_config: Json | null
          confidence_score: number | null
          created_at: string
          description: string | null
          estimated_time_seconds: number | null
          id: string
          instructions: string
          name: string
          order_index: number
          understanding_id: string
        }
        Insert: {
          action_data?: Json | null
          action_type: string
          checkpoint_config?: Json | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          estimated_time_seconds?: number | null
          id?: string
          instructions: string
          name: string
          order_index?: number
          understanding_id: string
        }
        Update: {
          action_data?: Json | null
          action_type?: string
          checkpoint_config?: Json | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          estimated_time_seconds?: number | null
          id?: string
          instructions?: string
          name?: string
          order_index?: number
          understanding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_actions_understanding_id_fkey"
            columns: ["understanding_id"]
            isOneToOne: false
            referencedRelation: "workflow_understandings"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_steps: {
        Row: {
          action_description: string
          action_type: string
          analysis_id: string
          confidence_score: number | null
          coordinates: Json | null
          created_at: string
          id: string
          metadata: Json | null
          screenshot_path: string | null
          step_number: number
          target_element: string | null
          timestamp_ms: number
        }
        Insert: {
          action_description: string
          action_type: string
          analysis_id: string
          confidence_score?: number | null
          coordinates?: Json | null
          created_at?: string
          id?: string
          metadata?: Json | null
          screenshot_path?: string | null
          step_number: number
          target_element?: string | null
          timestamp_ms: number
        }
        Update: {
          action_description?: string
          action_type?: string
          analysis_id?: string
          confidence_score?: number | null
          coordinates?: Json | null
          created_at?: string
          id?: string
          metadata?: Json | null
          screenshot_path?: string | null
          step_number?: number
          target_element?: string | null
          timestamp_ms?: number
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "video_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_understandings: {
        Row: {
          created_at: string
          id: string
          recording_id: string
          understanding_data: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          recording_id: string
          understanding_data?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          recording_id?: string
          understanding_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_understandings_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "screen_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_user_quota: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      reset_user_quota: {
        Args: { user_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
