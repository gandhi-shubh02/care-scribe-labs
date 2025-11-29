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
      exp1_responses: {
        Row: {
          condition_value: string | null
          cost_value: string | null
          id: string
          rpi_count: number | null
          session_id: string
          shared_condition: boolean | null
          shared_cost: boolean | null
          shared_wait_time: boolean | null
          submitted_at: string | null
          wait_time_value: string | null
        }
        Insert: {
          condition_value?: string | null
          cost_value?: string | null
          id?: string
          rpi_count?: number | null
          session_id: string
          shared_condition?: boolean | null
          shared_cost?: boolean | null
          shared_wait_time?: boolean | null
          submitted_at?: string | null
          wait_time_value?: string | null
        }
        Update: {
          condition_value?: string | null
          cost_value?: string | null
          id?: string
          rpi_count?: number | null
          session_id?: string
          shared_condition?: boolean | null
          shared_cost?: boolean | null
          shared_wait_time?: boolean | null
          submitted_at?: string | null
          wait_time_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exp1_responses_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "experiment_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      exp2_verification_flow: {
        Row: {
          completed_successfully: boolean | null
          drop_off_step: string | null
          id: string
          session_id: string
          step_1_complete: string | null
          step_1_start: string | null
          step_2_complete: string | null
          step_2_start: string | null
          step_3_complete: string | null
          step_3_start: string | null
          submitted_at: string | null
          total_duration_seconds: number | null
        }
        Insert: {
          completed_successfully?: boolean | null
          drop_off_step?: string | null
          id?: string
          session_id: string
          step_1_complete?: string | null
          step_1_start?: string | null
          step_2_complete?: string | null
          step_2_start?: string | null
          step_3_complete?: string | null
          step_3_start?: string | null
          submitted_at?: string | null
          total_duration_seconds?: number | null
        }
        Update: {
          completed_successfully?: boolean | null
          drop_off_step?: string | null
          id?: string
          session_id?: string
          step_1_complete?: string | null
          step_1_start?: string | null
          step_2_complete?: string | null
          step_2_start?: string | null
          step_3_complete?: string | null
          step_3_start?: string | null
          submitted_at?: string | null
          total_duration_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exp2_verification_flow_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "experiment_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      exp3_contribution: {
        Row: {
          final_contributed: boolean | null
          id: string
          incentive_shown: boolean | null
          initial_prompt_response: Database["public"]["Enums"]["contribution_response"]
          post_incentive_response:
            | Database["public"]["Enums"]["contribution_response"]
            | null
          session_id: string
          submitted_at: string | null
        }
        Insert: {
          final_contributed?: boolean | null
          id?: string
          incentive_shown?: boolean | null
          initial_prompt_response: Database["public"]["Enums"]["contribution_response"]
          post_incentive_response?:
            | Database["public"]["Enums"]["contribution_response"]
            | null
          session_id: string
          submitted_at?: string | null
        }
        Update: {
          final_contributed?: boolean | null
          id?: string
          incentive_shown?: boolean | null
          initial_prompt_response?: Database["public"]["Enums"]["contribution_response"]
          post_incentive_response?:
            | Database["public"]["Enums"]["contribution_response"]
            | null
          session_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exp3_contribution_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "experiment_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_sessions: {
        Row: {
          completed_at: string | null
          experiment_id: string
          id: string
          started_at: string | null
          status: Database["public"]["Enums"]["experiment_status"] | null
          user_session_id: string
        }
        Insert: {
          completed_at?: string | null
          experiment_id: string
          id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["experiment_status"] | null
          user_session_id: string
        }
        Update: {
          completed_at?: string | null
          experiment_id?: string
          id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["experiment_status"] | null
          user_session_id?: string
        }
        Relationships: []
      }
      providers: {
        Row: {
          avg_billing_clarity: number | null
          avg_claim_process: number | null
          avg_prior_auth: number | null
          avg_responsiveness: number | null
          created_at: string | null
          email: string | null
          id: string
          location: string
          name: string
          phone: string | null
          specialty: string
          total_reviews: number | null
        }
        Insert: {
          avg_billing_clarity?: number | null
          avg_claim_process?: number | null
          avg_prior_auth?: number | null
          avg_responsiveness?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          location: string
          name: string
          phone?: string | null
          specialty: string
          total_reviews?: number | null
        }
        Update: {
          avg_billing_clarity?: number | null
          avg_claim_process?: number | null
          avg_prior_auth?: number | null
          avg_responsiveness?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          location?: string
          name?: string
          phone?: string | null
          specialty?: string
          total_reviews?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          billing_clarity: number | null
          claim_process: number | null
          created_at: string | null
          experience_text: string | null
          id: string
          is_verified: boolean | null
          prior_auth_rating: number | null
          provider_id: string
          responsiveness: number | null
          verification_hash: string
          verification_method: Database["public"]["Enums"]["verification_method"]
        }
        Insert: {
          billing_clarity?: number | null
          claim_process?: number | null
          created_at?: string | null
          experience_text?: string | null
          id?: string
          is_verified?: boolean | null
          prior_auth_rating?: number | null
          provider_id: string
          responsiveness?: number | null
          verification_hash: string
          verification_method: Database["public"]["Enums"]["verification_method"]
        }
        Update: {
          billing_clarity?: number | null
          claim_process?: number | null
          created_at?: string | null
          experience_text?: string | null
          id?: string
          is_verified?: boolean | null
          prior_auth_rating?: number | null
          provider_id?: string
          responsiveness?: number | null
          verification_hash?: string
          verification_method?: Database["public"]["Enums"]["verification_method"]
        }
        Relationships: [
          {
            foreignKeyName: "reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      verifications: {
        Row: {
          id: string
          method: string
          proof_data: Json | null
          review_id: string
          status: string | null
          verified_at: string | null
        }
        Insert: {
          id?: string
          method: string
          proof_data?: Json | null
          review_id: string
          status?: string | null
          verified_at?: string | null
        }
        Update: {
          id?: string
          method?: string
          proof_data?: Json | null
          review_id?: string
          status?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verifications_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
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
      contribution_response: "yes" | "no"
      experiment_status: "started" | "completed" | "abandoned"
      verification_method: "redacted_document" | "zkp_insurer"
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
      contribution_response: ["yes", "no"],
      experiment_status: ["started", "completed", "abandoned"],
      verification_method: ["redacted_document", "zkp_insurer"],
    },
  },
} as const
