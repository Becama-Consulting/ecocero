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
      activity_log: {
        Row: {
          action: string
          created_at: string
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          created_at: string
          id: string
          message: string
          related_of_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          related_of_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          related_of_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_related_of_id_fkey"
            columns: ["related_of_id"]
            isOneToOne: false
            referencedRelation: "fabrication_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      fabrication_orders: {
        Row: {
          assignee_id: string | null
          completed_at: string | null
          created_at: string
          customer: string
          id: string
          line_id: string | null
          priority: number | null
          sap_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["of_status"]
          supervisor_id: string | null
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string
          customer: string
          id?: string
          line_id?: string | null
          priority?: number | null
          sap_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["of_status"]
          supervisor_id?: string | null
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string
          customer?: string
          id?: string
          line_id?: string | null
          priority?: number | null
          sap_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["of_status"]
          supervisor_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fabrication_orders_line_id_fkey"
            columns: ["line_id"]
            isOneToOne: false
            referencedRelation: "production_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      production_lines: {
        Row: {
          capacity: number
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["line_status"]
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["line_status"]
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["line_status"]
          updated_at?: string
        }
        Relationships: []
      }
      production_steps: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          data_json: Json | null
          id: string
          of_id: string
          photos: string[] | null
          started_at: string | null
          status: Database["public"]["Enums"]["step_status"]
          step_name: string
          step_number: number
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          data_json?: Json | null
          id?: string
          of_id: string
          photos?: string[] | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["step_status"]
          step_name: string
          step_number: number
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          data_json?: Json | null
          id?: string
          of_id?: string
          photos?: string[] | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["step_status"]
          step_name?: string
          step_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "production_steps_of_id_fkey"
            columns: ["of_id"]
            isOneToOne: false
            referencedRelation: "fabrication_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          departamento: Database["public"]["Enums"]["departamento"] | null
          email: string
          id: string
          line_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          departamento?: Database["public"]["Enums"]["departamento"] | null
          email: string
          id: string
          line_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          departamento?: Database["public"]["Enums"]["departamento"] | null
          email?: string
          id?: string
          line_id?: string | null
          name?: string
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
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      alert_severity: "info" | "warning" | "critical"
      app_role:
        | "admin_global"
        | "admin_departamento"
        | "supervisor"
        | "operario"
        | "quality"
      departamento:
        | "produccion"
        | "logistica"
        | "compras"
        | "rrhh"
        | "comercial"
        | "administrativo"
      line_status: "active" | "paused" | "error"
      of_status:
        | "pendiente"
        | "en_proceso"
        | "completada"
        | "validada"
        | "albarana"
      step_status: "pendiente" | "en_proceso" | "completado" | "error"
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
      alert_severity: ["info", "warning", "critical"],
      app_role: [
        "admin_global",
        "admin_departamento",
        "supervisor",
        "operario",
        "quality",
      ],
      departamento: [
        "produccion",
        "logistica",
        "compras",
        "rrhh",
        "comercial",
        "administrativo",
      ],
      line_status: ["active", "paused", "error"],
      of_status: [
        "pendiente",
        "en_proceso",
        "completada",
        "validada",
        "albarana",
      ],
      step_status: ["pendiente", "en_proceso", "completado", "error"],
    },
  },
} as const
