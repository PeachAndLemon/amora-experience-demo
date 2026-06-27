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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_completions: {
        Row: {
          activity_id: string
          completed_at: string
          id: string
          milestone_id: string
          preference_signals: string[] | null
          star_rating: number | null
          user_id: string
        }
        Insert: {
          activity_id: string
          completed_at?: string
          id?: string
          milestone_id: string
          preference_signals?: string[] | null
          star_rating?: number | null
          user_id: string
        }
        Update: {
          activity_id?: string
          completed_at?: string
          id?: string
          milestone_id?: string
          preference_signals?: string[] | null
          star_rating?: number | null
          user_id?: string
        }
        Relationships: []
      }
      admin_activities: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          duration: string
          id: string
          is_active: boolean
          milestone_id: string
          prompts: string[] | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string
          duration?: string
          id?: string
          is_active?: boolean
          milestone_id: string
          prompts?: string[] | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          duration?: string
          id?: string
          is_active?: boolean
          milestone_id?: string
          prompts?: string[] | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_changelog: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string
          details: Json | null
          entity_id: string
          entity_name: string
          entity_type: string
          id: string
        }
        Insert: {
          action_type?: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          entity_id: string
          entity_name?: string
          entity_type?: string
          id?: string
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          entity_id?: string
          entity_name?: string
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      admin_events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          event_date: string
          id: string
          image_url: string | null
          is_active: boolean
          location: string | null
          milestone_category: string
          milestone_id: string
          name: string
          qr_expires_at: string | null
          qr_short_code: string | null
          stamp_icon_id: string
          stamp_name: string
          updated_at: string
          venue: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string
          event_date?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          milestone_category?: string
          milestone_id: string
          name: string
          qr_expires_at?: string | null
          qr_short_code?: string | null
          stamp_icon_id?: string
          stamp_name?: string
          updated_at?: string
          venue?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          event_date?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          milestone_category?: string
          milestone_id?: string
          name?: string
          qr_expires_at?: string | null
          qr_short_code?: string | null
          stamp_icon_id?: string
          stamp_name?: string
          updated_at?: string
          venue?: string
        }
        Relationships: []
      }
      admin_milestones: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          icon_id: string
          id: string
          is_active: boolean
          key: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string
          icon_id?: string
          id?: string
          is_active?: boolean
          key: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          icon_id?: string
          id?: string
          is_active?: boolean
          key?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      admin_rewards: {
        Row: {
          code: string | null
          created_at: string
          created_by: string | null
          description: string
          duration_minutes: number | null
          icon_id: string
          id: string
          is_active: boolean
          name: string
          partner_name: string | null
          redemption_window_hours: number | null
          type: string
          unlock_criteria: string | null
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          duration_minutes?: number | null
          icon_id?: string
          id?: string
          is_active?: boolean
          name: string
          partner_name?: string | null
          redemption_window_hours?: number | null
          type?: string
          unlock_criteria?: string | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          duration_minutes?: number | null
          icon_id?: string
          id?: string
          is_active?: boolean
          name?: string
          partner_name?: string | null
          redemption_window_hours?: number | null
          type?: string
          unlock_criteria?: string | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      admin_stamps: {
        Row: {
          created_at: string
          created_by: string | null
          criteria_count: number
          criteria_type: string
          description: string
          icon_id: string
          id: string
          is_active: boolean
          milestone_key: string
          name: string
          sort_order: number
          unlock_criteria: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          criteria_count?: number
          criteria_type?: string
          description?: string
          icon_id?: string
          id?: string
          is_active?: boolean
          milestone_key: string
          name: string
          sort_order?: number
          unlock_criteria?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          criteria_count?: number
          criteria_type?: string
          description?: string
          icon_id?: string
          id?: string
          is_active?: boolean
          milestone_key?: string
          name?: string
          sort_order?: number
          unlock_criteria?: string
          updated_at?: string
        }
        Relationships: []
      }
      earned_stamps: {
        Row: {
          earned_at: string
          id: string
          milestone_id: string
          stamp_id: string
          user_id: string
        }
        Insert: {
          earned_at?: string
          id?: string
          milestone_id: string
          stamp_id: string
          user_id: string
        }
        Update: {
          earned_at?: string
          id?: string
          milestone_id?: string
          stamp_id?: string
          user_id?: string
        }
        Relationships: []
      }
      event_checkins: {
        Row: {
          checked_in_at: string
          event_id: string
          id: string
          stamp_earned: boolean | null
          user_id: string
        }
        Insert: {
          checked_in_at?: string
          event_id: string
          id?: string
          stamp_earned?: boolean | null
          user_id: string
        }
        Update: {
          checked_in_at?: string
          event_id?: string
          id?: string
          stamp_earned?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          data: Json
          id: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_answers: {
        Row: {
          amora_wish: string | null
          autopilot_level: number | null
          created_at: string
          destination_feeling: string | null
          gets_in_way: string[] | null
          id: string
          love_as_place: string | null
          rich_in: string | null
          rich_in_other: string | null
          updated_at: string
          user_id: string
          want_more_of: string[] | null
        }
        Insert: {
          amora_wish?: string | null
          autopilot_level?: number | null
          created_at?: string
          destination_feeling?: string | null
          gets_in_way?: string[] | null
          id?: string
          love_as_place?: string | null
          rich_in?: string | null
          rich_in_other?: string | null
          updated_at?: string
          user_id: string
          want_more_of?: string[] | null
        }
        Update: {
          amora_wish?: string | null
          autopilot_level?: number | null
          created_at?: string
          destination_feeling?: string | null
          gets_in_way?: string[] | null
          id?: string
          love_as_place?: string | null
          rich_in?: string | null
          rich_in_other?: string | null
          updated_at?: string
          user_id?: string
          want_more_of?: string[] | null
        }
        Relationships: []
      }
      onboarding_survey_history: {
        Row: {
          amora_wish: string | null
          autopilot_level: number | null
          destination_feeling: string | null
          gets_in_way: string[] | null
          id: string
          love_as_place: string | null
          partner_id: string | null
          relationship_duration: string | null
          relationship_season: string | null
          rich_in: string | null
          rich_in_other: string | null
          survey_number: number
          taken_at: string
          user_id: string
          want_more_of: string[] | null
        }
        Insert: {
          amora_wish?: string | null
          autopilot_level?: number | null
          destination_feeling?: string | null
          gets_in_way?: string[] | null
          id?: string
          love_as_place?: string | null
          partner_id?: string | null
          relationship_duration?: string | null
          relationship_season?: string | null
          rich_in?: string | null
          rich_in_other?: string | null
          survey_number?: number
          taken_at?: string
          user_id: string
          want_more_of?: string[] | null
        }
        Update: {
          amora_wish?: string | null
          autopilot_level?: number | null
          destination_feeling?: string | null
          gets_in_way?: string[] | null
          id?: string
          love_as_place?: string | null
          partner_id?: string | null
          relationship_duration?: string | null
          relationship_season?: string | null
          rich_in?: string | null
          rich_in_other?: string | null
          survey_number?: number
          taken_at?: string
          user_id?: string
          want_more_of?: string[] | null
        }
        Relationships: []
      }
      partner_link_requests: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          couple_name: string
          created_at: string
          id: string
          next_survey_due: string | null
          partner_code: string | null
          partner_connected: boolean | null
          partner_id: string | null
          partner1_name: string
          partner2_name: string
          relationship_duration: string | null
          relationship_season: string | null
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          couple_name?: string
          created_at?: string
          id?: string
          next_survey_due?: string | null
          partner_code?: string | null
          partner_connected?: boolean | null
          partner_id?: string | null
          partner1_name?: string
          partner2_name?: string
          relationship_duration?: string | null
          relationship_season?: string | null
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          couple_name?: string
          created_at?: string
          id?: string
          next_survey_due?: string | null
          partner_code?: string | null
          partner_connected?: boolean | null
          partner_id?: string | null
          partner1_name?: string
          partner2_name?: string
          relationship_duration?: string | null
          relationship_season?: string | null
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          is_active: boolean
          max_uses: number | null
          name: string
          reward_id: string | null
          type: string
          updated_at: string
          uses: number
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_active?: boolean
          max_uses?: number | null
          name: string
          reward_id?: string | null
          type?: string
          updated_at?: string
          uses?: number
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_active?: boolean
          max_uses?: number | null
          name?: string
          reward_id?: string | null
          type?: string
          updated_at?: string
          uses?: number
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      promo_redemptions: {
        Row: {
          id: string
          promo_id: string
          redeemed_at: string
          user_id: string
        }
        Insert: {
          id?: string
          promo_id: string
          redeemed_at?: string
          user_id: string
        }
        Update: {
          id?: string
          promo_id?: string
          redeemed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_redemptions_promo_id_fkey"
            columns: ["promo_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_redemptions: {
        Row: {
          expires_at: string | null
          id: string
          opened_at: string
          reward_id: string
          reward_name: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          id?: string
          opened_at?: string
          reward_id: string
          reward_name?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          expires_at?: string | null
          id?: string
          opened_at?: string
          reward_id?: string
          reward_name?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_engagement: {
        Row: {
          created_at: string
          engagement_type: string
          entity_id: string
          entity_name: string | null
          entity_type: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          engagement_type: string
          entity_id: string
          entity_name?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          engagement_type?: string
          entity_id?: string
          entity_name?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_partner_link: { Args: { request_id: string }; Returns: boolean }
      admin_list_promo_codes: {
        Args: never
        Returns: {
          code: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          is_active: boolean
          max_uses: number | null
          name: string
          reward_id: string | null
          type: string
          updated_at: string
          uses: number
          valid_from: string | null
          valid_until: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "promo_codes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_list_rewards: {
        Args: never
        Returns: {
          code: string | null
          created_at: string
          created_by: string | null
          description: string
          duration_minutes: number | null
          icon_id: string
          id: string
          is_active: boolean
          name: string
          partner_name: string | null
          redemption_window_hours: number | null
          type: string
          unlock_criteria: string | null
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "admin_rewards"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_set_user_role: {
        Args: {
          grant_role: boolean
          target_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: boolean
      }
      admin_user_overview: {
        Args: never
        Returns: {
          activity_count: number
          couple_name: string
          created_at: string
          engagement_count: number
          event_checkin_count: number
          is_admin: boolean
          partner_connected: boolean
          partner1_name: string
          partner2_name: string
          reward_redemption_count: number
          user_id: string
        }[]
      }
      evaluate_stamps_for_user: {
        Args: { _user_id: string }
        Returns: undefined
      }
      gen_hex_qr_code: { Args: never; Returns: string }
      get_my_partner_code: { Args: never; Returns: string }
      get_my_partner_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      link_partner: { Args: { partner_code_input: string }; Returns: boolean }
      lookup_partner_by_code: {
        Args: { code_input: string }
        Returns: {
          name: string
        }[]
      }
      mark_reward_used: { Args: { redemption_id: string }; Returns: boolean }
      open_reward: {
        Args: {
          duration_minutes_input: number
          reward_id_input: string
          reward_name_input: string
        }
        Returns: string
      }
      redeem_promo_code: { Args: { code_input: string }; Returns: Json }
      reject_partner_link: { Args: { request_id: string }; Returns: boolean }
      unlink_partner: { Args: never; Returns: boolean }
      validate_event_checkin: { Args: { qr_code_input: string }; Returns: Json }
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
