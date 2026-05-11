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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          code: string
          coin_reward: number
          created_at: string
          description: string
          icon: string
          id: string
          requirement_type: string
          requirement_value: number
          sort_order: number
          title: string
          xp_reward: number
        }
        Insert: {
          category?: string
          code: string
          coin_reward?: number
          created_at?: string
          description: string
          icon?: string
          id?: string
          requirement_type: string
          requirement_value?: number
          sort_order?: number
          title: string
          xp_reward?: number
        }
        Update: {
          category?: string
          code?: string
          coin_reward?: number
          created_at?: string
          description?: string
          icon?: string
          id?: string
          requirement_type?: string
          requirement_value?: number
          sort_order?: number
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          after: Json | null
          before: Json | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          coin_reward: number
          created_at: string
          creator_id: string
          creator_score: number | null
          expires_at: string
          id: string
          kind: string
          lesson_id: string
          opponent_id: string | null
          opponent_score: number | null
          status: string
          subject_id: string
          updated_at: string
          winner_id: string | null
          xp_reward: number
        }
        Insert: {
          coin_reward?: number
          created_at?: string
          creator_id: string
          creator_score?: number | null
          expires_at?: string
          id?: string
          kind?: string
          lesson_id: string
          opponent_id?: string | null
          opponent_score?: number | null
          status?: string
          subject_id: string
          updated_at?: string
          winner_id?: string | null
          xp_reward?: number
        }
        Update: {
          coin_reward?: number
          created_at?: string
          creator_id?: string
          creator_score?: number | null
          expires_at?: string
          id?: string
          kind?: string
          lesson_id?: string
          opponent_id?: string | null
          opponent_score?: number | null
          status?: string
          subject_id?: string
          updated_at?: string
          winner_id?: string | null
          xp_reward?: number
        }
        Relationships: []
      }
      class_members: {
        Row: {
          class_id: string
          id: string
          joined_at: string
          student_id: string
        }
        Insert: {
          class_id: string
          id?: string
          joined_at?: string
          student_id: string
        }
        Update: {
          class_id?: string
          id?: string
          joined_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_members_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string
          grade: number
          id: string
          invite_code: string
          name: string
          school_id: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          grade?: number
          id?: string
          invite_code?: string
          name: string
          school_id: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          grade?: number
          id?: string
          invite_code?: string
          name?: string
          school_id?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
          active: boolean
          body: Json
          created_at: string
          created_by: string | null
          grade: number | null
          id: string
          lesson_id: string | null
          sort_order: number
          subject_id: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          body?: Json
          created_at?: string
          created_by?: string | null
          grade?: number | null
          id?: string
          lesson_id?: string | null
          sort_order?: number
          subject_id?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          body?: Json
          created_at?: string
          created_by?: string | null
          grade?: number | null
          id?: string
          lesson_id?: string | null
          sort_order?: number
          subject_id?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          parent_approved: boolean
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          parent_approved?: boolean
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          parent_approved?: boolean
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      infinite_progress: {
        Row: {
          data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      infinite_scores: {
        Row: {
          age: number | null
          age_group: string | null
          created_at: string
          id: string
          level: number
          region: string | null
          score: number
          season: string
          stars: number
          track_id: string
          user_id: string
          week_start: string
        }
        Insert: {
          age?: number | null
          age_group?: string | null
          created_at?: string
          id?: string
          level?: number
          region?: string | null
          score?: number
          season?: string
          stars?: number
          track_id: string
          user_id: string
          week_start?: string
        }
        Update: {
          age?: number | null
          age_group?: string | null
          created_at?: string
          id?: string
          level?: number
          region?: string | null
          score?: number
          season?: string
          stars?: number
          track_id?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      junior_cloud: {
        Row: {
          data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      parent_links: {
        Row: {
          accepted_at: string | null
          child_id: string | null
          created_at: string
          id: string
          invite_code: string
          parent_id: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          child_id?: string | null
          created_at?: string
          id?: string
          invite_code: string
          parent_id: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          child_id?: string | null
          created_at?: string
          id?: string
          invite_code?: string
          parent_id?: string
          status?: string
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          coins_earned: number
          correct: number
          created_at: string
          duration_seconds: number
          grade: number
          id: string
          lesson_id: string
          subject_id: string
          total: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          coins_earned?: number
          correct?: number
          created_at?: string
          duration_seconds?: number
          grade: number
          id?: string
          lesson_id: string
          subject_id: string
          total?: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          coins_earned?: number
          correct?: number
          created_at?: string
          duration_seconds?: number
          grade?: number
          id?: string
          lesson_id?: string
          subject_id?: string
          total?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number
          bedtime_hour: number | null
          coins: number
          completed_lessons: string[]
          created_at: string
          daily_limit_min: number | null
          equipped_item: string | null
          gems: number
          grade: number
          hearts: number
          id: string
          interests: string[]
          is_premium: boolean
          last_played: string | null
          mascot: string
          name: string
          owned_items: string[]
          parent_pin: string | null
          region: string | null
          role: string
          streak: number
          trial_until: string | null
          updated_at: string
          world_state: Json
          xp: number
        }
        Insert: {
          age?: number
          bedtime_hour?: number | null
          coins?: number
          completed_lessons?: string[]
          created_at?: string
          daily_limit_min?: number | null
          equipped_item?: string | null
          gems?: number
          grade?: number
          hearts?: number
          id: string
          interests?: string[]
          is_premium?: boolean
          last_played?: string | null
          mascot?: string
          name?: string
          owned_items?: string[]
          parent_pin?: string | null
          region?: string | null
          role?: string
          streak?: number
          trial_until?: string | null
          updated_at?: string
          world_state?: Json
          xp?: number
        }
        Update: {
          age?: number
          bedtime_hour?: number | null
          coins?: number
          completed_lessons?: string[]
          created_at?: string
          daily_limit_min?: number | null
          equipped_item?: string | null
          gems?: number
          grade?: number
          hearts?: number
          id?: string
          interests?: string[]
          is_premium?: boolean
          last_played?: string | null
          mascot?: string
          name?: string
          owned_items?: string[]
          parent_pin?: string | null
          region?: string | null
          role?: string
          streak?: number
          trial_until?: string | null
          updated_at?: string
          world_state?: Json
          xp?: number
        }
        Relationships: []
      }
      schools: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          name: string
          owner_teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code?: string
          name: string
          owner_teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          name?: string
          owner_teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      shop_items: {
        Row: {
          active: boolean
          emoji: string
          id: string
          mascot: string | null
          name: string
          period: string | null
          premium: boolean
          price: number
          sort_order: number
          type: string
        }
        Insert: {
          active?: boolean
          emoji?: string
          id: string
          mascot?: string | null
          name: string
          period?: string | null
          premium?: boolean
          price?: number
          sort_order?: number
          type: string
        }
        Update: {
          active?: boolean
          emoji?: string
          id?: string
          mascot?: string | null
          name?: string
          period?: string | null
          premium?: boolean
          price?: number
          sort_order?: number
          type?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      trivia_cache: {
        Row: {
          category: string
          difficulty: string
          fetched_at: string
          id: string
          lang: string
          questions: Json
        }
        Insert: {
          category: string
          difficulty?: string
          fetched_at?: string
          id?: string
          lang?: string
          questions?: Json
        }
        Update: {
          category?: string
          difficulty?: string
          fetched_at?: string
          id?: string
          lang?: string
          questions?: Json
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_code: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_code: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_code?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      claim_first_admin: { Args: never; Returns: boolean }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_class_teacher: { Args: { _class_id: string }; Returns: boolean }
      is_classmate_teacher: { Args: { _student_id: string }; Returns: boolean }
      is_school_owner: { Args: { _school_id: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
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
