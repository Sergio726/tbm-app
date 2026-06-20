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
          disc_status: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          company_id?: string | null;
          full_name?: string | null;
          email?: string | null;
          role?: string | null;
          disc_status?: string | null;
          created_at?: string | null;
        };
        Update: {
          company_id?: string | null;
          full_name?: string | null;
          email?: string | null;
          role?: string | null;
          disc_status?: string | null;
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
    };
    Views: Record<string, never>;
    Functions: {
      is_platform_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
