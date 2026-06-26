// Tipos de schema compartidos por el panel admin (apps/admin).
// SUBSET deliberado: solo las tablas que el admin consulta hoy (A1). Se amplía
// por sprint (company_credits/credit_transactions en A3, etc.).
//
// ⚠️ Mantener en sync con el schema real (Supabase). La app web (apps/web) tiene
// su propia copia completa en src/types/database.ts; reconciliar a single-source
// más adelante.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          owner_id: string | null;
          sector: string | null;
          team_size: number | null;
          plan: string | null;
          status: string;
          suspended_at: string | null;
          settings: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id?: string | null;
          sector?: string | null;
          team_size?: number | null;
          plan?: string | null;
          status?: string;
          suspended_at?: string | null;
          settings?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string | null;
          sector?: string | null;
          team_size?: number | null;
          plan?: string | null;
          status?: string;
          suspended_at?: string | null;
          settings?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          company_id: string | null;
          full_name: string | null;
          email: string | null;
          role: string | null;
          cargo: string | null;
          disc_status: string | null;
          onboarding_completed: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          company_id?: string | null;
          full_name?: string | null;
          email?: string | null;
          role?: string | null;
          cargo?: string | null;
          disc_status?: string | null;
          onboarding_completed?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          company_id?: string | null;
          full_name?: string | null;
          email?: string | null;
          role?: string | null;
          cargo?: string | null;
          disc_status?: string | null;
          onboarding_completed?: boolean | null;
        };
        Relationships: [];
      };
      platform_admins: {
        Row: {
          id: string;
          user_id: string;
          role_interno: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role_interno?: string;
          created_at?: string;
        };
        Update: {
          role_interno?: string;
        };
        Relationships: [];
      };
      company_credits: {
        Row: { company_id: string; balance: number; updated_at: string };
        Insert: { company_id: string; balance?: number; updated_at?: string };
        Update: { balance?: number; updated_at?: string };
        Relationships: [];
      };
      credit_transactions: {
        Row: {
          id: string;
          company_id: string;
          delta: number;
          type: string;
          reason: string | null;
          actor_id: string | null;
          ref: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          delta: number;
          type: string;
          reason?: string | null;
          actor_id?: string | null;
          ref?: string | null;
          created_at?: string;
        };
        Update: { reason?: string | null };
        Relationships: [];
      };
      ai_config: {
        Row: {
          id: string;
          scope: string;
          company_id: string | null;
          provider: string;
          model: string;
          api_key_ref: string | null;
          system_prompt: string | null;
          temperature: number;
          enabled: boolean;
          persona_name: string | null;
          tone: string | null;
          welcome: string | null;
          suggested_prompts: Json | null;
          features: Json;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          scope?: string;
          company_id?: string | null;
          provider?: string;
          model?: string;
          api_key_ref?: string | null;
          system_prompt?: string | null;
          temperature?: number;
          enabled?: boolean;
          persona_name?: string | null;
          tone?: string | null;
          welcome?: string | null;
          suggested_prompts?: Json | null;
          features?: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          provider?: string;
          model?: string;
          api_key_ref?: string | null;
          system_prompt?: string | null;
          temperature?: number;
          enabled?: boolean;
          persona_name?: string | null;
          tone?: string | null;
          welcome?: string | null;
          suggested_prompts?: Json | null;
          features?: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      coach_assignments: {
        Row: { id: string; coach_id: string; company_id: string; created_at: string | null };
        Insert: { id?: string; coach_id: string; company_id: string; created_at?: string | null };
        Update: { coach_id?: string; company_id?: string };
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          target_type: string | null;
          target_id: string | null;
          before: Json | null;
          after: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          target_type?: string | null;
          target_id?: string | null;
          before?: Json | null;
          after?: Json | null;
          created_at?: string;
        };
        Update: { action?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_platform_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      grant_credits: {
        Args: {
          p_company_id: string;
          p_amount: number;
          p_reason?: string | null;
          p_type?: string;
        };
        Returns: Json;
      };
      ai_set_api_key: {
        Args: { p_secret: string };
        Returns: string;
      };
      ai_get_api_key: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
