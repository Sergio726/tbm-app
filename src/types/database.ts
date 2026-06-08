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
          phone: string | null
          timezone: string | null
          bio: string | null
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
          cargo: string | null
          disc_profile_key: string | null
          disc_scores: Json | null
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
          phone?: string | null
          timezone?: string | null
          bio?: string | null
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
          cargo?: string | null
          disc_profile_key?: string | null
          disc_scores?: Json | null
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
          phone?: string | null
          timezone?: string | null
          bio?: string | null
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
          cargo?: string | null
          disc_profile_key?: string | null
          disc_scores?: Json | null
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
      ritual_configs: {
        Row: {
          company_id: string
          mode: string
          war_up_deadline: string
          cool_down_start: string
          pre_game_reminder: string
          los_5_grandes_reminder: string
          timezone: string
          updated_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          mode?: string
          war_up_deadline?: string
          cool_down_start?: string
          pre_game_reminder?: string
          los_5_grandes_reminder?: string
          timezone?: string
          updated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          mode?: string
          war_up_deadline?: string
          cool_down_start?: string
          pre_game_reminder?: string
          los_5_grandes_reminder?: string
          timezone?: string
          updated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pre_games: {
        Row: {
          id: string
          user_id: string
          company_id: string
          log_date: string
          big_win_1: string | null
          big_win_2: string | null
          big_win_3: string | null
          twenty_mile_march: string | null
          physical_activation: boolean | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          log_date?: string
          big_win_1?: string | null
          big_win_2?: string | null
          big_win_3?: string | null
          twenty_mile_march?: string | null
          physical_activation?: boolean | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          log_date?: string
          big_win_1?: string | null
          big_win_2?: string | null
          big_win_3?: string | null
          twenty_mile_march?: string | null
          physical_activation?: boolean | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      los_5_grandes: {
        Row: {
          id: string
          company_id: string
          user_id: string
          for_date: string
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          for_date: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          for_date?: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      los_5_grandes_items: {
        Row: {
          id: string
          los_5_grandes_id: string
          position: number
          title: string
          rock_label: string | null
          rock_id: string | null
          executed: boolean | null
          executed_at: string | null
          execution_note: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          los_5_grandes_id: string
          position: number
          title: string
          rock_label?: string | null
          rock_id?: string | null
          executed?: boolean | null
          executed_at?: string | null
          execution_note?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          los_5_grandes_id?: string
          position?: number
          title?: string
          rock_label?: string | null
          rock_id?: string | null
          executed?: boolean | null
          executed_at?: string | null
          execution_note?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      war_ups: {
        Row: {
          id: string
          company_id: string
          war_up_date: string
          started_by: string | null
          started_at: string | null
          ended_at: string | null
          status: string
          timer_duration_min: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          war_up_date?: string
          started_by?: string | null
          started_at?: string | null
          ended_at?: string | null
          status?: string
          timer_duration_min?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          war_up_date?: string
          started_by?: string | null
          started_at?: string | null
          ended_at?: string | null
          status?: string
          timer_duration_min?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      war_up_entries: {
        Row: {
          id: string
          war_up_id: string
          user_id: string
          what_today: string | null
          why_today: string | null
          blocker: string | null
          rock_label: string | null
          rock_id: string | null
          validation_status: string | null
          validated_by: string | null
          validated_at: string | null
          validation_note: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          war_up_id: string
          user_id: string
          what_today?: string | null
          why_today?: string | null
          blocker?: string | null
          rock_label?: string | null
          rock_id?: string | null
          validation_status?: string | null
          validated_by?: string | null
          validated_at?: string | null
          validation_note?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          war_up_id?: string
          user_id?: string
          what_today?: string | null
          why_today?: string | null
          blocker?: string | null
          rock_label?: string | null
          rock_id?: string | null
          validation_status?: string | null
          validated_by?: string | null
          validated_at?: string | null
          validation_note?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cool_downs: {
        Row: {
          id: string
          company_id: string
          user_id: string
          log_date: string
          victory_log: string
          reality_check: string | null
          next_day: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          log_date?: string
          victory_log: string
          reality_check?: string | null
          next_day?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          log_date?: string
          victory_log?: string
          reality_check?: string | null
          next_day?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      parking_lot: {
        Row: {
          id: string
          company_id: string
          source: string
          source_entry_id: string | null
          proposed_by: string | null
          title: string
          rationale: string | null
          rock_label: string | null
          status: string
          reviewed_at: string | null
          reviewed_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          source: string
          source_entry_id?: string | null
          proposed_by?: string | null
          title: string
          rationale?: string | null
          rock_label?: string | null
          status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          source?: string
          source_entry_id?: string | null
          proposed_by?: string | null
          title?: string
          rationale?: string | null
          rock_label?: string | null
          status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      weekly_reports: {
        Row: {
          id: string
          company_id: string
          week_start: string
          week_end: string
          generated_at: string | null
          generated_by: string | null
          payload: Json
          created_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          week_start: string
          week_end: string
          generated_at?: string | null
          generated_by?: string | null
          payload?: Json
          created_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          week_start?: string
          week_end?: string
          generated_at?: string | null
          generated_by?: string | null
          payload?: Json
          created_at?: string | null
        }
        Relationships: []
      }
      authority_matrix: {
        Row: {
          company_id: string
          n1_amount: number | null
          n2_min: number | null
          n2_max: number | null
          n3_threshold: number | null
          currency: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          n1_amount?: number | null
          n2_min?: number | null
          n2_max?: number | null
          n3_threshold?: number | null
          currency?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          n1_amount?: number | null
          n2_min?: number | null
          n2_max?: number | null
          n3_threshold?: number | null
          currency?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "authority_matrix_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          id: string
          company_id: string
          created_by: string
          assigned_to: string | null
          what_dod: string
          why_context: string
          how_constraints: string
          when_deadline: string
          check_loop: string
          los_required: number | null
          estimated_cost: number | null
          authority_level: number | null
          status: string
          delegable_flag: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          created_by: string
          assigned_to?: string | null
          what_dod?: string
          why_context?: string
          how_constraints?: string
          when_deadline?: string
          check_loop?: string
          los_required?: number | null
          estimated_cost?: number | null
          authority_level?: number | null
          status?: string
          delegable_flag?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          created_by?: string
          assigned_to?: string | null
          what_dod?: string
          why_context?: string
          how_constraints?: string
          when_deadline?: string
          check_loop?: string
          los_required?: number | null
          estimated_cost?: number | null
          authority_level?: number | null
          status?: string
          delegable_flag?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_updates: {
        Row: {
          id: string
          task_id: string
          user_id: string
          type: string
          content: string | null
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          type: string
          content?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          type?: string
          content?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_updates_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      disc_assessments: {
        Row: {
          id: string
          token: string
          company_id: string
          profile_id: string | null
          full_name: string | null
          cargo: string | null
          email: string | null
          status: string
          answers: Json | null
          raw: Json | null
          segments: Json | null
          profile_key: string | null
          disc_letters: string | null
          ai_narrative: string | null
          created_by: string | null
          created_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          token: string
          company_id: string
          profile_id?: string | null
          full_name?: string | null
          cargo?: string | null
          email?: string | null
          status?: string
          answers?: Json | null
          raw?: Json | null
          segments?: Json | null
          profile_key?: string | null
          disc_letters?: string | null
          ai_narrative?: string | null
          created_by?: string | null
          created_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          token?: string
          company_id?: string
          profile_id?: string | null
          full_name?: string | null
          cargo?: string | null
          email?: string | null
          status?: string
          answers?: Json | null
          raw?: Json | null
          segments?: Json | null
          profile_key?: string | null
          disc_letters?: string | null
          ai_narrative?: string | null
          created_by?: string | null
          created_at?: string | null
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disc_assessments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disc_assessments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rocks: {
        Row: {
          id: string
          company_id: string
          title: string
          owner_id: string | null
          success_criteria: string | null
          start_date: string
          end_date: string
          progress: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          owner_id?: string | null
          success_criteria?: string | null
          start_date?: string
          end_date: string
          progress?: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          owner_id?: string | null
          success_criteria?: string | null
          start_date?: string
          end_date?: string
          progress?: number
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rocks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      rock_updates: {
        Row: {
          id: string
          rock_id: string
          user_id: string
          note: string | null
          progress_at: number | null
          created_at: string
        }
        Insert: {
          id?: string
          rock_id: string
          user_id: string
          note?: string | null
          progress_at?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          rock_id?: string
          user_id?: string
          note?: string | null
          progress_at?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rock_updates_rock_id_fkey"
            columns: ["rock_id"]
            isOneToOne: false
            referencedRelation: "rocks"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_parking: {
        Row: {
          id: string
          company_id: string
          proposed_by: string | null
          idea: string
          rationale: string | null
          parked_at: string
          review_at: string
          status: string
        }
        Insert: {
          id?: string
          company_id: string
          proposed_by?: string | null
          idea: string
          rationale?: string | null
          parked_at?: string
          review_at: string
          status?: string
        }
        Update: {
          id?: string
          company_id?: string
          proposed_by?: string | null
          idea?: string
          rationale?: string | null
          parked_at?: string
          review_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_parking_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      decisions: {
        Row: {
          id: string
          company_id: string
          user_id: string
          decision_text: string
          info_available: number | null
          applied_70_rule: boolean
          disagree_and_commit: boolean
          disagree_with: string | null
          outcome: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          decision_text: string
          info_available?: number | null
          applied_70_rule?: boolean
          disagree_and_commit?: boolean
          disagree_with?: string | null
          outcome?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          decision_text?: string
          info_available?: number | null
          applied_70_rule?: boolean
          disagree_and_commit?: boolean
          disagree_with?: string | null
          outcome?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "decisions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      leading_indicators: {
        Row: {
          id: string
          company_id: string
          name: string
          owner_id: string | null
          weekly_target: number
          current_value: number | null
          week_date: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          owner_id?: string | null
          weekly_target?: number
          current_value?: number | null
          week_date: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          owner_id?: string | null
          weekly_target?: number
          current_value?: number | null
          week_date?: string
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leading_indicators_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          id: string
          company_id: string
          from_user: string
          to_user: string
          type: string
          content: string
          disc_profile_target: string | null
          disc_tone_notes: string | null
          is_draft: boolean
          delivered_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          from_user: string
          to_user: string
          type: string
          content?: string
          disc_profile_target?: string | null
          disc_tone_notes?: string | null
          is_draft?: boolean
          delivered_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          from_user?: string
          to_user?: string
          type?: string
          content?: string
          disc_profile_target?: string | null
          disc_tone_notes?: string | null
          is_draft?: boolean
          delivered_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_from_user_fkey"
            columns: ["from_user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_to_user_fkey"
            columns: ["to_user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workbook_responses: {
        Row: {
          id: string
          company_id: string
          user_id: string
          session_number: number
          exercise_key: string
          response: Json
          completed_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          session_number: number
          exercise_key: string
          response?: Json
          completed_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          session_number?: number
          exercise_key?: string
          response?: Json
          completed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workbook_responses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      workbook_progress: {
        Row: {
          id: string
          company_id: string
          user_id: string
          session_number: number
          pct_complete: number
          weekly_commitment: string | null
          commitment_done: boolean
          unlocked_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          session_number: number
          pct_complete?: number
          weekly_commitment?: string | null
          commitment_done?: boolean
          unlocked_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          session_number?: number
          pct_complete?: number
          weekly_commitment?: string | null
          commitment_done?: boolean
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workbook_progress_company_id_fkey"
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
      get_disc_assessment: {
        Args: { p_token: string }
        Returns: Json
      }
      submit_disc: {
        Args: {
          p_token: string
          p_full_name: string | null
          p_cargo: string | null
          p_email: string | null
          p_answers: Json
          p_raw: Json
          p_segments: Json
          p_profile_key: string
          p_letters: string
          p_disc_name: string | null
          p_disc_icon: string | null
          p_narrative?: string | null
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

// Sprint 2 — Rituales
export type RitualConfig = Database["public"]["Tables"]["ritual_configs"]["Row"];
export type PreGame = Database["public"]["Tables"]["pre_games"]["Row"];
export type Los5Grandes = Database["public"]["Tables"]["los_5_grandes"]["Row"];
export type Los5GrandesItem = Database["public"]["Tables"]["los_5_grandes_items"]["Row"];
export type WarUp = Database["public"]["Tables"]["war_ups"]["Row"];
export type WarUpEntry = Database["public"]["Tables"]["war_up_entries"]["Row"];
export type CoolDown = Database["public"]["Tables"]["cool_downs"]["Row"];
export type ParkingLotItem = Database["public"]["Tables"]["parking_lot"]["Row"];
export type WeeklyReport = Database["public"]["Tables"]["weekly_reports"]["Row"];

export type RitualMode = "daily" | "A" | "B" | "C";
export type WarUpStatus = "pending" | "active" | "closed";
export type ValidationStatus = "with_criteria" | "without_criteria";
export type ParkingSource = "war_up" | "5_grandes" | "manual";
export type ParkingStatus = "parked" | "promoted" | "discarded";

export type UserRole = "arquitecto" | "colaborador" | "observador";

// Sprint 4 — Delegación
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskUpdate = Database["public"]["Tables"]["task_updates"]["Row"];
export type TaskStatus = "pending" | "in_progress" | "blocked" | "done";
export type TaskUpdateType = "progress" | "blocked" | "boomerang_attempt" | "completed" | "stale_alert";
export type DiscStatus = "pendiente" | "enviado" | "completado";
export type DiscState = "luz" | "sombra";
export type LosLevel = 1 | 2 | 3 | 4 | 5;
export type Alignment = "alta" | "media" | "baja";

// Sprint 5 — Feedback S.E.C.
export type Feedback = Database["public"]["Tables"]["feedbacks"]["Row"];
export type FeedbackType = "S" | "E" | "C";

export type Rock = Database["public"]["Tables"]["rocks"]["Row"];
export type RockUpdate = Database["public"]["Tables"]["rock_updates"]["Row"];
export type IdeaParking = Database["public"]["Tables"]["idea_parking"]["Row"];
export type Decision = Database["public"]["Tables"]["decisions"]["Row"];
export type LeadingIndicator = Database["public"]["Tables"]["leading_indicators"]["Row"];
export type RockStatus = "active" | "completed" | "failed" | "archived";
export type IdeaStatus = "parked" | "promoted" | "discarded";

// Sprint 7 — Workbooks Dinámicos
export type WorkbookResponse = Database["public"]["Tables"]["workbook_responses"]["Row"];
export type WorkbookProgress = Database["public"]["Tables"]["workbook_progress"]["Row"];

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
