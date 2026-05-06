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
          coins: number
          completed_lessons: string[]
          created_at: string
          equipped_item: string | null
          gems: number
          grade: number
          hearts: number
          id: string
          is_premium: boolean
          last_played: string | null
          mascot: string
          name: string
          owned_items: string[]
          role: string
          streak: number
          updated_at: string
          xp: number
        }
        Insert: {
          age?: number
          coins?: number
          completed_lessons?: string[]
          created_at?: string
          equipped_item?: string | null
          gems?: number
          grade?: number
          hearts?: number
          id: string
          is_premium?: boolean
          last_played?: string | null
          mascot?: string
          name?: string
          owned_items?: string[]
          role?: string
          streak?: number
          updated_at?: string
          xp?: number
        }
        Update: {
          age?: number
          coins?: number
          completed_lessons?: string[]
          created_at?: string
          equipped_item?: string | null
          gems?: number
          grade?: number
          hearts?: number
          id?: string
          is_premium?: boolean
          last_played?: string | null
          mascot?: string
          name?: string
          owned_items?: string[]
          role?: string
          streak?: number
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
      shop_items: {
        Row: {
          emoji: string
          id: string
          mascot: string | null
          name: string
          premium: boolean
          price: number
          sort_order: number
          type: string
        }
        Insert: {
          emoji?: string
          id: string
          mascot?: string | null
          name: string
          premium?: boolean
          price?: number
          sort_order?: number
          type: string
        }
        Update: {
          emoji?: string
          id?: string
          mascot?: string | null
          name?: string
          premium?: boolean
          price?: number
          sort_order?: number
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
