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
      admin_heart_grants: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          expires_at: string
          hearts_remaining: number
          id: string
          kind: string
          reason: string
          revoked_at: string | null
          starts_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          expires_at: string
          hearts_remaining: number
          id?: string
          kind?: string
          reason?: string
          revoked_at?: string | null
          starts_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          expires_at?: string
          hearts_remaining?: number
          id?: string
          kind?: string
          reason?: string
          revoked_at?: string | null
          starts_at?: string
          updated_at?: string
          user_id?: string
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
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
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
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          kind: string
          link: string
          promotion_id: string | null
          read_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          kind?: string
          link?: string
          promotion_id?: string | null
          read_at?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          kind?: string
          link?: string
          promotion_id?: string | null
          read_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
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
      place_favorites: {
        Row: {
          address: string
          category: string
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          place_ref: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string
          category?: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          place_ref: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          category?: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          place_ref?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      places: {
        Row: {
          address: string
          category: string
          city: string
          created_at: string
          description: string
          id: string
          languages: string[]
          latitude: number
          longitude: number
          name: string
          opening_hours: string
          phone: string
          photos: string[]
          price: string
          published: boolean
          source: string
          updated_at: string
          website: string
        }
        Insert: {
          address?: string
          category?: string
          city?: string
          created_at?: string
          description?: string
          id?: string
          languages?: string[]
          latitude: number
          longitude: number
          name: string
          opening_hours?: string
          phone?: string
          photos?: string[]
          price?: string
          published?: boolean
          source?: string
          updated_at?: string
          website?: string
        }
        Update: {
          address?: string
          category?: string
          city?: string
          created_at?: string
          description?: string
          id?: string
          languages?: string[]
          latitude?: number
          longitude?: number
          name?: string
          opening_hours?: string
          phone?: string
          photos?: string[]
          price?: string
          published?: boolean
          source?: string
          updated_at?: string
          website?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          preferred_language: string
          pseudo: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          preferred_language?: string
          pseudo?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          preferred_language?: string
          pseudo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promotion_targets: {
        Row: {
          created_at: string
          id: string
          promotion_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          promotion_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          promotion_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_targets_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          active: boolean
          audience: string
          code: string | null
          created_at: string
          created_by: string | null
          description: string
          discount_type: string
          discount_value: number
          ends_at: string | null
          id: string
          plan_ids: string[]
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          audience?: string
          code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          plan_ids?: string[]
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          audience?: string
          code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          plan_ids?: string[]
          starts_at?: string
          title?: string
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
      subscriptions: {
        Row: {
          auto_renew: boolean
          cancel_at_period_end: boolean
          created_at: string
          expires_at: string | null
          grace_until: string | null
          id: string
          payment_state: string
          plan_id: string
          provider: string
          provider_ref: string | null
          start_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean
          cancel_at_period_end?: boolean
          created_at?: string
          expires_at?: string | null
          grace_until?: string | null
          id?: string
          payment_state?: string
          plan_id: string
          provider?: string
          provider_ref?: string | null
          start_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean
          cancel_at_period_end?: boolean
          created_at?: string
          expires_at?: string | null
          grace_until?: string | null
          id?: string
          payment_state?: string
          plan_id?: string
          provider?: string
          provider_ref?: string | null
          start_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_daily: {
        Row: {
          created_at: string
          day: string
          id: string
          updated_at: string
          user_id: string
          voice_seconds: number
        }
        Insert: {
          created_at?: string
          day?: string
          id?: string
          updated_at?: string
          user_id: string
          voice_seconds?: number
        }
        Update: {
          created_at?: string
          day?: string
          id?: string
          updated_at?: string
          user_id?: string
          voice_seconds?: number
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
          hearts_day: string | null
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
          hearts_day?: string | null
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
          hearts_day?: string | null
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
      active_plans: {
        Args: { _user_id: string }
        Returns: {
          auto_renew: boolean
          cancel_at_period_end: boolean
          expires_at: string
          plan_id: string
          status: string
        }[]
      }
      admin_code_is_set: { Args: never; Returns: boolean }
      admin_exists: { Args: never; Returns: boolean }
      admin_list_subscriptions: {
        Args: { _actor: string }
        Returns: {
          auto_renew: boolean
          cancel_at_period_end: boolean
          created_at: string
          email: string
          expires_at: string
          grace_until: string
          id: string
          payment_state: string
          plan_id: string
          provider: string
          pseudo: string
          start_at: string
          status: string
          updated_at: string
          user_id: string
        }[]
      }
      admin_list_users: {
        Args: { _actor: string }
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
      admin_send_promotion: {
        Args: { _actor: string; _promotion_id: string }
        Returns: number
      }
      admin_set_role_by_email: {
        Args: { _actor: string; _email: string; _grant: boolean }
        Returns: boolean
      }
      are_friends: { Args: { _a: string; _b: string }; Returns: boolean }
      claim_first_admin: { Args: { _actor: string }; Returns: boolean }
      get_public_profile: {
        Args: { _target: string }
        Returns: {
          avatar_url: string
          current_streak: number
          is_friend: boolean
          pseudo: string
          user_id: string
          xp_total: number
        }[]
      }
      list_conversations: {
        Args: never
        Returns: {
          avatar_url: string
          last_at: string
          last_body: string
          pseudo: string
          unread: number
          user_id: string
          xp_total: number
        }[]
      }
      list_friendships: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          direction: string
          friendship_id: string
          pseudo: string
          status: string
          user_id: string
          xp_total: number
        }[]
      }
      search_profiles: {
        Args: { _q: string }
        Returns: {
          avatar_url: string
          friend_status: string
          pseudo: string
          user_id: string
          xp_total: number
        }[]
      }
      set_admin_code: {
        Args: { _actor: string; _code: string }
        Returns: boolean
      }
      track_page_view: {
        Args: { _new_visitor?: boolean; _path: string }
        Returns: undefined
      }
      verify_admin_code: {
        Args: { _actor: string; _code: string }
        Returns: boolean
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
