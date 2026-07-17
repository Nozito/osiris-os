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
      client_branding: {
        Row: {
          client_id: string
          colors: Json
          created_at: string
          fonts: Json
          id: string
          images: Json
          inspirations: Json
          logo_url: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          colors?: Json
          created_at?: string
          fonts?: Json
          id?: string
          images?: Json
          inspirations?: Json
          logo_url?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          colors?: Json
          created_at?: string
          fonts?: Json
          id?: string
          images?: Json
          inspirations?: Json
          logo_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_branding_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_business_profiles: {
        Row: {
          advantages: string | null
          age_range: string | null
          avg_budget: number | null
          client_id: string
          communication_tone: string | null
          competitors: string | null
          created_at: string
          differentiation: string | null
          goals: string | null
          id: string
          ideal_client: string | null
          objections: string | null
          pain_points: string | null
          pricing: Json
          products: Json
          promise: string | null
          services: Json
          situation: string | null
          updated_at: string
          values: string | null
        }
        Insert: {
          advantages?: string | null
          age_range?: string | null
          avg_budget?: number | null
          client_id: string
          communication_tone?: string | null
          competitors?: string | null
          created_at?: string
          differentiation?: string | null
          goals?: string | null
          id?: string
          ideal_client?: string | null
          objections?: string | null
          pain_points?: string | null
          pricing?: Json
          products?: Json
          promise?: string | null
          services?: Json
          situation?: string | null
          updated_at?: string
          values?: string | null
        }
        Update: {
          advantages?: string | null
          age_range?: string | null
          avg_budget?: number | null
          client_id?: string
          communication_tone?: string | null
          competitors?: string | null
          created_at?: string
          differentiation?: string | null
          goals?: string | null
          id?: string
          ideal_client?: string | null
          objections?: string | null
          pain_points?: string | null
          pricing?: Json
          products?: Json
          promise?: string | null
          services?: Json
          situation?: string | null
          updated_at?: string
          values?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_business_profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          company_name: string
          contact_name: string | null
          created_at: string
          created_by: string | null
          current_website: string | null
          email: string | null
          id: string
          owner_profile_id: string | null
          phone: string | null
          sector: string | null
          social_links: Json
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_name: string
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          current_website?: string | null
          email?: string | null
          id?: string
          owner_profile_id?: string | null
          phone?: string | null
          sector?: string | null
          social_links?: Json
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_name?: string
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          current_website?: string | null
          email?: string | null
          id?: string
          owner_profile_id?: string | null
          phone?: string | null
          sector?: string | null
          social_links?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_owner_profile_id_fkey"
            columns: ["owner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: Database["public"]["Enums"]["document_category"]
          client_id: string
          created_at: string
          file_name: string
          file_type: string | null
          id: string
          project_id: string | null
          size_bytes: number | null
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["document_category"]
          client_id: string
          created_at?: string
          file_name: string
          file_type?: string | null
          id?: string
          project_id?: string | null
          size_bytes?: number | null
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["document_category"]
          client_id?: string
          created_at?: string
          file_name?: string
          file_type?: string | null
          id?: string
          project_id?: string | null
          size_bytes?: number | null
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          description: string | null
          id: string
          invoice_id: string
          label: string
          position: number
          quantity: number
          unit_price: number
        }
        Insert: {
          description?: string | null
          id?: string
          invoice_id: string
          label: string
          position?: number
          quantity?: number
          unit_price?: number
        }
        Update: {
          description?: string | null
          id?: string
          invoice_id?: string
          label?: string
          position?: number
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          due_at: string | null
          id: string
          issued_at: string | null
          number: string | null
          paid_at: string | null
          quote_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          updated_at: string
          vat_rate: number
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          due_at?: string | null
          id?: string
          issued_at?: string | null
          number?: string | null
          paid_at?: string | null
          quote_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
          vat_rate?: number
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          due_at?: string | null
          id?: string
          issued_at?: string | null
          number?: string | null
          paid_at?: string | null
          quote_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_scores: {
        Row: {
          budget_score: number
          company_size_score: number
          computed_at: string
          id: string
          lead_id: string
          need_clarity_score: number
          sector_score: number
          total_score: number
          urgency_score: number
        }
        Insert: {
          budget_score?: number
          company_size_score?: number
          computed_at?: string
          id?: string
          lead_id: string
          need_clarity_score?: number
          sector_score?: number
          total_score?: number
          urgency_score?: number
        }
        Update: {
          budget_score?: number
          company_size_score?: number
          computed_at?: string
          id?: string
          lead_id?: string
          need_clarity_score?: number
          sector_score?: number
          total_score?: number
          urgency_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "lead_scores_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          budget: number | null
          company: string | null
          converted_client_id: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          need: string | null
          notes: string | null
          phone: string | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          urgency: string | null
        }
        Insert: {
          assigned_to?: string | null
          budget?: number | null
          company?: string | null
          converted_client_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          need?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          assigned_to?: string | null
          budget?: number | null
          company?: string | null
          converted_client_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          need?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_client_id_fkey"
            columns: ["converted_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          profile_id: string
          read_at: string | null
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          profile_id: string
          read_at?: string | null
          title: string
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          profile_id?: string
          read_at?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      project_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["project_status"] | null
          id: string
          note: string | null
          project_id: string
          to_status: Database["public"]["Enums"]["project_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["project_status"] | null
          id?: string
          note?: string | null
          project_id: string
          to_status: Database["public"]["Enums"]["project_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["project_status"] | null
          id?: string
          note?: string | null
          project_id?: string
          to_status?: Database["public"]["Enums"]["project_status"]
        }
        Relationships: [
          {
            foreignKeyName: "project_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_status_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          client_id: string
          created_at: string
          created_by: string | null
          delivery_date: string | null
          description: string | null
          id: string
          name: string
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
        }
        Insert: {
          budget?: number | null
          client_id: string
          created_at?: string
          created_by?: string | null
          delivery_date?: string | null
          description?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Update: {
          budget?: number | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          delivery_date?: string | null
          description?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          description: string | null
          id: string
          label: string
          position: number
          quantity: number
          quote_id: string
          unit_price: number
        }
        Insert: {
          description?: string | null
          id?: string
          label: string
          position?: number
          quantity?: number
          quote_id: string
          unit_price?: number
        }
        Update: {
          description?: string | null
          id?: string
          label?: string
          position?: number
          quantity?: number
          quote_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          id: string
          issued_at: string | null
          number: string | null
          project_id: string | null
          signature_ip: string | null
          signed_at: string | null
          signed_by_name: string | null
          status: Database["public"]["Enums"]["quote_status"]
          terms: string | null
          updated_at: string
          valid_until: string | null
          vat_rate: number
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          issued_at?: string | null
          number?: string | null
          project_id?: string | null
          signature_ip?: string | null
          signed_at?: string | null
          signed_by_name?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          terms?: string | null
          updated_at?: string
          valid_until?: string | null
          vat_rate?: number
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          issued_at?: string | null
          number?: string | null
          project_id?: string | null
          signature_ip?: string | null
          signed_at?: string | null
          signed_by_name?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          terms?: string | null
          updated_at?: string
          valid_until?: string | null
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_staff: { Args: never; Returns: boolean }
      owns_client: { Args: { target_client_id: string }; Returns: boolean }
    }
    Enums: {
      document_category: "image" | "pdf" | "contract" | "other"
      invoice_status: "created" | "sent" | "paid" | "overdue" | "cancelled"
      lead_status:
        | "new"
        | "qualification"
        | "meeting"
        | "quote_sent"
        | "signed"
        | "lost"
      project_status:
        | "onboarding"
        | "design"
        | "development"
        | "client_validation"
        | "live"
        | "maintenance"
      quote_status:
        | "draft"
        | "sent"
        | "viewed"
        | "accepted"
        | "refused"
        | "converted"
      user_role: "admin" | "employee" | "client"
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
      document_category: ["image", "pdf", "contract", "other"],
      invoice_status: ["created", "sent", "paid", "overdue", "cancelled"],
      lead_status: [
        "new",
        "qualification",
        "meeting",
        "quote_sent",
        "signed",
        "lost",
      ],
      project_status: [
        "onboarding",
        "design",
        "development",
        "client_validation",
        "live",
        "maintenance",
      ],
      quote_status: [
        "draft",
        "sent",
        "viewed",
        "accepted",
        "refused",
        "converted",
      ],
      user_role: ["admin", "employee", "client"],
    },
  },
} as const
