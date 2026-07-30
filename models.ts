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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          address_line_1: string | null
          address_line_2: string | null
          city: string | null
          client_id: string
          client_type: string
          contact_person: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          email: string | null
          first_name: string | null
          industry: string | null
          last_contacted_at: string | null
          last_name: string | null
          logo_url: string | null
          name: string
          notes: string | null
          organization_name: string | null
          phone: string | null
          preferred_contact_method: string | null
          state_province: string | null
          status: string
          updated_at: string | null
          updated_by: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          client_id?: string
          client_type: string
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          first_name?: string | null
          industry?: string | null
          last_contacted_at?: string | null
          last_name?: string | null
          logo_url?: string | null
          name: string
          notes?: string | null
          organization_name?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          state_province?: string | null
          status?: string
          updated_at?: string | null
          updated_by?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          client_id?: string
          client_type?: string
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          first_name?: string | null
          industry?: string | null
          last_contacted_at?: string | null
          last_name?: string | null
          logo_url?: string | null
          name?: string
          notes?: string | null
          organization_name?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          state_province?: string | null
          status?: string
          updated_at?: string | null
          updated_by?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "clients_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      folders: {
        Row: {
          created_at: string | null
          folder_id: string
          is_system: boolean | null
          name: string
          parent_id: string | null
          project_id: string
          sort_order: number | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          folder_id?: string
          is_system?: boolean | null
          name: string
          parent_id?: string | null
          project_id: string
          sort_order?: number | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          folder_id?: string
          is_system?: boolean | null
          name?: string
          parent_id?: string | null
          project_id?: string
          sort_order?: number | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["folder_id"]
          },
          {
            foreignKeyName: "folders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          department: string | null
          dob: string | null
          email: string | null
          first_name: string
          job_title: string | null
          last_name: string
          nationality: string | null
          phone_number: string | null
          profile_id: string
          profile_picture: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          department?: string | null
          dob?: string | null
          email?: string | null
          first_name: string
          job_title?: string | null
          last_name: string
          nationality?: string | null
          phone_number?: string | null
          profile_id: string
          profile_picture?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          department?: string | null
          dob?: string | null
          email?: string | null
          first_name?: string
          job_title?: string | null
          last_name?: string
          nationality?: string | null
          phone_number?: string | null
          profile_id?: string
          profile_picture?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          budget: number | null
          city: string | null
          client_id: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          estimated_cost: number | null
          latitude: number | null
          location: string | null
          longitude: number | null
          municipality: string
          project_code: string
          project_id: string
          start_date: string | null
          state_province: string | null
          status: string | null
          title: string
          type: string | null
          updated_at: string | null
          urgency: string | null
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          budget?: number | null
          city?: string | null
          client_id?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          estimated_cost?: number | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          municipality: string
          project_code: string
          project_id?: string
          start_date?: string | null
          state_province?: string | null
          status?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
          urgency?: string | null
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          budget?: number | null
          city?: string | null
          client_id?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          estimated_cost?: number | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          municipality?: string
          project_code?: string
          project_id?: string
          start_date?: string | null
          state_province?: string | null
          status?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      priority_type: "Low" | "Medium" | "High" | "Critical"
      project_member_role:
        | "Manager"
        | "Engineer"
        | "Architect"
        | "Supervisor"
        | "Viewer"
        | "Admin"
      project_status:
        | "Planning"
        | "In Progress"
        | "On Hold"
        | "Completed"
        | "Cancelled"
      task_status:
        | "Pending"
        | "In Progress"
        | "Review"
        | "Completed"
        | "Cancelled"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      priority_type: ["Low", "Medium", "High", "Critical"],
      project_member_role: [
        "Manager",
        "Engineer",
        "Architect",
        "Supervisor",
        "Viewer",
        "Admin",
      ],
      project_status: [
        "Planning",
        "In Progress",
        "On Hold",
        "Completed",
        "Cancelled",
      ],
      task_status: [
        "Pending",
        "In Progress",
        "Review",
        "Completed",
        "Cancelled",
      ],
    },
  },
} as const
