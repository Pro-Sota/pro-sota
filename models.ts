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
      activity_logs: {
        Row: {
          action: string | null
          activity_log_id: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          new_data: Json | null
          old_data: Json | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          activity_log_id?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          activity_log_id?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          category: string | null
          city: string | null
          client_id: string
          company_name: string | null
          contact_person: string | null
          country: string | null
          created_at: string | null
          email: string | null
          notes: string | null
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          city?: string | null
          client_id?: string
          company_name?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          notes?: string | null
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          city?: string | null
          client_id?: string
          company_name?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          notes?: string | null
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          document_id: string
          file_url: string | null
          name: string | null
          project_id: string | null
          updated_at: string | null
          uploaded_by: string | null
          version: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          document_id?: string
          file_url?: string | null
          name?: string | null
          project_id?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          version?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          document_id?: string
          file_url?: string | null
          name?: string | null
          project_id?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      drawings: {
        Row: {
          approved_by: string | null
          created_at: string | null
          discipline: string | null
          drawing_id: string
          drawing_number: string | null
          file_url: string | null
          project_id: string | null
          revision: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          discipline?: string | null
          drawing_id?: string
          drawing_number?: string | null
          file_url?: string | null
          project_id?: string | null
          revision?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          discipline?: string | null
          drawing_id?: string
          drawing_number?: string | null
          file_url?: string | null
          project_id?: string | null
          revision?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drawings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number | null
          client_id: string | null
          created_at: string | null
          due_date: string | null
          invoice_id: string
          invoice_number: string | null
          issue_date: string | null
          notes: string | null
          project_id: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          client_id?: string | null
          created_at?: string | null
          due_date?: string | null
          invoice_id?: string
          invoice_number?: string | null
          issue_date?: string | null
          notes?: string | null
          project_id?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          client_id?: string | null
          created_at?: string | null
          due_date?: string | null
          invoice_id?: string
          invoice_number?: string | null
          issue_date?: string | null
          notes?: string | null
          project_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          is_read: boolean | null
          message: string | null
          notification_id: string
          title: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          is_read?: boolean | null
          message?: string | null
          notification_id?: string
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          is_read?: boolean | null
          message?: string | null
          notification_id?: string
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      project_files: {
        Row: {
          created_at: string | null
          file_type: string | null
          file_url: string | null
          name: string | null
          project_file_id: string
          project_id: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_type?: string | null
          file_url?: string | null
          name?: string | null
          project_file_id?: string
          project_id?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_type?: string | null
          file_url?: string | null
          name?: string | null
          project_file_id?: string
          project_id?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      project_folders: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string | null
          folder_id: string
          name: string
          parent_id: string | null
          path: string | null
          project_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          folder_id?: string
          name: string
          parent_id?: string | null
          path?: string | null
          project_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          folder_id?: string
          name?: string
          parent_id?: string | null
          path?: string | null
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "project_folders"
            referencedColumns: ["folder_id"]
          },
          {
            foreignKeyName: "project_folders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      project_members: {
        Row: {
          id: string
          joined_at: string | null
          project_id: string | null
          project_role: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          project_id?: string | null
          project_role?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          project_id?: string | null
          project_role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      project_phases: {
        Row: {
          end_date: string | null
          name: string | null
          order_number: number | null
          phase_id: string
          phase_template_id: number | null
          project_id: string | null
          start_date: string | null
          status: string | null
        }
        Insert: {
          end_date?: string | null
          name?: string | null
          order_number?: number | null
          phase_id?: string
          phase_template_id?: number | null
          project_id?: string | null
          start_date?: string | null
          status?: string | null
        }
        Update: {
          end_date?: string | null
          name?: string | null
          order_number?: number | null
          phase_id?: string
          phase_template_id?: number | null
          project_id?: string | null
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      project_stages: {
        Row: {
          end_date: string | null
          name: string | null
          order_number: number | null
          project_phase_id: string | null
          stage_id: string
          start_date: string | null
          status: string | null
        }
        Insert: {
          end_date?: string | null
          name?: string | null
          order_number?: number | null
          project_phase_id?: string | null
          stage_id?: string
          start_date?: string | null
          status?: string | null
        }
        Update: {
          end_date?: string | null
          name?: string | null
          order_number?: number | null
          project_phase_id?: string | null
          stage_id?: string
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_stages_project_phase_id_fkey"
            columns: ["project_phase_id"]
            isOneToOne: false
            referencedRelation: "project_phases"
            referencedColumns: ["phase_id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          client_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          estimativa: number | null
          location: string | null
          name: string | null
          project_code: string | null
          project_id: string
          start_date: string | null
          status: string | null
          type: string | null
          type_urgency: string | null
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          estimativa?: number | null
          location?: string | null
          name?: string | null
          project_code?: string | null
          project_id?: string
          start_date?: string | null
          status?: string | null
          type?: string | null
          type_urgency?: string | null
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          estimativa?: number | null
          location?: string | null
          name?: string | null
          project_code?: string | null
          project_id?: string
          start_date?: string | null
          status?: string | null
          type?: string | null
          type_urgency?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["client_id"]
          },
        ]
      }
      roles: {
        Row: {
          decription: string | null
          name: string
          role_id: number
        }
        Insert: {
          decription?: string | null
          name: string
          role_id: number
        }
        Update: {
          decription?: string | null
          name?: string
          role_id?: number
        }
        Relationships: []
      }
      site_visits: {
        Row: {
          conducted_by: string | null
          created_at: string | null
          issues_found: string | null
          observations: string | null
          project_id: string | null
          recommendations: string | null
          site_visit_id: string
          visit_date: string | null
        }
        Insert: {
          conducted_by?: string | null
          created_at?: string | null
          issues_found?: string | null
          observations?: string | null
          project_id?: string | null
          recommendations?: string | null
          site_visit_id?: string
          visit_date?: string | null
        }
        Update: {
          conducted_by?: string | null
          created_at?: string | null
          issues_found?: string | null
          observations?: string | null
          project_id?: string | null
          recommendations?: string | null
          site_visit_id?: string
          visit_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_visits_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          priority: string | null
          project_id: string | null
          status: string | null
          task_id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          task_id?: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          task_id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          role_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          role_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          is_active: boolean | null
          last_name: string
          phone_number: string | null
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          is_active?: boolean | null
          last_name: string
          phone_number?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          is_active?: boolean | null
          last_name?: string
          phone_number?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      work_requests: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          project_id: string | null
          requested_by: string | null
          resolved_at: string | null
          status: string | null
          title: string
          updated_at: string | null
          urgency: Database["public"]["Enums"]["urgency_type"]
          work_request_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          project_id?: string | null
          requested_by?: string | null
          resolved_at?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          urgency?: Database["public"]["Enums"]["urgency_type"]
          work_request_id?: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          project_id?: string | null
          requested_by?: string | null
          resolved_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          urgency?: Database["public"]["Enums"]["urgency_type"]
          work_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
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
      gender_type: "M" | "F" | "Other"
      priority_type: "Low" | "Medium" | "High" | "Critical"
      project_member_role:
        | "Manager"
        | "Engineer"
        | "Architect"
        | "Supervisor"
        | "Viewer"
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
      urgency_type: "Low" | "Medium" | "High" | "Critical"
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
      gender_type: ["M", "F", "Other"],
      priority_type: ["Low", "Medium", "High", "Critical"],
      project_member_role: [
        "Manager",
        "Engineer",
        "Architect",
        "Supervisor",
        "Viewer",
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
      urgency_type: ["Low", "Medium", "High", "Critical"],
    },
  },
} as const
