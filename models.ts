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
      activities: {
        Row: {
          activity_id: string
          activity_type: string
          created_at: string
          description: string | null
          metadata: Json | null
          project_id: string | null
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          activity_id?: string
          activity_type: string
          created_at?: string
          description?: string | null
          metadata?: Json | null
          project_id?: string | null
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          activity_id?: string
          activity_type?: string
          created_at?: string
          description?: string | null
          metadata?: Json | null
          project_id?: string | null
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          action: string
          activity_id: string
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string
          metadata: Json
          project_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          activity_id?: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type: string
          metadata?: Json
          project_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          activity_id?: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string
          metadata?: Json
          project_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      clients: {
        Row: {
          address_line_1: string | null
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
          last_contacted_at: string | null
          last_name: string | null
          logo_url: string | null
          name: string | null
          neighborhood: string | null
          nif: string | null
          notes: string | null
          organization_name: string | null
          phone: string | null
          preferred_contact_method: string | null
          province: string | null
          status: string
          updated_at: string | null
          updated_by: string | null
          website: string | null
        }
        Insert: {
          address_line_1?: string | null
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
          last_contacted_at?: string | null
          last_name?: string | null
          logo_url?: string | null
          name?: string | null
          neighborhood?: string | null
          nif?: string | null
          notes?: string | null
          organization_name?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          province?: string | null
          status?: string
          updated_at?: string | null
          updated_by?: string | null
          website?: string | null
        }
        Update: {
          address_line_1?: string | null
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
          last_contacted_at?: string | null
          last_name?: string | null
          logo_url?: string | null
          name?: string | null
          neighborhood?: string | null
          nif?: string | null
          notes?: string | null
          organization_name?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          province?: string | null
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
      conversation_participants: {
        Row: {
          conversation_id: string
          joined_at: string | null
          profile_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string | null
          profile_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      conversations: {
        Row: {
          conversation_type: string
          created_at: string | null
          id: string
          is_group: boolean | null
          project_id: string | null
        }
        Insert: {
          conversation_type?: string
          created_at?: string | null
          id?: string
          is_group?: boolean | null
          project_id?: string | null
        }
        Update: {
          conversation_type?: string
          created_at?: string | null
          id?: string
          is_group?: boolean | null
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          document_id: string
          file_path: string
          folder_id: string
          name: string
          project_id: string
          updated_at: string | null
          uploaded_by: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          document_id?: string
          file_path: string
          folder_id: string
          name: string
          project_id: string
          updated_at?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          document_id?: string
          file_path?: string
          folder_id?: string
          name?: string
          project_id?: string
          updated_at?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["folder_id"]
          },
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
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
          slug: string | null
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
          slug?: string | null
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
          slug?: string | null
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
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          sender_id: string | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          sender_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string
          description: string | null
          name: string
          permission_id: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          name: string
          permission_id?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          name?: string
          permission_id?: number
        }
        Relationships: []
      }
      phase_steps: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          created_at: string
          description: string | null
          name: string
          phase_id: string
          planned_end: string | null
          planned_start: string | null
          progress: number | null
          sort_order: number | null
          status: string
          step_id: string
          updated_at: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          created_at?: string
          description?: string | null
          name: string
          phase_id: string
          planned_end?: string | null
          planned_start?: string | null
          progress?: number | null
          sort_order?: number | null
          status?: string
          step_id?: string
          updated_at?: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          created_at?: string
          description?: string | null
          name?: string
          phase_id?: string
          planned_end?: string | null
          planned_start?: string | null
          progress?: number | null
          sort_order?: number | null
          status?: string
          step_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "steps_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["phase_id"]
          },
        ]
      }
      phases: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          created_at: string
          description: string | null
          name: string
          phase_id: string
          planned_end: string | null
          planned_start: string | null
          progress: number | null
          project_id: string
          sort_order: number | null
          status: string
          updated_at: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          created_at?: string
          description?: string | null
          name: string
          phase_id?: string
          planned_end?: string | null
          planned_start?: string | null
          progress?: number | null
          project_id: string
          sort_order?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          created_at?: string
          description?: string | null
          name?: string
          phase_id?: string
          planned_end?: string | null
          planned_start?: string | null
          progress?: number | null
          project_id?: string
          sort_order?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "phases_project_id_fkey"
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
      project_members: {
        Row: {
          joined_at: string | null
          profile_id: string | null
          project_id: string | null
          project_members_id: string
          role_id: number | null
        }
        Insert: {
          joined_at?: string | null
          profile_id?: string | null
          project_id?: string | null
          project_members_id?: string
          role_id?: number | null
        }
        Update: {
          joined_at?: string | null
          profile_id?: string | null
          project_id?: string | null
          project_members_id?: string
          role_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_members_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_id"]
          },
          {
            foreignKeyName: "user_projects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "user_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
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
          image: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          municipality: string
          project_code: string
          project_id: string
          province: string | null
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
          image?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          municipality: string
          project_code: string
          project_id?: string
          province?: string | null
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
          image?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          municipality?: string
          project_code?: string
          project_id?: string
          province?: string | null
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
      role_permissions: {
        Row: {
          permission_id: number
          role_id: number
        }
        Insert: {
          permission_id: number
          role_id?: number
        }
        Update: {
          permission_id?: number
          role_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["permission_id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["role_id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          name: string | null
          role_id: number
        }
        Insert: {
          created_at?: string
          name?: string | null
          role_id?: number
        }
        Update: {
          created_at?: string
          name?: string | null
          role_id?: number
        }
        Relationships: []
      }
      step_deliverables: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          created_at: string
          deliverable_id: string
          description: string | null
          name: string
          planned_end: string | null
          planned_start: string | null
          progress: number | null
          sort_order: number | null
          status: string
          step_id: string
          updated_at: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          created_at?: string
          deliverable_id?: string
          description?: string | null
          name: string
          planned_end?: string | null
          planned_start?: string | null
          progress?: number | null
          sort_order?: number | null
          status?: string
          step_id: string
          updated_at?: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          created_at?: string
          deliverable_id?: string
          description?: string | null
          name?: string
          planned_end?: string | null
          planned_start?: string | null
          progress?: number | null
          sort_order?: number | null
          status?: string
          step_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "phase_steps"
            referencedColumns: ["step_id"]
          },
        ]
      }
      submission_files: {
        Row: {
          created_at: string
          document_id: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string | null
          submission_file_id: string
          submission_id: string
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          submission_file_id?: string
          submission_id: string
        }
        Update: {
          created_at?: string
          document_id?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          submission_file_id?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_files_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "submission_files_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["submission_id"]
          },
        ]
      }
      submissions: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          notes: string | null
          project_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          revision_number: number
          status: string
          submission_id: string
          submitted_at: string
          submitted_by: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          notes?: string | null
          project_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          revision_number?: number
          status?: string
          submission_id?: string
          submitted_at?: string
          submitted_by: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          notes?: string | null
          project_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          revision_number?: number
          status?: string
          submission_id?: string
          submitted_at?: string
          submitted_by?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "submissions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      supplier_projects: {
        Row: {
          created_at: string
          project_id: string
          supplier_id: string
          supplier_project_id: string
        }
        Insert: {
          created_at?: string
          project_id: string
          supplier_id: string
          supplier_project_id?: string
        }
        Update: {
          created_at?: string
          project_id?: string
          supplier_id?: string
          supplier_project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "supplier_projects_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["supplier_id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address_line_1: string | null
          category: string | null
          city: string | null
          country: string | null
          created_at: string
          nif: string | null
          person_of_contact: string | null
          phone_number: string | null
          rating: number | null
          status: string
          sub_category: string | null
          supplier_id: string
          supplier_name: string
          tags: Json | null
          updated_at: string
        }
        Insert: {
          address_line_1?: string | null
          category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          nif?: string | null
          person_of_contact?: string | null
          phone_number?: string | null
          rating?: number | null
          status?: string
          sub_category?: string | null
          supplier_id?: string
          supplier_name: string
          tags?: Json | null
          updated_at?: string
        }
        Update: {
          address_line_1?: string | null
          category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          nif?: string | null
          person_of_contact?: string | null
          phone_number?: string | null
          rating?: number | null
          status?: string
          sub_category?: string | null
          supplier_id?: string
          supplier_name?: string
          tags?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      task_columns: {
        Row: {
          column_id: string
          created_at: string
          is_completed: boolean
          name: string
          position: number
          project_id: string | null
          updated_at: string
        }
        Insert: {
          column_id?: string
          created_at?: string
          is_completed?: boolean
          name: string
          position?: number
          project_id?: string | null
          updated_at?: string
        }
        Update: {
          column_id?: string
          created_at?: string
          is_completed?: boolean
          name?: string
          position?: number
          project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_columns_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          column_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          position: number
          priority: string
          project_id: string | null
          start_date: string | null
          task_id: string
          title: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          column_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          position?: number
          priority?: string
          project_id?: string | null
          start_date?: string | null
          task_id?: string
          title: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          column_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          position?: number
          priority?: string
          project_id?: string | null
          start_date?: string | null
          task_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "tasks_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "task_columns"
            referencedColumns: ["column_id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
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
      get_or_create_direct_conversation: {
        Args: { other_user: string; profile_id: string }
        Returns: string
      }
    }
    Enums: {
      activity_action:
        | "created"
        | "updated"
        | "deleted"
        | "uploaded"
        | "assigned"
        | "unassigned"
        | "status_changed"
        | "completed"
        | "approved"
        | "rejected"
        | "archived"
        | "restored"
        | "commented"
      activity_entity_type:
        | "project"
        | "task"
        | "document"
        | "drawing"
        | "client"
        | "member"
        | "invoice"
        | "payment"
        | "equipment"
        | "meeting"
      conversation_type: "direct" | "project"
      new_project_status:
        | "Em Espera"
        | "Em Curso"
        | "Em Observação"
        | "Concluído"
        | "Cancelado"
      priority_type: "Low" | "Medium" | "High" | "Critical"
      project_member_role:
        | "Manager"
        | "Engineer"
        | "Architect"
        | "Supervisor"
        | "Viewer"
        | "Admin"
      project_role:
        | "Manager"
        | "Coordinator"
        | "Architect"
        | "Engineer"
        | "Consultant"
        | "Other"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      activity_action: [
        "created",
        "updated",
        "deleted",
        "uploaded",
        "assigned",
        "unassigned",
        "status_changed",
        "completed",
        "approved",
        "rejected",
        "archived",
        "restored",
        "commented",
      ],
      activity_entity_type: [
        "project",
        "task",
        "document",
        "drawing",
        "client",
        "member",
        "invoice",
        "payment",
        "equipment",
        "meeting",
      ],
      conversation_type: ["direct", "project"],
      new_project_status: [
        "Em Espera",
        "Em Curso",
        "Em Observação",
        "Concluído",
        "Cancelado",
      ],
      priority_type: ["Low", "Medium", "High", "Critical"],
      project_member_role: [
        "Manager",
        "Engineer",
        "Architect",
        "Supervisor",
        "Viewer",
        "Admin",
      ],
      project_role: [
        "Manager",
        "Coordinator",
        "Architect",
        "Engineer",
        "Consultant",
        "Other",
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
