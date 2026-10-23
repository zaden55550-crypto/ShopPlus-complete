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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ai_access_state: {
        Row: {
          blocked: boolean
          created_at: string
          message: string
          scope: string
          status: number
          updated_at: string
        }
        Insert: {
          blocked?: boolean
          created_at?: string
          message: string
          scope: string
          status: number
          updated_at?: string
        }
        Update: {
          blocked?: boolean
          created_at?: string
          message?: string
          scope?: string
          status?: number
          updated_at?: string
        }
        Relationships: []
      }
      shopbook_backup_snapshots: {
        Row: {
          checksum: string
          created_at: string
          device_id: string
          id: string
          kind: string
          payload: string
          record_count: number
          restore_tested_at: string | null
          shop_name: string
          size_bytes: number
          user_id: string
          verified_at: string | null
        }
        Insert: {
          checksum: string
          created_at?: string
          device_id: string
          id?: string
          kind?: string
          payload: string
          record_count?: number
          restore_tested_at?: string | null
          shop_name?: string
          size_bytes: number
          user_id: string
          verified_at?: string | null
        }
        Update: {
          checksum?: string
          created_at?: string
          device_id?: string
          id?: string
          kind?: string
          payload?: string
          record_count?: number
          restore_tested_at?: string | null
          shop_name?: string
          size_bytes?: number
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      shopbook_device_backups: {
        Row: {
          device_id: string
          payload: Json
          revision: number
          shop_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          device_id: string
          payload: Json
          revision?: number
          shop_name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          device_id?: string
          payload?: Json
          revision?: number
          shop_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shopbook_shop_sync: {
        Row: {
          device_id: string
          payload: Json
          revision: number
          updated_at: string
          user_id: string
        }
        Insert: {
          device_id: string
          payload: Json
          revision?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          device_id?: string
          payload?: Json
          revision?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          sender: string
          thread_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          sender: string
          thread_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          sender?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "support_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      support_threads: {
        Row: {
          contact_email: string
          created_at: string
          id: string
          needs_human: boolean
          shop_name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_email?: string
          created_at?: string
          id?: string
          needs_human?: boolean
          shop_name?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_email?: string
          created_at?: string
          id?: string
          needs_human?: boolean
          shop_name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_announcements: {
        Row: {
          active: boolean
          created_at: string
          created_by: string
          dismissible: boolean
          ends_at: string | null
          id: string
          kind: string
          message: string
          starts_at: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string
          dismissible?: boolean
          ends_at?: string | null
          id?: string
          kind?: string
          message: string
          starts_at?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string
          dismissible?: boolean
          ends_at?: string | null
          id?: string
          kind?: string
          message?: string
          starts_at?: string
          updated_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "support"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["support"],
    },
  },
} as const
