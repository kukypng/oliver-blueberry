export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_images: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_name: string
          file_url: string
          id: string
          name: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          file_name: string
          file_url: string
          id?: string
          name: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_name?: string
          file_url?: string
          id?: string
          name?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      budget_deletion_audit: {
        Row: {
          budget_data: Json
          budget_id: string
          can_restore: boolean | null
          created_at: string | null
          deleted_by: string
          deletion_reason: string | null
          deletion_type: string
          id: string
          parts_data: Json | null
        }
        Insert: {
          budget_data: Json
          budget_id: string
          can_restore?: boolean | null
          created_at?: string | null
          deleted_by: string
          deletion_reason?: string | null
          deletion_type: string
          id?: string
          parts_data?: Json | null
        }
        Update: {
          budget_data?: Json
          budget_id?: string
          can_restore?: boolean | null
          created_at?: string | null
          deleted_by?: string
          deletion_reason?: string | null
          deletion_type?: string
          id?: string
          parts_data?: Json | null
        }
        Relationships: []
      }
      budget_parts: {
        Row: {
          brand_id: string | null
          budget_id: string
          cash_price: number | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          installment_price: number | null
          name: string
          part_type: string | null
          price: number
          quantity: number
          warranty_months: number | null
        }
        Insert: {
          brand_id?: string | null
          budget_id: string
          cash_price?: number | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          installment_price?: number | null
          name: string
          part_type?: string | null
          price: number
          quantity?: number
          warranty_months?: number | null
        }
        Update: {
          brand_id?: string | null
          budget_id?: string
          cash_price?: number | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          installment_price?: number | null
          name?: string
          part_type?: string | null
          price?: number
          quantity?: number
          warranty_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_parts_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_budget_parts_budget_id"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          approved_at: string | null
          cash_price: number | null
          client_id: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          delivery_confirmed_at: string | null
          delivery_date: string | null
          device_model: string
          device_type: string
          expires_at: string | null
          id: string
          includes_delivery: boolean | null
          includes_screen_protector: boolean | null
          installment_price: number | null
          installments: number | null
          is_delivered: boolean
          is_paid: boolean
          notes: string | null
          owner_id: string
          part_quality: string | null
          part_type: string | null
          payment_condition: string | null
          payment_confirmed_at: string | null
          search_vector: unknown | null
          status: string
          total_price: number
          updated_at: string
          valid_until: string | null
          warranty_months: number | null
          workflow_status: string
        }
        Insert: {
          approved_at?: string | null
          cash_price?: number | null
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          delivery_confirmed_at?: string | null
          delivery_date?: string | null
          device_model: string
          device_type: string
          expires_at?: string | null
          id?: string
          includes_delivery?: boolean | null
          includes_screen_protector?: boolean | null
          installment_price?: number | null
          installments?: number | null
          is_delivered?: boolean
          is_paid?: boolean
          notes?: string | null
          owner_id?: string
          part_quality?: string | null
          part_type?: string | null
          payment_condition?: string | null
          payment_confirmed_at?: string | null
          search_vector?: unknown | null
          status?: string
          total_price: number
          updated_at?: string
          valid_until?: string | null
          warranty_months?: number | null
          workflow_status?: string
        }
        Update: {
          approved_at?: string | null
          cash_price?: number | null
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          delivery_confirmed_at?: string | null
          delivery_date?: string | null
          device_model?: string
          device_type?: string
          expires_at?: string | null
          id?: string
          includes_delivery?: boolean | null
          includes_screen_protector?: boolean | null
          installment_price?: number | null
          installments?: number | null
          is_delivered?: boolean
          is_paid?: boolean
          notes?: string | null
          owner_id?: string
          part_quality?: string | null
          part_type?: string | null
          payment_condition?: string | null
          payment_confirmed_at?: string | null
          search_vector?: unknown | null
          status?: string
          total_price?: number
          updated_at?: string
          valid_until?: string | null
          warranty_months?: number | null
          workflow_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          is_default: boolean | null
          is_favorite: boolean | null
          name: string
          notes: string | null
          phone: string
          state: string | null
          tags: string[] | null
          updated_at: string
          user_id: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_default?: boolean | null
          is_favorite?: boolean | null
          name: string
          notes?: string | null
          phone: string
          state?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_default?: boolean | null
          is_favorite?: boolean | null
          name?: string
          notes?: string | null
          phone?: string
          state?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      device_types: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      game_settings: {
        Row: {
          bug_damage: number | null
          bug_spawn_percentage: number | null
          created_at: string
          hit_sound_enabled: boolean | null
          hit_sound_volume: number | null
          id: string
          speed_bug_spawn_rate: number
          speed_bug_speed_multiplier: number
          updated_at: string
        }
        Insert: {
          bug_damage?: number | null
          bug_spawn_percentage?: number | null
          created_at?: string
          hit_sound_enabled?: boolean | null
          hit_sound_volume?: number | null
          id?: string
          speed_bug_spawn_rate?: number
          speed_bug_speed_multiplier?: number
          updated_at?: string
        }
        Update: {
          bug_damage?: number | null
          bug_spawn_percentage?: number | null
          created_at?: string
          hit_sound_enabled?: boolean | null
          hit_sound_volume?: number | null
          id?: string
          speed_bug_spawn_rate?: number
          speed_bug_speed_multiplier?: number
          updated_at?: string
        }
        Relationships: []
      }
      licenses: {
        Row: {
          activated_at: string | null
          code: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          last_validation: string | null
          user_id: string | null
        }
        Insert: {
          activated_at?: string | null
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_validation?: string | null
          user_id?: string | null
        }
        Update: {
          activated_at?: string | null
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_validation?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ranking_invaders: {
        Row: {
          created_at: string
          id: string
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          score: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ranking_invaders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_profiles: {
        Row: {
          address: string
          cnpj: string | null
          contact_phone: string
          created_at: string
          id: string
          logo_url: string | null
          shop_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          cnpj?: string | null
          contact_phone: string
          created_at?: string
          id?: string
          logo_url?: string | null
          shop_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          cnpj?: string | null
          contact_phone?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          shop_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          additional_info: string
          benefits_data: Json | null
          benefits_section_subtitle: string | null
          benefits_section_title: string | null
          created_at: string
          cta_button_text: string
          dev_warning_message: string | null
          dev_warning_title: string | null
          faq_data: Json | null
          faq_section_subtitle: string | null
          faq_section_title: string | null
          id: string
          page_subtitle: string
          page_title: string
          payment_url: string
          plan_currency: string
          plan_description: string
          plan_features: Json
          plan_name: string
          plan_period: string
          plan_price: number
          popular_badge_text: string
          show_benefits_section: boolean | null
          show_dev_warning: boolean
          show_faq_section: boolean | null
          show_popular_badge: boolean
          show_support_info: boolean
          show_testimonials_section: boolean | null
          support_text: string
          testimonials_data: Json | null
          testimonials_section_subtitle: string | null
          testimonials_section_title: string | null
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          additional_info?: string
          benefits_data?: Json | null
          benefits_section_subtitle?: string | null
          benefits_section_title?: string | null
          created_at?: string
          cta_button_text?: string
          dev_warning_message?: string | null
          dev_warning_title?: string | null
          faq_data?: Json | null
          faq_section_subtitle?: string | null
          faq_section_title?: string | null
          id?: string
          page_subtitle?: string
          page_title?: string
          payment_url?: string
          plan_currency?: string
          plan_description?: string
          plan_features?: Json
          plan_name?: string
          plan_period?: string
          plan_price?: number
          popular_badge_text?: string
          show_benefits_section?: boolean | null
          show_dev_warning?: boolean
          show_faq_section?: boolean | null
          show_popular_badge?: boolean
          show_support_info?: boolean
          show_testimonials_section?: boolean | null
          support_text?: string
          testimonials_data?: Json | null
          testimonials_section_subtitle?: string | null
          testimonials_section_title?: string | null
          updated_at?: string
          whatsapp_number?: string
        }
        Update: {
          additional_info?: string
          benefits_data?: Json | null
          benefits_section_subtitle?: string | null
          benefits_section_title?: string | null
          created_at?: string
          cta_button_text?: string
          dev_warning_message?: string | null
          dev_warning_title?: string | null
          faq_data?: Json | null
          faq_section_subtitle?: string | null
          faq_section_title?: string | null
          id?: string
          page_subtitle?: string
          page_title?: string
          payment_url?: string
          plan_currency?: string
          plan_description?: string
          plan_features?: Json
          plan_name?: string
          plan_period?: string
          plan_price?: number
          popular_badge_text?: string
          show_benefits_section?: boolean | null
          show_dev_warning?: boolean
          show_faq_section?: boolean | null
          show_popular_badge?: boolean
          show_support_info?: boolean
          show_testimonials_section?: boolean | null
          support_text?: string
          testimonials_data?: Json | null
          testimonials_section_subtitle?: string | null
          testimonials_section_title?: string | null
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          advanced_features_enabled: boolean
          budget_limit: number | null
          budget_warning_days: number
          budget_warning_enabled: boolean
          created_at: string
          expiration_date: string
          id: string
          is_active: boolean
          name: string
          role: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          advanced_features_enabled?: boolean
          budget_limit?: number | null
          budget_warning_days?: number
          budget_warning_enabled?: boolean
          created_at?: string
          expiration_date?: string
          id: string
          is_active?: boolean
          name: string
          role?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          advanced_features_enabled?: boolean
          budget_limit?: number | null
          budget_warning_days?: number
          budget_warning_enabled?: boolean
          created_at?: string
          expiration_date?: string
          id?: string
          is_active?: boolean
          name?: string
          role?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      warranty_periods: {
        Row: {
          created_at: string
          id: string
          label: string
          months: number
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          months: number
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          months?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_license: {
        Args: { license_code: string; p_user_id: string }
        Returns: Json
      }
      activate_license_enhanced: {
        Args: { license_code: string; p_user_id: string }
        Returns: Json
      }
      admin_activate_user_license: {
        Args: { p_user_id: string }
        Returns: Json
      }
      admin_create_bulk_licenses: {
        Args: { p_quantity: number; p_expires_in_days?: number }
        Returns: Json
      }
      admin_create_license: {
        Args: { p_expires_at?: string }
        Returns: Json
      }
      admin_deactivate_user_license: {
        Args: { p_user_id: string }
        Returns: Json
      }
      admin_delete_user: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      admin_get_all_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          email: string
          role: string
          license_active: boolean
          expiration_date: string
          created_at: string
          last_sign_in_at: string
          budget_count: number
        }[]
      }
      admin_get_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      admin_get_license_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      admin_get_licenses_with_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          code: string
          user_id: string
          user_email: string
          user_name: string
          expires_at: string
          created_at: string
          is_active: boolean
        }[]
      }
      admin_get_logs: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          admin_user_id: string
          admin_name: string
          target_user_id: string
          target_name: string
          action: string
          details: Json
          created_at: string
        }[]
      }
      admin_get_recent_activity: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      admin_get_system_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      admin_get_user_metrics: {
        Args: { p_user_id?: string }
        Returns: Json
      }
      admin_get_user_real_email: {
        Args: { p_user_id: string }
        Returns: string
      }
      admin_get_users_paginated: {
        Args: {
          p_page?: number
          p_limit?: number
          p_search?: string
          p_role_filter?: string
          p_status_filter?: string
          p_sort_by?: string
          p_sort_order?: string
        }
        Returns: Json
      }
      admin_renew_license: {
        Args: { license_id: string; additional_days?: number }
        Returns: Json
      }
      admin_renew_user_license: {
        Args: { p_user_id: string; p_additional_days: number }
        Returns: boolean
      }
      admin_update_user: {
        Args: {
          p_user_id: string
          p_name?: string
          p_role?: string
          p_is_active?: boolean
          p_expiration_date?: string
        }
        Returns: boolean
      }
      audit_rls_policies: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          rls_enabled: boolean
          policy_count: number
          security_status: string
          recommendations: string
        }[]
      }
      check_budgets_integrity: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_budgets: number
          orphaned_budgets: number
          valid_budgets: number
        }[]
      }
      check_shop_profile_exists: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      cleanup_old_deleted_budgets: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_logs: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      count_active_budgets: {
        Args: { p_user_id: string }
        Returns: number
      }
      count_user_budgets: {
        Args: { p_user_id: string }
        Returns: number
      }
      debug_current_user: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          user_email: string
          user_role: string
          is_active: boolean
          is_admin: boolean
        }[]
      }
      debug_user_context: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      detect_sql_injection: {
        Args: { input_text: string }
        Returns: boolean
      }
      fix_orphaned_budgets: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      generate_license_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_allowed_redirect_domains: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_budgets_with_part_quality: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          client_name: string
          client_phone: string
          device_type: string
          device_model: string
          issue: string
          part_quality: string
          status: string
          workflow_status: string
          total_price: number
          cash_price: number
          installment_price: number
          delivery_date: string
          expires_at: string
          valid_until: string
          created_at: string
          updated_at: string
          is_paid: boolean
          is_delivered: boolean
        }[]
      }
      get_client_budget_count: {
        Args: { client_id: string }
        Returns: number
      }
      get_expiring_budgets: {
        Args: { p_user_id: string }
        Returns: {
          budget_id: string
          client_name: string
          expires_at: string
          days_until_expiry: number
        }[]
      }
      get_optimized_budgets: {
        Args: {
          p_user_id: string
          p_limit?: number
          p_offset?: number
          p_search_term?: string
        }
        Returns: {
          id: string
          client_name: string
          client_phone: string
          device_type: string
          device_model: string
          total_price: number
          workflow_status: string
          created_at: string
          updated_at: string
        }[]
      }
      get_shop_profile: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_top_rankings: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_name: string
          score: number
          created_at: string
        }[]
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_username_from_email: {
        Args: { email: string }
        Returns: string
      }
      has_reached_budget_limit: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      insert_shop_profile: {
        Args: {
          p_user_id: string
          p_shop_name: string
          p_address: string
          p_contact_phone: string
        }
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_domain_allowed: {
        Args: { domain: string }
        Returns: boolean
      }
      is_license_valid: {
        Args: { p_user_id?: string }
        Returns: boolean
      }
      is_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_license_active: {
        Args: { p_user_id?: string }
        Returns: boolean
      }
      log_admin_access: {
        Args: {
          p_action: string
          p_resource_type?: string
          p_resource_id?: string
          p_details?: Json
        }
        Returns: undefined
      }
      log_admin_action: {
        Args: { p_target_user_id: string; p_action: string; p_details?: Json }
        Returns: undefined
      }
      restore_deleted_budget: {
        Args: { p_budget_id: string }
        Returns: Json
      }
      security_health_check: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          rls_enabled: boolean
          policy_count: number
          security_status: string
        }[]
      }
      set_user_budget_limit: {
        Args: { p_user_id: string; p_budget_limit: number }
        Returns: boolean
      }
      soft_delete_all_user_budgets: {
        Args: { p_deletion_reason?: string }
        Returns: Json
      }
      soft_delete_budget_with_audit: {
        Args: { p_budget_id: string; p_deletion_reason?: string }
        Returns: Json
      }
      test_admin_permissions: {
        Args: Record<PropertyKey, never>
        Returns: {
          test_name: string
          result: boolean
          details: string
        }[]
      }
      test_user_permissions: {
        Args: Record<PropertyKey, never>
        Returns: {
          test_name: string
          result: boolean
          description: string
        }[]
      }
      update_shop_profile: {
        Args: {
          p_user_id: string
          p_shop_name: string
          p_address: string
          p_contact_phone: string
        }
        Returns: boolean
      }
      user_permissions_check: {
        Args: { target_user_id?: string }
        Returns: {
          user_id: string
          user_name: string
          user_role: string
          is_active: boolean
          is_admin: boolean
          can_manage_users: boolean
          can_manage_settings: boolean
          budget_count: number
        }[]
      }
      validate_admin_email_change: {
        Args: { p_user_id: string; p_new_email: string }
        Returns: Json
      }
      validate_admin_password_reset: {
        Args: { p_user_id: string; p_new_password: string }
        Returns: Json
      }
      validate_rls_security: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          rls_enabled: boolean
          policy_count: number
          security_status: string
        }[]
      }
      validate_user_license: {
        Args: { p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      payment_status: "succeeded" | "failed" | "pending" | "refunded"
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
      payment_status: ["succeeded", "failed", "pending", "refunded"],
    },
  },
} as const
