export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner_id: string | null
          plan: string | null
          sector: string | null
          settings: Json | null
          team_size: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          owner_id?: string | null
          plan?: string | null
          sector?: string | null
          settings?: Json | null
          team_size?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          plan?: string | null
          sector?: string | null
          settings?: Json | null
          team_size?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      energy_logs: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          level: number
          log_date: string
          note: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          level: number
          log_date?: string
          note?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          level?: number
          log_date?: string
          note?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "energy_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          company_id: string
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string
          role: string | null
          status: string | null
          token: string | null
        }
        Insert: {
          accepted_at?: string | null
          company_id: string
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by: string
          role?: string | null
          status?: string | null
          token?: string | null
        }
        Update: {
          accepted_at?: string | null
          company_id?: string
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string
          role?: string | null
          status?: string | null
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      kpis: {
        Row: {
          company_id: string
          created_at: string | null
          current_value: number | null
          description: string | null
          entered_at: string | null
          id: string
          is_active: boolean | null
          name: string
          owner_id: string | null
          type: string | null
          unit: string | null
          updated_at: string | null
          week_date: string
          weekly_target: number
        }
        Insert: {
          company_id: string
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          entered_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          owner_id?: string | null
          type?: string | null
          unit?: string | null
          updated_at?: string | null
          week_date: string
          weekly_target?: number
        }
        Update: {
          company_id?: string
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          entered_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          owner_id?: string | null
          type?: string | null
          unit?: string | null
          updated_at?: string | null
          week_date?: string
          weekly_target?: number
        }
        Relationships: [
          {
            foreignKeyName: "kpis_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          alignment: string | null
          avatar_url: string | null
          company_id: string | null
          created_at: string | null
          disc_icon: string | null
          disc_letters: string | null
          disc_name: string | null
          disc_pdf_url: string | null
          disc_prime_plan: string | null
          disc_state: string | null
          disc_status: string | null
          disc_temor: string | null
          email: string | null
          full_name: string | null
          id: string
          kpi_name: string | null
          kpi_weekly_target: number | null
          los_level: number | null
          los_target: number | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          alignment?: string | null
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          disc_icon?: string | null
          disc_letters?: string | null
          disc_name?: string | null
          disc_pdf_url?: string | null
          disc_prime_plan?: string | null
          disc_state?: string | null
          disc_status?: string | null
          disc_temor?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          kpi_name?: string | null
          kpi_weekly_target?: number | null
          los_level?: number | null
          los_target?: number | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          alignment?: string | null
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          disc_icon?: string | null
          disc_letters?: string | null
          disc_name?: string | null
          disc_pdf_url?: string | null
          disc_prime_plan?: string | null
          disc_state?: string | null
          disc_status?: string | null
          disc_temor?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          kpi_name?: string | null
          kpi_weekly_target?: number | null
          los_level?: number | null
          los_target?: number | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      scorecards: {
        Row: {
          company_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          is_baseline: boolean | null
          notes: string | null
          score_comunicacion: number | null
          score_cultura: number | null
          score_delegacion: number | null
          score_dinero: number | null
          score_equipo: number | null
          score_liderazgo: number | null
          score_procesos: number | null
          score_tiempo: number | null
          total_score: number | null
          user_id: string
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_baseline?: boolean | null
          notes?: string | null
          score_comunicacion?: number | null
          score_cultura?: number | null
          score_delegacion?: number | null
          score_dinero?: number | null
          score_equipo?: number | null
          score_liderazgo?: number | null
          score_procesos?: number | null
          score_tiempo?: number | null
          total_score?: number | null
          user_id: string
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_baseline?: boolean | null
          notes?: string | null
          score_comunicacion?: number | null
          score_cultura?: number | null
          score_delegacion?: number | null
          score_dinero?: number | null
          score_equipo?: number | null
          score_liderazgo?: number | null
          score_procesos?: number | null
          score_tiempo?: number | null
          total_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scorecards_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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

// Tipos de conveniencia
export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Scorecard = Database["public"]["Tables"]["scorecards"]["Row"];
export type KPI = Database["public"]["Tables"]["kpis"]["Row"];
export type EnergyLog = Database["public"]["Tables"]["energy_logs"]["Row"];
export type Invitation = Database["public"]["Tables"]["invitations"]["Row"];

export type UserRole = "arquitecto" | "colaborador" | "observador";
export type DiscStatus = "pendiente" | "enviado" | "completado";
export type DiscState = "luz" | "sombra";
export type LosLevel = 1 | 2 | 3 | 4 | 5;
export type Alignment = "alta" | "media" | "baja";

export const SCORECARD_AREAS = [
  { key: "score_liderazgo",    label: "Liderazgo",    descripcion: "Tenes claro hacia donde vas y lideras con vision?" },
  { key: "score_equipo",       label: "Equipo",       descripcion: "Tu equipo tiene las personas correctas en los roles correctos?" },
  { key: "score_delegacion",   label: "Delegacion",   descripcion: "Delegas efectivamente o todo depende de vos?" },
  { key: "score_comunicacion", label: "Comunicacion", descripcion: "Tu equipo tiene claridad diaria sobre prioridades y expectativas?" },
  { key: "score_procesos",     label: "Procesos",     descripcion: "Tenes sistemas que permiten operar sin tu presencia constante?" },
  { key: "score_tiempo",       label: "Tiempo",       descripcion: "Tu tiempo esta invertido en lo estrategico, no en lo operativo?" },
  { key: "score_dinero",       label: "Dinero",       descripcion: "Conoces tus numeros y tomas decisiones financieras con datos?" },
  { key: "score_cultura",      label: "Cultura",      descripcion: "Tu equipo tiene valores claros y los vive en el dia a dia?" },
] as const;

export type ScorecardKey = typeof SCORECARD_AREAS[number]["key"];

export const LOS_NAMES: Record<number, string> = {
  1: "Cadete",
  2: "Investigador",
  3: "Recomendador",
  4: "Ejecutor",
  5: "Socio",
};

export function getSemaforo(actual: number, meta: number): "verde" | "amarillo" | "rojo" {
  const pct = meta > 0 ? (actual / meta) * 100 : 0;
  if (pct >= 100) return "verde";
  if (pct >= 85) return "amarillo";
  return "rojo";
}
