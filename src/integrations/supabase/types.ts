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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_config: {
        Row: {
          code_hash: string | null
          id: boolean
          updated_at: string
        }
        Insert: {
          code_hash?: string | null
          id?: boolean
          updated_at?: string
        }
        Update: {
          code_hash?: string | null
          id?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      ads: {
        Row: {
          active: boolean
          body: string
          created_at: string
          ends_at: string | null
          id: string
          image_url: string
          link_url: string
          placement: string
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          body?: string
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url?: string
          link_url?: string
          placement?: string
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          body?: string
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url?: string
          link_url?: string
          placement?: string
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_releases: {
        Row: {
          created_at: string
          download_url: string
          id: string
          notes: string
          platform: string
          published: boolean
          released_at: string
          size_label: string
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          download_url?: string
          id?: string
          notes?: string
          platform: string
          published?: boolean
          released_at?: string
          size_label?: string
          updated_at?: string
          version?: string
        }
        Update: {
          created_at?: string
          download_url?: string
          id?: string
          notes?: string
          platform?: string
          published?: boolean
          released_at?: string
          size_label?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      chest_rewards: {
        Row: {
          chest_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
          xp_awarded: number
        }
        Insert: {
          chest_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          xp_awarded?: number
        }
        Update: {
          chest_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          xp_awarded?: number
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          attempts: number
          best_accuracy: number
          completed_at: string
          created_at: string
          id: string
          lesson_id: string
          module_id: string
          path_id: string | null
          updated_at: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          attempts?: number
          best_accuracy?: number
          completed_at?: string
          created_at?: string
          id?: string
          lesson_id: string
          module_id: string
          path_id?: string | null
          updated_at?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          attempts?: number
          best_accuracy?: number
          completed_at?: string
          created_at?: string
          id?: string
          lesson_id?: string
          module_id?: string
          path_id?: string | null
          updated_at?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          day: string
          id: string
          path: string
          updated_at: string
          views: number
          visitors: number
        }
        Insert: {
          created_at?: string
          day?: string
          id?: string
          path: string
          updated_at?: string
          views?: number
          visitors?: number
        }
        Update: {
          created_at?: string
          day?: string
          id?: string
          path?: string
          updated_at?: string
          views?: number
          visitors?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          preferred_language: string
          pseudo: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          preferred_language?: string
          pseudo?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          preferred_language?: string
          pseudo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quiz_results: {
        Row: {
          created_at: string
          id: string
          module_id: string
          passed: boolean
          score: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          module_id: string
          passed?: boolean
          score: number
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          module_id?: string
          passed?: boolean
          score?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          created_at: string
          earned_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          badge_id: string
          created_at?: string
          earned_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          created_at?: string
          earned_at?: string
          id?: string
          updated_at?: string
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
      user_stats: {
        Row: {
          best_streak: number
          created_at: string
          current_streak: number
          hearts: number
          hearts_updated_at: string
          last_active_day: string | null
          updated_at: string
          user_id: string
          xp_total: number
        }
        Insert: {
          best_streak?: number
          created_at?: string
          current_streak?: number
          hearts?: number
          hearts_updated_at?: string
          last_active_day?: string | null
          updated_at?: string
          user_id: string
          xp_total?: number
        }
        Update: {
          best_streak?: number
          created_at?: string
          current_streak?: number
          hearts?: number
          hearts_updated_at?: string
          last_active_day?: string | null
          updated_at?: string
          user_id?: string
          xp_total?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_code_is_set: { Args: never; Returns: boolean }
      admin_list_users: {
        Args: never
        Returns: {
          created_at: string
          current_streak: number
          email: string
          last_active_day: string
          last_sign_in_at: string
          preferred_language: string
          pseudo: string
          user_id: string
          xp_total: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      set_admin_code: { Args: { _code: string }; Returns: boolean }
      track_page_view: {
        Args: { _new_visitor?: boolean; _path: string }
        Returns: undefined
      }
      verify_admin_code: { Args: { _code: string }; Returns: boolean }
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
