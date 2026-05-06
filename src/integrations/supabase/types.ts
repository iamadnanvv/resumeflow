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
      applications: {
        Row: {
          applied_at: string | null
          company: string
          cover_letter_id: string | null
          created_at: string
          id: string
          job_description: string | null
          job_url: string | null
          notes: string | null
          position: number
          resume_id: string | null
          role: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          company: string
          cover_letter_id?: string | null
          created_at?: string
          id?: string
          job_description?: string | null
          job_url?: string | null
          notes?: string | null
          position?: number
          resume_id?: string | null
          role?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          company?: string
          cover_letter_id?: string | null
          created_at?: string
          id?: string
          job_description?: string | null
          job_url?: string | null
          notes?: string | null
          position?: number
          resume_id?: string | null
          role?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_cover_letter_id_fkey"
            columns: ["cover_letter_id"]
            isOneToOne: false
            referencedRelation: "cover_letters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      cover_letters: {
        Row: {
          company: string | null
          content: string
          created_at: string
          id: string
          job_title: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          content?: string
          created_at?: string
          id?: string
          job_title?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          content?: string
          created_at?: string
          id?: string
          job_title?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          plan: Database["public"]["Enums"]["app_plan"]
          razorpay_order_id: string
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          plan: Database["public"]["Enums"]["app_plan"]
          razorpay_order_id: string
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          plan?: Database["public"]["Enums"]["app_plan"]
          razorpay_order_id?: string
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          plan: Database["public"]["Enums"]["app_plan"]
          referral_code: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"] | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          plan?: Database["public"]["Enums"]["app_plan"]
          referral_code?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          plan?: Database["public"]["Enums"]["app_plan"]
          referral_code?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
          username?: string | null
        }
        Relationships: []
      }
      referral_discount_redemptions: {
        Row: {
          created_at: string
          discount_paise: number
          id: string
          order_id: string | null
          payment_id: string | null
          plan: Database["public"]["Enums"]["app_plan"]
          referee_id: string
          referral_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_paise?: number
          id?: string
          order_id?: string | null
          payment_id?: string | null
          plan: Database["public"]["Enums"]["app_plan"]
          referee_id: string
          referral_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_paise?: number
          id?: string
          order_id?: string | null
          payment_id?: string | null
          plan?: Database["public"]["Enums"]["app_plan"]
          referee_id?: string
          referral_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          code: string
          created_at: string
          id: string
          referee_id: string
          referrer_id: string
          reward_amount: number
          rewarded_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          referee_id: string
          referrer_id: string
          reward_amount?: number
          rewarded_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          referee_id?: string
          referrer_id?: string
          reward_amount?: number
          rewarded_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      resume_creation_events: {
        Row: {
          ai_assist_count: number
          cloned_from_resume_id: string | null
          created_at: string
          id: string
          metadata: Json
          resume_id: string
          source: Database["public"]["Enums"]["resume_creation_source"]
          template_slug: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_assist_count?: number
          cloned_from_resume_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          resume_id: string
          source?: Database["public"]["Enums"]["resume_creation_source"]
          template_slug?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_assist_count?: number
          cloned_from_resume_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          resume_id?: string
          source?: Database["public"]["Enums"]["resume_creation_source"]
          template_slug?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resume_views: {
        Row: {
          country: string | null
          id: string
          ip_hash: string | null
          referrer: string | null
          resume_id: string
          viewed_at: string
        }
        Insert: {
          country?: string | null
          id?: string
          ip_hash?: string | null
          referrer?: string | null
          resume_id: string
          viewed_at?: string
        }
        Update: {
          country?: string | null
          id?: string
          ip_hash?: string | null
          referrer?: string | null
          resume_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_views_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          ats_score: number | null
          cloned_from_resume_id: string | null
          content: Json
          created_at: string
          id: string
          is_public: boolean
          public_slug: string | null
          public_view_count: number
          showcase_admin_notes: string | null
          showcase_anonymized_content: Json | null
          showcase_industry: string | null
          showcase_reviewed_at: string | null
          showcase_reviewed_by: string | null
          showcase_status: Database["public"]["Enums"]["showcase_status"]
          showcase_submitted_at: string | null
          showcase_title: string | null
          template_slug: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ats_score?: number | null
          cloned_from_resume_id?: string | null
          content?: Json
          created_at?: string
          id?: string
          is_public?: boolean
          public_slug?: string | null
          public_view_count?: number
          showcase_admin_notes?: string | null
          showcase_anonymized_content?: Json | null
          showcase_industry?: string | null
          showcase_reviewed_at?: string | null
          showcase_reviewed_by?: string | null
          showcase_status?: Database["public"]["Enums"]["showcase_status"]
          showcase_submitted_at?: string | null
          showcase_title?: string | null
          template_slug?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ats_score?: number | null
          cloned_from_resume_id?: string | null
          content?: Json
          created_at?: string
          id?: string
          is_public?: boolean
          public_slug?: string | null
          public_view_count?: number
          showcase_admin_notes?: string | null
          showcase_anonymized_content?: Json | null
          showcase_industry?: string | null
          showcase_reviewed_at?: string | null
          showcase_reviewed_by?: string | null
          showcase_status?: Database["public"]["Enums"]["showcase_status"]
          showcase_submitted_at?: string | null
          showcase_title?: string | null
          template_slug?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      student_verifications: {
        Row: {
          attempts: number
          code_hash: string | null
          created_at: string
          email: string
          expires_at: string | null
          id: string
          kind: Database["public"]["Enums"]["verification_kind"]
          updated_at: string
          user_id: string
          verified: boolean
          verified_at: string | null
        }
        Insert: {
          attempts?: number
          code_hash?: string | null
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["verification_kind"]
          updated_at?: string
          user_id: string
          verified?: boolean
          verified_at?: string | null
        }
        Update: {
          attempts?: number
          code_hash?: string | null
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["verification_kind"]
          updated_at?: string
          user_id?: string
          verified?: boolean
          verified_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: Database["public"]["Enums"]["app_plan"]
          razorpay_customer_id: string | null
          razorpay_subscription_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan: Database["public"]["Enums"]["app_plan"]
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["app_plan"]
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_premium: boolean
          name: string
          preview_url: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_premium?: boolean
          name: string
          preview_url?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_premium?: boolean
          name?: string
          preview_url?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          balance: number
          lifetime_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          lifetime_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          lifetime_earned?: number
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gen_referral_code: { Args: never; Returns: string }
      get_phone_by_username: { Args: { _username: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_ai_assist: { Args: { _resume_id: string }; Returns: undefined }
      is_self_referral: {
        Args: { _referee: string; _referrer: string }
        Returns: boolean
      }
      is_verified_for: {
        Args: {
          _kind: Database["public"]["Enums"]["verification_kind"]
          _user_id: string
        }
        Returns: boolean
      }
      is_verified_student: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_plan:
        | "free"
        | "pro"
        | "premium"
        | "student_basic"
        | "student_premium"
        | "student_pro"
        | "teacher_basic"
        | "teacher_premium"
        | "teacher_pro"
      app_role: "admin" | "user"
      application_status:
        | "saved"
        | "applied"
        | "interview"
        | "offer"
        | "rejected"
      payment_status: "created" | "paid" | "failed" | "refunded"
      resume_creation_source:
        | "scratch"
        | "template"
        | "onboarding"
        | "cloned_showcase"
        | "imported"
      showcase_status: "none" | "submitted" | "approved" | "rejected"
      subscription_status: "active" | "cancelled" | "expired" | "pending"
      user_type: "student" | "professional" | "teacher"
      verification_kind: "student" | "teacher"
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
      app_plan: [
        "free",
        "pro",
        "premium",
        "student_basic",
        "student_premium",
        "student_pro",
        "teacher_basic",
        "teacher_premium",
        "teacher_pro",
      ],
      app_role: ["admin", "user"],
      application_status: [
        "saved",
        "applied",
        "interview",
        "offer",
        "rejected",
      ],
      payment_status: ["created", "paid", "failed", "refunded"],
      resume_creation_source: [
        "scratch",
        "template",
        "onboarding",
        "cloned_showcase",
        "imported",
      ],
      showcase_status: ["none", "submitted", "approved", "rejected"],
      subscription_status: ["active", "cancelled", "expired", "pending"],
      user_type: ["student", "professional", "teacher"],
      verification_kind: ["student", "teacher"],
    },
  },
} as const
