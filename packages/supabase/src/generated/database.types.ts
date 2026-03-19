/**
 * Generated Supabase database types.
 *
 * This file is the canonical location for output from:
 *   supabase gen types typescript --project-id <id> > src/generated/database.types.ts
 *
 * Manually aligned with migrations in supabase/migrations/ (Task 15.1).
 * Regenerate with `supabase gen types` when linked to a live project.
 *
 * See packages/supabase/README.md for type generation instructions.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole =
  | 'platform_admin'
  | 'platform_support'
  | 'platform_finance'
  | 'gym_owner'
  | 'gym_manager'
  | 'gym_staff'
  | 'gym_instructor'
  | 'gym_receptionist'
  | 'gym_sales'
  | 'branch_manager'
  | 'branch_instructor'
  | 'branch_staff';

export interface Database {
  public: {
    Tables: {
      gyms: {
        Row: {
          id: string;
          name: string;
          slug: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      branches: {
        Row: {
          id: string;
          gym_id: string;
          name: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          name: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          name?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          user_id: string;
          display_name: string;
          avatar_url: string | null;
          locale: string;
          fallback_locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          display_name?: string;
          avatar_url?: string | null;
          locale?: string;
          fallback_locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          display_name?: string;
          avatar_url?: string | null;
          locale?: string;
          fallback_locale?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_role_assignments: {
        Row: {
          id: string;
          user_id: string;
          role: AppRole;
          gym_id: string | null;
          branch_id: string | null;
          granted_at: string;
          granted_by: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: AppRole;
          gym_id?: string | null;
          branch_id?: string | null;
          granted_at?: string;
          granted_by: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: AppRole;
          gym_id?: string | null;
          branch_id?: string | null;
          granted_at?: string;
          granted_by?: string;
        };
      };
      gym_staff: {
        Row: {
          user_id: string;
          gym_id: string;
          branch_id: string | null;
          role: AppRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          gym_id: string;
          branch_id?: string | null;
          role: AppRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          gym_id?: string;
          branch_id?: string | null;
          role?: AppRole;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_events: {
        Row: {
          id: string;
          event_type: string;
          actor_id: string | null;
          target_type: string;
          target_id: string | null;
          payload: Json;
          tenant_context: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          actor_id?: string | null;
          target_type: string;
          target_id?: string | null;
          payload?: Json;
          tenant_context?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_type?: string;
          actor_id?: string | null;
          target_type?: string;
          target_id?: string | null;
          payload?: Json;
          tenant_context?: Json;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
    };
  };
}
